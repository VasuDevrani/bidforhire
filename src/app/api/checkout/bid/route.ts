import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getRazorpayClient } from '@/lib/razorpay';
import { getCountryCode, getCurrencyForCountry, usdCentsToRazorpay } from '@/lib/currency';
import {
  MAX_BID_CENTS,
  MIN_BID_CENTS,
  MIN_OUTBID_INCREASE_CENTS,
  CATEGORIES,
  CATEGORY_SLUGS,
} from '@/lib/constants';
import { slugify } from '@/lib/utils';

/**
 * POST /api/checkout/bid
 *
 * Creates a pending candidate record and returns a Razorpay order.
 * The client opens the Razorpay checkout modal; on success it calls
 * /api/checkout/verify which activates the candidate.
 *
 * Body:
 *   name, role, category, skills[], summary, socialLinks, email, phone?, amountCents
 *
 * Response:
 *   { orderId, amount, currency, keyId, candidateId }
 */
export async function POST(req: NextRequest) {
  // Track the pending candidate ID so we can clean it up if the Razorpay call fails.
  let pendingCandidateId: string | null = null;

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

    // Create pending candidate — goes live only after payment is verified
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
        category: categorySlug,
        status: 'pending',
      },
    });
    pendingCandidateId = candidate.id;

    // Convert USD cents to the user's local currency for the Razorpay order.
    // The canonical USD-cent value is preserved in notes.usdCents for DB consistency.
    const userCurrency = getCurrencyForCountry(getCountryCode(req.headers));
    const { amount: rzpAmount, currency: rzpCurrency } = await usdCentsToRazorpay(amountCents, userCurrency);

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: rzpAmount,
      currency: rzpCurrency,
      receipt: `bid_${candidate.id.slice(0, 30)}`,
      notes: {
        type: 'bid',
        candidateId: candidate.id,
        usdCents: String(amountCents), // always USD cents — used by verify/webhook for DB writes
      },
    });

    if (!order?.id) {
      await prisma.candidate.delete({ where: { id: candidate.id } });
      pendingCandidateId = null;
      return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }

    // Order created — candidate is safe, no cleanup needed
    pendingCandidateId = null;

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      // NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_ID must be the same value.
      // Fall back to RAZORPAY_KEY_ID so the modal still works if the NEXT_PUBLIC_ var is missing.
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? process.env.RAZORPAY_KEY_ID,
      candidateId: candidate.id,
    });
  } catch (err) {
    // If a pending candidate was created before the error, delete it to avoid orphans
    if (pendingCandidateId) {
      await prisma.candidate.delete({ where: { id: pendingCandidateId } }).catch(() => {
        // best-effort cleanup — ignore secondary errors
      });
    }
    console.error('[checkout/bid]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}