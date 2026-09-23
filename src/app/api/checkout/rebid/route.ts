import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getRazorpayClient } from '@/lib/razorpay';
import { getCountryCode, getCurrencyForCountry, usdCentsToRazorpay } from '@/lib/currency';
import { MAX_BID_CENTS, MIN_BID_CENTS, MIN_OUTBID_INCREASE_CENTS } from '@/lib/constants';

/**
 * POST /api/checkout/rebid
 *
 * Lets an existing active candidate increase their bid without re-submitting the form.
 * Creates a Razorpay order; the verify endpoint (called by the client after checkout)
 * updates currentBid using the same 'bid' metadata type.
 *
 * Body: { candidateId: string, newAmountCents: number }
 *
 * Response:
 *   { orderId, amount, currency, keyId, candidateId }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateId, newAmountCents } = body;

    if (!candidateId || !newAmountCents) {
      return NextResponse.json({ error: 'Missing candidateId or newAmountCents' }, { status: 400 });
    }

    if (
      !Number.isInteger(newAmountCents) ||
      newAmountCents < MIN_BID_CENTS ||
      newAmountCents > MAX_BID_CENTS
    ) {
      return NextResponse.json(
        { error: `Bid must be between $${MIN_BID_CENTS / 100} and $${MAX_BID_CENTS / 100}` },
        { status: 400 }
      );
    }

    if (newAmountCents % 100 !== 0) {
      return NextResponse.json({ error: 'Bid must be in whole dollars' }, { status: 400 });
    }

    // Fetch the existing candidate
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { id: true, name: true, email: true, currentBid: true, status: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    if (candidate.status !== 'active') {
      return NextResponse.json({ error: 'Candidate listing is not active' }, { status: 400 });
    }
    if (newAmountCents <= candidate.currentBid) {
      return NextResponse.json(
        { error: `New bid must be higher than your current bid of $${candidate.currentBid / 100}` },
        { status: 400 }
      );
    }

    // Enforce outbid rule vs current #1 (skip if this candidate IS #1)
    const currentLeader = await prisma.candidate.findFirst({
      where: { status: 'active' },
      orderBy: [{ currentBid: 'desc' }, { createdAt: 'asc' }],
      select: { id: true, currentBid: true },
    });

    const isCurrentLeader = currentLeader?.id === candidateId;

    if (
      !isCurrentLeader &&
      currentLeader &&
      newAmountCents > currentLeader.currentBid &&
      newAmountCents < currentLeader.currentBid + MIN_OUTBID_INCREASE_CENTS
    ) {
      return NextResponse.json(
        {
          error: `To claim #1 you must bid at least $${(currentLeader.currentBid + MIN_OUTBID_INCREASE_CENTS) / 100}`,
        },
        { status: 400 }
      );
    }

    // The user only pays the top-up (new total minus what they've already paid).
    const topUpCents = newAmountCents - candidate.currentBid;

    // Convert the top-up amount to the user's local currency for the Razorpay order.
    const userCurrency = getCurrencyForCountry(getCountryCode(req.headers));
    const { amount: rzpAmount, currency: rzpCurrency } = await usdCentsToRazorpay(topUpCents, userCurrency);

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: rzpAmount,
      currency: rzpCurrency,
      receipt: `rebid_${candidate.id.slice(0, 27)}`,
      notes: {
        type: 'bid',
        candidateId: candidate.id,
        // usdCents = the NEW TOTAL bid — verify uses this to set currentBid in the DB.
        // The Razorpay order amount is just the top-up; the DB must store the full new bid.
        usdCents: String(newAmountCents),
        topUpCents: String(topUpCents), // informational — not used by verify
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
      candidateId: candidate.id,
      topUpCents, // let the UI show exactly what the user is being charged
    });
  } catch (err: unknown) {
    console.error('[checkout/rebid]', err);
    const rzpErr = err as { statusCode?: number; error?: { description?: string }; message?: string };
    const errorMessage = rzpErr?.error?.description || rzpErr?.message || 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: rzpErr?.statusCode || 500 });
  }
}