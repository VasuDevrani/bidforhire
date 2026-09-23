import crypto from 'crypto';
import { prisma } from '@/lib/db';
import { updateCandidateRanks } from '@/lib/candidates';

export interface VerifyPaymentParams {
  paymentId: string;
  orderId: string;
  signature: string;
}

export type VerifyPaymentResult =
  | {
      success: true;
      duplicate?: boolean;
      type: string;
      candidateId?: string;
      recruiterId?: string;
    }
  | {
      success: false;
      error: string;
      statusCode: number;
    };

/**
 * Shared server-side helper to verify Razorpay payment HMAC signature,
 * check idempotency against webhooks, and activate candidates/unlocks.
 */
export async function verifyPaymentAndActivate({
  paymentId,
  orderId,
  signature,
}: VerifyPaymentParams): Promise<VerifyPaymentResult> {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('[payment-verification] RAZORPAY_KEY_SECRET is not set');
    return { success: false, error: 'Server misconfigured', statusCode: 500 };
  }

  // Verify the HMAC signature: SHA256(order_id + "|" + payment_id, key_secret)
  const expectedSig = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (expectedSig !== signature) {
    console.warn('[payment-verification] Signature mismatch');
    return { success: false, error: 'Invalid payment signature', statusCode: 400 };
  }

  // Fetch the order from Razorpay to get the canonical notes stored at creation time.
  const rzpCredentials = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
  ).toString('base64');

  const orderRes = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
    headers: { Authorization: `Basic ${rzpCredentials}` },
  });

  if (!orderRes.ok) {
    const errBody = await orderRes.json().catch(() => ({}));
    console.error('[payment-verification] Razorpay order fetch failed', orderRes.status, errBody);
    return { success: false, error: 'Could not retrieve order details', statusCode: 502 };
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
    console.warn('[payment-verification] Order is missing required notes', notes);
    return { success: false, error: 'Invalid order metadata', statusCode: 400 };
  }

  // Idempotency — skip if already processed (webhook may have fired first).
  const [existingBid, existingUnlock] = await Promise.all([
    prisma.bid.findUnique({ where: { paymentId } }),
    prisma.unlock.findUnique({ where: { paymentId } }),
  ]);

  if (existingBid || existingUnlock) {
    return {
      success: true,
      duplicate: true,
      type,
      candidateId,
      recruiterId,
    };
  }

  // ── Process bid (initial bid or rebid) ────────────────────────────────
  if (type === 'bid') {
    const bidAmount = Number(usdCents);
    if (!bidAmount) {
      console.warn('[payment-verification] bid: missing usdCents in order notes');
      return { success: false, error: 'Invalid order metadata', statusCode: 400 };
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

    // Recalculate ranks in bulk (updates both rank and peakRank in SQL)
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

  // ── Process lifetime access purchase ──────────────────────────────────
  } else if (type === 'lifetime_access') {
    if (!recruiterId) {
      console.warn('[payment-verification] lifetime_access: missing recruiterId in order notes');
      return { success: false, error: 'Missing recruiterId in order', statusCode: 400 };
    }

    await prisma.$transaction(async (tx) => {
      await tx.recruiter.update({
        where: { id: recruiterId },
        data: { hasLifetimeAccess: true },
      });

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

  // ── Legacy per-unlock payment ─────────────────────────────────────────
  } else if (type === 'unlock') {
    if (!recruiterId) {
      console.warn('[payment-verification] unlock: missing recruiterId in order notes');
      return { success: false, error: 'Missing recruiterId in order', statusCode: 400 };
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

  } else {
    console.warn('[payment-verification] Unknown payment type:', type);
    return { success: false, error: 'Unknown payment type', statusCode: 400 };
  }

  return {
    success: true,
    duplicate: false,
    type,
    candidateId,
    recruiterId,
  };
}
