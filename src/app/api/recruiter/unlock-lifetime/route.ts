import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkUnlockRateLimit, hasAlreadyUnlocked, getRecruiterByUserId } from '@/lib/recruiters';

/**
 * POST /api/recruiter/unlock-lifetime
 *
 * Body: { candidateId: string }
 *
 * Grants an unlock to a recruiter who already has lifetime access.
 * No payment is required — the $10 one-time fee was already paid.
 * The 20-unlock/day rate limit still applies.
 *
 * 403 — recruiter does not have lifetime access
 * 409 — already unlocked
 * 429 — daily rate limit reached
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

    if (!recruiter.hasLifetimeAccess) {
      return NextResponse.json({ error: 'Lifetime access required' }, { status: 403 });
    }

    const { candidateId } = await req.json();
    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId is required' }, { status: 400 });
    }

    // Verify candidate exists and is active
    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, status: 'active' },
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Already unlocked by this recruiter
    if (await hasAlreadyUnlocked(recruiter.id, candidateId)) {
      return NextResponse.json({ error: 'Already unlocked' }, { status: 409 });
    }

    // 20 unlocks/day rate limit (applies even for lifetime members)
    if (!(await checkUnlockRateLimit(recruiter.id))) {
      return NextResponse.json(
        { error: 'Daily unlock limit reached (20/day). Try again tomorrow.' },
        { status: 429 }
      );
    }

    // Create the unlock record and bump the candidate's public counter atomically
    await prisma.$transaction([
      prisma.unlock.create({
        data: {
          recruiterId: recruiter.id,
          candidateId,
          paymentId: `lifetime_${crypto.randomUUID()}`,
        },
      }),
      prisma.candidate.update({
        where: { id: candidateId },
        data: { unlockCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true, candidateId });
  } catch (err) {
    console.error('[recruiter/unlock-lifetime]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}