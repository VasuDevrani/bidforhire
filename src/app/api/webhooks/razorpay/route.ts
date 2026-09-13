import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { updateCandidateRanks } from '@/lib/candidates';

/**
 * POST /api/webhooks/razorpay
 *
 * Receives Razorpay webhook events. Acts as a reliability safety-net:
 * if the user's browser crashes before /api/checkout/verify is called,
 * this handler will still activate the candidate / create the unlock.
 *
 * Razorpay event: order.paid
 * Signature header: x-razorpay-signature
 * Signature algorithm: HMAC-SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET)
 *
 * Configure this URL in your Razorpay Dashboard →
 *   Settings → Webhooks → Add URL → https://<your-domain>/api/webhooks/razorpay
 * Subscribe to the `order.paid` event.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[webhook/razorpay] RAZORPAY_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Verify signature
  const receivedSig = req.headers.get('x-razorpay-signature') ?? '';
  const expectedSig = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (receivedSig !== expectedSig) {
    console.error('[webhook/razorpay] Signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: {
    event: string;
    payload: {
      order?: { entity: { id: string; amount: number; notes: Record<string, string> } };
      payment?: { entity: { id: string; amount: number; status: string } };
    };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only handle order.paid events
  if (event.event !== 'order.paid') {
    return NextResponse.json({ received: true });
  }

  const orderEntity = event.payload?.order?.entity;
  const paymentEntity = event.payload?.payment?.entity;

  if (!orderEntity || !paymentEntity) {
    console.warn('[webhook/razorpay] Missing order or payment entity in payload');
    return NextResponse.json({ received: true });
  }

  const paymentId = paymentEntity.id;
  const notes = orderEntity.notes ?? {};
  const { type, candidateId, usdCents, recruiterId } = notes;

  if (!paymentId || !type || !candidateId) {
    console.warn('[webhook/razorpay] Missing paymentId or order notes');
    return NextResponse.json({ received: true });
  }

  // Idempotency — skip if verify endpoint already processed this payment
  const alreadyProcessed =
    (await prisma.bid.findUnique({ where: { paymentId } })) ||
    (await prisma.unlock.findUnique({ where: { paymentId } }));

  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (type === 'bid') {
      // bidAmount is always in USD cents — the canonical unit stored in the DB
      const bidAmount = Number(usdCents);

      if (!candidateId || !bidAmount) {
        console.warn('[webhook/razorpay] bid: missing candidateId or usdCents');
        return NextResponse.json({ received: true });
      }

      await prisma.$transaction(async (tx) => {
        const existing = await tx.bid.findUnique({ where: { paymentId } });
        if (existing) return;

        const locked = await tx.$queryRaw<{ id: string; currentBid: number }[]>`
          SELECT id, "currentBid" FROM "Candidate" WHERE id = ${candidateId} FOR UPDATE
        `;
        if (!locked.length) throw new Error('Candidate not found');
        const current = locked[0];

        await tx.bid.create({
          data: { candidateId, amount: bidAmount, paymentId },
        });

        if (bidAmount >= current.currentBid) {
          await tx.candidate.update({
            where: { id: candidateId },
            data: { currentBid: bidAmount, status: 'active', bidCount: { increment: 1 } },
          });
        } else {
          await tx.candidate.update({
            where: { id: candidateId },
            data: { bidCount: { increment: 1 } },
          });
        }
      });

      await updateCandidateRanks();

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
    } else if (type === 'lifetime_access') {
      if (!recruiterId) {
        console.warn('[webhook/razorpay] lifetime_access: missing recruiterId');
        return NextResponse.json({ received: true });
      }

      await prisma.$transaction(async (tx) => {
        // Grant lifetime access
        await tx.recruiter.update({
          where: { id: recruiterId },
          data: { hasLifetimeAccess: true },
        });

        // Unlock the specific candidate included in the order notes
        if (candidateId) {
          const existing = await tx.unlock.findUnique({
            where: { recruiterId_candidateId: { recruiterId, candidateId } },
          });
          if (!existing) {
            await tx.unlock.create({
              data: { recruiterId, candidateId, paymentId },
            });
            await tx.candidate.update({
              where: { id: candidateId },
              data: { unlockCount: { increment: 1 } },
            });
          }
        }
      });

    } else if (type === 'unlock') {
      // Legacy per-unlock payment — kept for in-flight orders only
      if (!recruiterId) {
        console.warn('[webhook/razorpay] unlock: missing recruiterId');
        return NextResponse.json({ received: true });
      }

      await prisma.$transaction(async (tx) => {
        await tx.unlock.create({
          data: { recruiterId, candidateId, paymentId },
        });
        await tx.candidate.update({
          where: { id: candidateId },
          data: { unlockCount: { increment: 1 } },
        });
      });
    }
  } catch (err) {
    console.error('[webhook/razorpay] DB error', err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}