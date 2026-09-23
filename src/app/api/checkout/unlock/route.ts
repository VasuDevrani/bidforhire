import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getRazorpayClient } from '@/lib/razorpay';
import { getCountryCode, getCurrencyForCountry, usdCentsToRazorpay } from '@/lib/currency';
import { getRecruiterByUserId } from '@/lib/recruiters';
import { LIFETIME_ACCESS_PRICE_CENTS } from '@/lib/constants';

/**
 * POST /api/checkout/unlock
 *
 * Body: { candidateId: string }
 *
 * Creates a Razorpay order for the one-time $10 lifetime access fee.
 * After payment is verified, the recruiter gains unlimited unlocks
 * (subject to the 20/day rate limit) and the specified candidate is
 * unlocked immediately.
 *
 * 409 — recruiter already has lifetime access
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

    // Already a lifetime member — no need to pay again
    if (recruiter.hasLifetimeAccess) {
      return NextResponse.json({ error: 'Already has lifetime access' }, { status: 409 });
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

    // Convert $10 USD to the recruiter's local currency for Razorpay
    const userCurrency = getCurrencyForCountry(getCountryCode(req.headers));
    const { amount: rzpAmount, currency: rzpCurrency } = await usdCentsToRazorpay(
      LIFETIME_ACCESS_PRICE_CENTS,
      userCurrency
    );

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: rzpAmount,
      currency: rzpCurrency,
      receipt: `lifetime_${recruiter.id.slice(0, 24)}`,
      notes: {
        type: 'lifetime_access',
        candidateId,
        recruiterId: recruiter.id,
        usdCents: String(LIFETIME_ACCESS_PRICE_CENTS),
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
  } catch (err: unknown) {
    console.error('[checkout/unlock]', err);
    const rzpErr = err as { statusCode?: number; error?: { description?: string }; message?: string };
    const errorMessage = rzpErr?.error?.description || rzpErr?.message || 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: rzpErr?.statusCode || 500 });
  }
}