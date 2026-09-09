import { prisma } from '@/lib/db';
import { UNLOCK_PRICE_CENTS } from '@/lib/constants';
import type { Candidate } from '@prisma/client';

export type PublicCandidate = {
  id: string;
  name: string;
  role: string;
  roleSlug: string;
  skills: string[];
  summary: string;
  socialLinks: Record<string, string>;
  currentBid: number;
  rank: number | null;
  category: string;
  profileViews: number;
  unlockCount: number;
  bidCount: number;
  peakRank: number | null;
  daysListed: number;
  createdAt: Date;
};

/** Strips PII — use this everywhere except the authenticated unlock-check path. */
export function toPublicCandidate(c: Candidate): PublicCandidate {
  return {
    id: c.id,
    name: c.name,
    role: c.role,
    roleSlug: c.roleSlug,
    skills: c.skills,
    summary: c.summary,
    socialLinks: c.socialLinks as Record<string, string>,
    currentBid: c.currentBid,
    rank: c.rank,
    category: c.category,
    profileViews: c.profileViews,
    unlockCount: c.unlockCount,
    bidCount: c.bidCount,
    peakRank: c.peakRank,
    daysListed: c.daysListed,
    createdAt: c.createdAt,
  };
}

export type LeaderboardOptions = {
  category?: string;
  timeframe?: 'all' | 'week' | 'today';
  page?: number;
  pageSize?: number;
};

export async function getLeaderboard(options: LeaderboardOptions = {}) {
  const { category, timeframe = 'all', page = 1, pageSize = 20 } = options;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = { status: 'active' };

  if (category && category !== 'all') {
    where.category = category;
  }

  if (timeframe === 'week') {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    where.createdAt = { gte: start };
  } else if (timeframe === 'today') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    where.createdAt = { gte: start };
  }

  const [candidates, total] = await Promise.all([
    prisma.candidate.findMany({
      where,
      orderBy: [{ currentBid: 'desc' }, { createdAt: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.candidate.count({ where }),
  ]);

  return {
    candidates: candidates.map(toPublicCandidate),
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  };
}

export async function getCandidatePublicProfile(id: string) {
  const candidate = await prisma.candidate.findFirst({
    where: { id, status: 'active' },
    include: {
      bids: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { amount: true, createdAt: true },
      },
    },
  });

  if (!candidate) return null;

  return {
    ...toPublicCandidate(candidate),
    recentBids: candidate.bids,
  };
}

/** Returns email + phone ONLY if an Unlock record exists for this recruiter. */
export async function getCandidateContactInfo(id: string, recruiterId: string) {
  const unlock = await prisma.unlock.findUnique({
    where: { recruiterId_candidateId: { recruiterId, candidateId: id } },
  });
  if (!unlock) return null;

  return prisma.candidate.findUnique({
    where: { id },
    select: { email: true, phone: true, name: true, role: true },
  });
}

export async function recordProfileView(candidateId: string, viewerHash: string) {
  try {
    await prisma.profileView.create({ data: { candidateId, viewerHash } });
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { profileViews: { increment: 1 } },
    });
  } catch (err: unknown) {
    // P2002 = unique constraint violation → already viewed; ignore
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') return;
    console.error('[recordProfileView]', err);
  }
}

export async function updateCandidateRanks() {
  const candidates = await prisma.candidate.findMany({
    where: { status: 'active' },
    orderBy: [{ currentBid: 'desc' }, { createdAt: 'asc' }],
    select: { id: true, peakRank: true },
  });

  await Promise.all(
    candidates.map((c, index) => {
      const newRank = index + 1;
      const newPeak = c.peakRank === null || newRank < c.peakRank ? newRank : c.peakRank;
      return prisma.candidate.update({
        where: { id: c.id },
        data: { rank: newRank, peakRank: newPeak },
      });
    })
  );
}

export async function getSiteStats() {
  const [totalCandidates, totalUnlocks, bidAgg] = await Promise.all([
    prisma.candidate.count({ where: { status: 'active' } }),
    prisma.unlock.count(),
    prisma.bid.aggregate({ _sum: { amount: true } }),
  ]);

  // Revenue = all bid payments + all unlock payments
  const totalRevenueCents = (bidAgg._sum.amount ?? 0) + totalUnlocks * UNLOCK_PRICE_CENTS;

  return { totalCandidates, totalUnlocks, totalRevenueCents };
}

export async function getRecentActivity(limit = 10) {
  const [recentBids, recentUnlocks] = await Promise.all([
    prisma.bid.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        candidate: { select: { name: true, role: true, id: true } },
      },
    }),
    prisma.unlock.findMany({
      orderBy: { unlockedAt: 'desc' },
      take: limit,
      include: {
        candidate: { select: { name: true, role: true, id: true } },
      },
    }),
  ]);

  const activities = [
    ...recentBids.map((b) => ({
      type: 'bid' as const,
      candidateId: b.candidateId,
      candidateName: b.candidate.name,
      candidateRole: b.candidate.role,
      amountCents: b.amount,
      createdAt: b.createdAt,
    })),
    ...recentUnlocks.map((u) => ({
      type: 'unlock' as const,
      candidateId: u.candidateId,
      candidateName: u.candidate.name,
      candidateRole: u.candidate.role,
      amountCents: UNLOCK_PRICE_CENTS,
      createdAt: u.unlockedAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);

  return activities;
}