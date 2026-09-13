import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { hasAlreadyUnlocked, getRecruiterByUserId } from '@/lib/recruiters';
import { FREE_UNLOCKS_PER_RECRUITER } from '@/lib/constants';

/**
 * POST /api/recruiter/unlock-free
 *
 * Body: { candidateId: string }
 *
 * Grants a free unlock if the recruiter has used fewer than FREE_UNLOCKS_PER_RECRUITER unlocks.
 * Creates an Unlock record with a synthetic paymentId ("free_<uuid>") — no Razorpay order needed.
 *
 * 409 — already unlocked
 * 403 — free quota exhausted (client should fall back to /api/checkout/unlock)
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
      select: { id: true },
    });
    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Check if already unlocked by this recruiter
    if (await hasAlreadyUnlocked(recruiter.id, candidateId)) {
      return NextResponse.json({ error: 'Already unlocked' }, { status: 409 });
    }

    // Count all unlocks for this recruiter (paid + free) to enforce quota
    const totalUnlocked = await prisma.unlock.count({ where: { recruiterId: recruiter.id } });
    if (totalUnlocked >= FREE_UNLOCKS_PER_RECRUITER) {
      return NextResponse.json(
        { error: 'No free unlocks remaining', freeExhausted: true },
        { status: 403 }
      );
    }

    // Create the unlock record and bump the candidate's public counter atomically
    await prisma.$transaction([
      prisma.unlock.create({
        data: {
          recruiterId: recruiter.id,
          candidateId,
          paymentId: `free_${crypto.randomUUID()}`,
        },
      }),
      prisma.candidate.update({
        where: { id: candidateId },
        data: { unlockCount: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({ success: true, candidateId });
  } catch (err) {
    console.error('[recruiter/unlock-free]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}