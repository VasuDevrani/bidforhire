import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getRazorpayClient } from '@/lib/razorpay';
import { getCountryCode, getCurrencyForCountry, usdCentsToRazorpay } from '@/lib/currency';
import { checkUnlockRateLimit, hasAlreadyUnlocked, getRecruiterByUserId } from '@/lib/recruiters';
import { UNLOCK_PRICE_CENTS } from '@/lib/constants';

/**
 * POST /api/checkout/unlock
 *
 * Body: { candidateId: string }
 *
 * Requires recruiter to be authenticated.
 * Creates a Razorpay order for the contact unlock fee.
 *
 * Response:
 *   { orderId, amount, currency, keyId, candidateId }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userId = (session.user as { id?: string }).id;
    if (!userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const recruiter = await getRecruiterByUserId(userId);
    if (!recruiter) {
      return NextResponse.json(
        { error: 'Recruiter profile not found. Please complete signup.' },
        { status: 403 }
      );
    }

    const { candidateId } = await req.json();
    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId is required' }, { status: 400 });
    }

    // Verify candidate exists and is active
    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, status: 'active' },
      select: { id: true, name: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Check if already unlocked
    if (await hasAlreadyUnlocked(recruiter.id, candidateId)) {
      return NextResponse.json({ error: 'Already unlocked' }, { status: 409 });
    }

    // Rate limit: max 20 unlocks/day
    if (!(await checkUnlockRateLimit(recruiter.id))) {
      return NextResponse.json(
        { error: 'Daily unlock limit reached (20/day)' },
        { status: 429 }
      );
    }

    // Convert USD cents to the user's local currency for the Razorpay order.
    const userCurrency = getCurrencyForCountry(getCountryCode(req.headers));
    const { amount: rzpAmount, currency: rzpCurrency } = await usdCentsToRazorpay(UNLOCK_PRICE_CENTS, userCurrency);

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: rzpAmount,
      currency: rzpCurrency,
      receipt: `unlock_${candidateId.slice(0, 28)}`,
      notes: {
        type: 'unlock',
        candidateId,
        recruiterId: recruiter.id,
        usdCents: String(UNLOCK_PRICE_CENTS),
      },
    });

    if (!order?.id) {
      return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID,
      candidateId,
    });
  } catch (err) {
    console.error('[checkout/unlock]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}