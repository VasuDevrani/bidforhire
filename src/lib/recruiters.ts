import { prisma } from '@/lib/db';
import { FREE_EMAIL_DOMAINS, MAX_UNLOCKS_PER_DAY } from '@/lib/constants';

export function isWorkEmail(email: string): boolean {
  const domain = email.trim().split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  return !FREE_EMAIL_DOMAINS.includes(domain);
}

export async function getRecruiterByUserId(userId: string) {
  return prisma.recruiter.findUnique({ where: { userId } });
}

export async function getOrCreateRecruiter(userId: string, email: string, companyName?: string) {
  return prisma.recruiter.upsert({
    where: { userId },
    update: {},
    create: { userId, email, companyName },
  });
}

export async function getRecruiterUnlocks(recruiterId: string, page = 1, pageSize = 20) {
  const [unlocks, total] = await Promise.all([
    prisma.unlock.findMany({
      where: { recruiterId },
      orderBy: { unlockedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
            phone: true,
            socialLinks: true,
          },
        },
      },
    }),
    prisma.unlock.count({ where: { recruiterId } }),
  ]);

  return { unlocks, total, page, pageSize };
}

/** Returns true if recruiter is below daily unlock limit. */
export async function checkUnlockRateLimit(recruiterId: string): Promise<boolean> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const count = await prisma.unlock.count({
    where: { recruiterId, unlockedAt: { gte: start } },
  });
  return count < MAX_UNLOCKS_PER_DAY;
}

export async function hasAlreadyUnlocked(recruiterId: string, candidateId: string): Promise<boolean> {
  const unlock = await prisma.unlock.findUnique({
    where: { recruiterId_candidateId: { recruiterId, candidateId } },
  });
  return !!unlock;
}