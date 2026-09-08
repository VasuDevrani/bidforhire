import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLeaderboard } from '@/lib/candidates';
import { LeaderboardRow } from '@/components/LeaderboardRow';
import { SLUG_TO_CATEGORY } from '@/lib/constants';
import Link from 'next/link';

interface RolePageProps {
  params: { roleSlug: string };
  searchParams: { page?: string };
}

export async function generateMetadata({ params }: RolePageProps): Promise<Metadata> {
  const displayName = SLUG_TO_CATEGORY[params.roleSlug];
  if (!displayName) return { title: 'Not Found' };
  return {
    title: `Top ${displayName} Candidates for Hire — BidForHire`,
    description: `Browse the top ${displayName} candidates ranked by bid on BidForHire.`,
  };
}

export const revalidate = 60;

export default async function RolePage({ params, searchParams }: RolePageProps) {
  // The slug IS the category stored in DB
  const category = params.roleSlug;
  // Validate it's a known category slug
  const displayName = SLUG_TO_CATEGORY[category];
  if (!displayName) notFound();

  const page = Number(searchParams.page) || 1;
  const leaderboard = await getLeaderboard({ category, page });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-white">
        ← All categories
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Top {displayName} Candidates</h1>
        <p className="mt-1 text-sm text-muted">
          {leaderboard.total} candidate{leaderboard.total !== 1 ? 's' : ''} · Ranked by bid
        </p>
      </div>

      {leaderboard.candidates.length === 0 ? (
        <div className="rounded-xl border border-border py-16 text-center">
          <p className="text-muted">No {displayName} candidates yet.</p>
          <Link
            href={`/submit`}
            className="mt-4 inline-block rounded-lg bg-accent px-5 py-2.5 font-semibold text-black hover:bg-accent-hover"
          >
            Be the first →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.candidates.map((c, i) => (
            <LeaderboardRow
              key={c.id}
              candidate={c}
              position={(page - 1) * leaderboard.pageSize + i + 1}
            />
          ))}
        </div>
      )}

      {leaderboard.pageCount > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: leaderboard.pageCount }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?page=${p}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-accent text-black'
                  : 'border border-border text-muted hover:text-white'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}