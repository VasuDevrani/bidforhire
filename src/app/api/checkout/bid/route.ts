import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getDodoClient } from '@/lib/dodo';
import {
  MAX_BID_CENTS,
  MIN_BID_CENTS,
  MIN_OUTBID_INCREASE_CENTS,
  CATEGORIES,
  CATEGORY_SLUGS,
} from '@/lib/constants';
import { slugify } from '@/lib/utils';
import type { CountryCode } from 'dodopayments/resources/misc/supported-countries';

/**
 * POST /api/checkout/bid
 *
 * Creates a pending candidate record and returns a Dodo payment link.
 * The webhook handler activates the candidate once payment succeeds.
 *
 * Body:
 *   name, role, category, skills[], summary, socialLinks, email, phone?, amountCents
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, category, skills, summary, socialLinks, email, phone, amountCents } = body;

    // Validate required fields
    if (!name || !role || !category || !email || !amountCents) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }
    if (
      !Number.isInteger(amountCents) ||
      amountCents < MIN_BID_CENTS ||
      amountCents > MAX_BID_CENTS
    ) {
      return NextResponse.json(
        { error: `Bid must be between $${MIN_BID_CENTS / 100} and $${MAX_BID_CENTS / 100}` },
        { status: 400 }
      );
    }
    if (amountCents % 100 !== 0) {
      return NextResponse.json({ error: 'Bid must be in whole dollars' }, { status: 400 });
    }

    const currentLeader = await prisma.candidate.findFirst({
      where: { status: 'active' },
      orderBy: [{ currentBid: 'desc' }, { createdAt: 'asc' }],
      select: { currentBid: true },
    });

    if (
      currentLeader &&
      amountCents > currentLeader.currentBid &&
      amountCents < currentLeader.currentBid + MIN_OUTBID_INCREASE_CENTS
    ) {
      return NextResponse.json(
        {
          error: `To take #1 you must bid at least $${(currentLeader.currentBid + MIN_OUTBID_INCREASE_CENTS) / 100} (current #1 is $${currentLeader.currentBid / 100})`,
        },
        { status: 400 }
      );
    }

    const roleSlug = slugify(role);
    const categorySlug = CATEGORY_SLUGS[category] ?? slugify(category);

    // Create pending candidate — goes live only after payment webhook
    const candidate = await prisma.candidate.create({
      data: {
        name: name.trim(),
        role: role.trim(),
        roleSlug,
        skills: Array.isArray(skills) ? skills.slice(0, 10) : [],
        summary: String(summary || '').slice(0, 300),
        socialLinks: socialLinks || {},
        email: email.toLowerCase().trim(),
        phone: phone ? String(phone).trim() : null,
        currentBid: amountCents,
        category: categorySlug, // store slug, display name resolved in UI
        status: 'pending',
      },
    });

    // Create Dodo payment link
    // DODO_PRODUCT_ID_BID must be a product priced at $1.00 in your Dodo dashboard.
    // quantity = amountCents / 100  →  charges the right dollar amount.
    const amountDollars = amountCents / 100;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    const dodo = getDodoClient();
    const payment = await dodo.payments.create({
      billing: { city: 'N/A', country: 'US' as CountryCode, state: 'N/A', street: 'N/A', zipcode: 0 },
      customer: { email: email.toLowerCase().trim(), name: name.trim() },
      product_cart: [
        {
          product_id: process.env.DODO_PRODUCT_ID_BID!,
          quantity: amountDollars,
        },
      ],
      payment_link: true,
      return_url: `${appUrl}/submit/success?candidateId=${candidate.id}`,
      metadata: {
        type: 'bid',
        candidateId: candidate.id,
        amountCents: String(amountCents),
      },
    });

    if (!payment.payment_link) {
      // Cleanup orphaned pending candidate if Dodo didn't give us a link
      await prisma.candidate.delete({ where: { id: candidate.id } });
      return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
    }

    return NextResponse.json({ paymentLink: payment.payment_link, candidateId: candidate.id });
  } catch (err) {
    console.error('[checkout/bid]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}