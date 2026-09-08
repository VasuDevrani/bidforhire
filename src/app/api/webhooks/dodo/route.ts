import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { prisma } from '@/lib/db';
import { updateCandidateRanks } from '@/lib/candidates';

/**
 * POST /api/webhooks/dodo
 *
 * Receives Dodo Payments webhook events.
 * This is the source of truth for all payment state transitions.
 *
 * Dodo webhook payload shape:
 * {
 *   type: "payment.succeeded",
 *   data: {
 *     payload: {
 *       payment_id: string,
 *       total_amount: number,   // in cents
 *       metadata: Record<string, string>,
 *       status: "succeeded",
 *       ...
 *     }
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const webhookSecret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[webhook/dodo] DODO_PAYMENTS_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Verify signature
  try {
    const wh = new Webhook(webhookSecret);
    wh.verify(rawBody, {
      'webhook-id': req.headers.get('webhook-id') ?? '',
      'webhook-timestamp': req.headers.get('webhook-timestamp') ?? '',
      'webhook-signature': req.headers.get('webhook-signature') ?? '',
    });
  } catch (err) {
    console.error('[webhook/dodo] Signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: {
    type: string;
    data: { payload: Record<string, unknown> };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only process succeeded payments
  if (event.type !== 'payment.succeeded') {
    return NextResponse.json({ received: true });
  }

  const payload = event.data?.payload ?? {};
  const paymentId = String(payload.payment_id ?? '');
  const metadata = (payload.metadata ?? {}) as Record<string, string>;
  const totalAmount = Number(payload.total_amount ?? 0); // cents

  if (!paymentId || !metadata.type) {
    console.warn('[webhook/dodo] Missing paymentId or metadata.type');
    return NextResponse.json({ received: true });
  }

  // Idempotency: skip if we've already processed this payment
  const alreadyProcessed =
    (await prisma.bid.findUnique({ where: { dodoPaymentId: paymentId } })) ||
    (await prisma.unlock.findUnique({ where: { dodoPaymentId: paymentId } }));

  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (metadata.type === 'bid') {
      const candidateId = metadata.candidateId;
      const amountCents = Number(metadata.amountCents || totalAmount);

      if (!candidateId || !amountCents) {
        console.warn('[webhook/dodo] bid: missing candidateId or amountCents');
        return NextResponse.json({ received: true });
      }

      await prisma.$transaction(async (tx) => {
        // Check idempotency
        const existingBid = await tx.bid.findUnique({ where: { dodoPaymentId: paymentId } });
        if (existingBid) return; // Already processed

        // Row lock to prevent race conditions
        const locked = await tx.$queryRaw<{ id: string; currentBid: number }[]>`
          SELECT id, "currentBid" FROM "Candidate" WHERE id = ${candidateId} FOR UPDATE
        `;
        if (!locked.length) throw new Error('Candidate not found');

        const current = locked[0];

        // Insert bid record
        await tx.bid.create({
          data: { candidateId, amount: amountCents, dodoPaymentId: paymentId },
        });

        // Only update if this bid is higher than current
        if (amountCents >= current.currentBid) {
          await tx.candidate.update({
            where: { id: candidateId },
            data: {
              currentBid: amountCents,
              status: 'active',
              bidCount: { increment: 1 },
            },
          });
        } else {
          // Still count the bid even if it's not the highest
          await tx.candidate.update({
            where: { id: candidateId },
            data: { bidCount: { increment: 1 } },
          });
        }
      });

      // Recalculate all ranks outside the transaction (non-critical)
      await updateCandidateRanks();

      // Update peakRank for this candidate
      const updated = await prisma.candidate.findUnique({
        where: { id: candidateId },
        select: { rank: true, peakRank: true },
      });
      if (updated?.rank && (!updated.peakRank || updated.rank < updated.peakRank)) {
        await prisma.candidate.update({
          where: { id: candidateId },
          data: { peakRank: updated.rank },
        });
      }
    } else if (metadata.type === 'unlock') {
      const { candidateId, recruiterId } = metadata;

      if (!candidateId || !recruiterId) {
        console.warn('[webhook/dodo] unlock: missing candidateId or recruiterId');
        return NextResponse.json({ received: true });
      }

      await prisma.$transaction(async (tx) => {
        await tx.unlock.create({
          data: { recruiterId, candidateId, dodoPaymentId: paymentId },
        });

        await tx.candidate.update({
          where: { id: candidateId },
          data: { unlockCount: { increment: 1 } },
        });
      });
    }
  } catch (err) {
    console.error('[webhook/dodo] DB error', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}