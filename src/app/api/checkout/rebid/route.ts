import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getDodoClient } from '@/lib/dodo';
import { MAX_BID_CENTS, MIN_BID_CENTS, MIN_OUTBID_INCREASE_CENTS } from '@/lib/constants';
import type { CountryCode } from 'dodopayments/resources/misc/supported-countries';

/**
 * POST /api/checkout/rebid
 *
 * Lets an existing active candidate increase their bid without re-submitting the form.
 * The webhook handler already handles updating currentBid when metadata.type === 'bid'.
 *
 * Body: { candidateId: string, newAmountCents: number }
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

    const amountDollars = newAmountCents / 100;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const dodo = getDodoClient();
    const payment = await dodo.payments.create({
      billing: { city: 'N/A', country: 'US' as CountryCode, state: 'N/A', street: 'N/A', zipcode: 0 },
      customer: { email: candidate.email, name: candidate.name },
      product_cart: [
        {
          product_id: process.env.DODO_PRODUCT_ID_BID!,
          quantity: amountDollars,
        },
      ],
      payment_link: true,
      // Return to their own profile page after payment
      return_url: `${appUrl}/candidate/${candidateId}?boosted=1`,
      metadata: {
        type: 'bid',
        candidateId: candidate.id,
        amountCents: String(newAmountCents),
      },
    });

    if (!payment.payment_link) {
      return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
    }

    return NextResponse.json({ paymentLink: payment.payment_link });
  } catch (err) {
    console.error('[checkout/rebid]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}