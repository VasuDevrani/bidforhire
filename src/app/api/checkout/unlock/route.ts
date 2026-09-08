import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getDodoClient } from '@/lib/dodo';
import { checkUnlockRateLimit, hasAlreadyUnlocked, getRecruiterByUserId } from '@/lib/recruiters';
import type { CountryCode } from 'dodopayments/resources/misc/supported-countries';

/**
 * POST /api/checkout/unlock
 *
 * Body: { candidateId: string }
 *
 * Requires recruiter to be authenticated.
 * Creates a Dodo payment link for a $5 contact unlock.
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const dodo = getDodoClient();
    const payment = await dodo.payments.create({
      billing: { city: 'N/A', country: 'US' as CountryCode, state: 'N/A', street: 'N/A', zipcode: 0 },
      customer: { email: recruiter.email, name: recruiter.companyName ?? 'Recruiter' },
      product_cart: [
        {
          product_id: process.env.DODO_PRODUCT_ID_UNLOCK!,
          quantity: 1,
        },
      ],
      payment_link: true,
      return_url: `${appUrl}/recruiter/dashboard?unlocked=${candidateId}`,
      metadata: {
        type: 'unlock',
        candidateId,
        recruiterId: recruiter.id,
      },
    });

    if (!payment.payment_link) {
      return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
    }

    return NextResponse.json({ paymentLink: payment.payment_link });
  } catch (err) {
    console.error('[checkout/unlock]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}