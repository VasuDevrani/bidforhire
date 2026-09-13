import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { updateCandidateRanks } from '@/lib/candidates';

/**
 * POST /api/checkout/verify
 *
 * Called by the client immediately after the Razorpay checkout modal reports
 * success. Verifies the payment signature, fetches the order from Razorpay
 * to read the canonical metadata (type, candidateId, etc.), then activates
 * the candidate / creates the unlock record.
 *
 * Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 *
 * The order notes set during /api/checkout/{bid|unlock|rebid} are the
 * authoritative source of metadata — we never trust client-supplied candidateId
 * for the activation step.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment fields' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error('[checkout/verify] RAZORPAY_KEY_SECRET is not set');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // Verify the HMAC signature: SHA256(order_id + "|" + payment_id, key_secret)
    const expectedSig = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      console.warn('[checkout/verify] Signature mismatch');
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Idempotency — skip if already processed (webhook may have fired first).
    // Run both checks in parallel — they're independent DB reads.
    const [existingBid, existingUnlock] = await Promise.all([
      prisma.bid.findUnique({ where: { paymentId: razorpay_payment_id } }),
      prisma.unlock.findUnique({ where: { paymentId: razorpay_payment_id } }),
    ]);
    const alreadyProcessed = existingBid || existingUnlock;

    if (alreadyProcessed) {
      return NextResponse.json({ success: true, duplicate: true });
    }

    // Fetch the order from Razorpay to get the canonical notes we stored at creation time.
    // We call the REST API directly here rather than via the singleton client so we always
    // use the current env-var credentials without relying on the cached Razorpay instance.
    const rzpCredentials = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString('base64');

    const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${razorpay_order_id}`, {
      headers: { Authorization: `Basic ${rzpCredentials}` },
    });

    if (!orderRes.ok) {
      const errBody = await orderRes.json().catch(() => ({}));
      console.error('[checkout/verify] Razorpay order fetch failed', orderRes.status, errBody);
      return NextResponse.json({ error: 'Could not retrieve order details' }, { status: 502 });
    }

    const order = (await orderRes.json()) as {
      id: string;
      amount: number;
      currency: string;
      notes: Record<string, string>;
    };

    const notes = order.notes ?? {};
    const { type, candidateId, usdCents, recruiterId } = notes;

    if (!type || !candidateId) {
      console.warn('[checkout/verify] Order is missing required notes', notes);
      return NextResponse.json({ error: 'Invalid order metadata' }, { status: 400 });
    }

    // ── Process bid (initial bid or rebid) ────────────────────────────────
    if (type === 'bid') {
      // bidAmount is always in USD cents — the canonical unit stored in the DB
      const bidAmount = Number(usdCents);
      if (!bidAmount) {
        console.warn('[checkout/verify] bid: missing usdCents in order notes');
        return NextResponse.json({ error: 'Invalid order metadata' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        // Inner idempotency check inside the transaction
        const existing = await tx.bid.findUnique({ where: { paymentId: razorpay_payment_id } });
        if (existing) return;

        // Row-lock the candidate to prevent race conditions with concurrent webhooks
        const locked = await tx.$queryRaw<{ id: string; currentBid: number }[]>`
          SELECT id, "currentBid" FROM "Candidate" WHERE id = ${candidateId} FOR UPDATE
        `;
        if (!locked.length) throw new Error('Candidate not found');
        const current = locked[0];

        await tx.bid.create({
          data: { candidateId, amount: bidAmount, paymentId: razorpay_payment_id },
        });

        if (bidAmount >= current.currentBid) {
          await tx.candidate.update({
            where: { id: candidateId },
            data: {
              currentBid: bidAmount,
              status: 'active',
              bidCount: { increment: 1 },
            },
          });
        } else {
          await tx.candidate.update({
            where: { id: candidateId },
            data: { bidCount: { increment: 1 } },
          });
        }
      });

      // Recalculate all ranks + peakRank in one bulk SQL statement (non-critical, outside transaction)
      await updateCandidateRanks();

    // ── Process unlock ────────────────────────────────────────────────────
    // ── Process lifetime access purchase ─────────────────────────────────────
    } else if (type === 'lifetime_access') {
      if (!recruiterId) {
        console.warn('[checkout/verify] lifetime_access: missing recruiterId in order notes');
        return NextResponse.json({ error: 'Missing recruiterId in order' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        // Grant lifetime access (idempotent update)
        await tx.recruiter.update({
          where: { id: recruiterId },
          data: { hasLifetimeAccess: true },
        });

        // Also immediately unlock the specific candidate they were purchasing for
        if (candidateId) {
          const existing = await tx.unlock.findUnique({
            where: { recruiterId_candidateId: { recruiterId, candidateId } },
          });
          if (!existing) {
            await tx.unlock.create({
              data: { recruiterId, candidateId, paymentId: razorpay_payment_id },
            });
            await tx.candidate.update({
              where: { id: candidateId },
              data: { unlockCount: { increment: 1 } },
            });
          }
        }
      });

    // ── Legacy per-unlock payment (kept for in-flight orders) ────────────────
    } else if (type === 'unlock') {
      if (!recruiterId) {
        console.warn('[checkout/verify] unlock: missing recruiterId in order notes');
        return NextResponse.json({ error: 'Missing recruiterId in order' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.unlock.create({
          data: { recruiterId, candidateId, paymentId: razorpay_payment_id },
        });
        await tx.candidate.update({
          where: { id: candidateId },
          data: { unlockCount: { increment: 1 } },
        });
      });

    } else {
      console.warn('[checkout/verify] Unknown payment type:', type);
      return NextResponse.json({ error: 'Unknown payment type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[checkout/verify] DB error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}