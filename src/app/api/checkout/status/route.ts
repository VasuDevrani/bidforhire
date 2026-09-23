import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/checkout/status?candidateId=...&flow=...&minBid=...
 *
 * Polled by client-side components when the browser regains focus or when the
 * Razorpay modal is dismissed. This detects if background webhooks have already
 * processed the payment while the mobile browser tab was in the background.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const candidateId = url.searchParams.get('candidateId');
  const flow = url.searchParams.get('flow');
  const minBidStr = url.searchParams.get('minBid');

  if (!candidateId) {
    return NextResponse.json({ error: 'Missing candidateId' }, { status: 400 });
  }

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { status: true, currentBid: true },
    });

    if (!candidate) {
      return NextResponse.json({ completed: false });
    }

    if (flow === 'submit') {
      return NextResponse.json({ completed: candidate.status === 'active' });
    }

    if (flow === 'boost') {
      const minBid = minBidStr ? parseInt(minBidStr, 10) : 0;
      return NextResponse.json({
        completed: candidate.status === 'active' && candidate.currentBid >= minBid,
      });
    }

    if (flow === 'unlock') {
      const recruiterId = url.searchParams.get('recruiterId');
      if (recruiterId) {
        const recruiter = await prisma.recruiter.findUnique({
          where: { id: recruiterId },
          select: { hasLifetimeAccess: true },
        });
        if (recruiter?.hasLifetimeAccess) {
          return NextResponse.json({ completed: true });
        }
      }
      const unlock = await prisma.unlock.findFirst({
        where: { candidateId },
      });
      return NextResponse.json({ completed: !!unlock });
    }

    return NextResponse.json({ completed: candidate.status === 'active' });
  } catch (err) {
    console.error('[checkout/status] error:', err);
    return NextResponse.json({ completed: false });
  }
}
