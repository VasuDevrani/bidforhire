import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getLeaderboard, getSiteStats, getRecentActivity } from '@/lib/candidates';
import { LeaderboardRow } from '@/components/LeaderboardRow';
import { BidWidget } from '@/components/BidWidget';
import { CategoryPills } from '@/components/CategoryPills';
import { TimeToggle } from '@/components/TimeToggle';
import { StatsBar } from '@/components/StatsBar';
import { ActivityFeed } from '@/components/ActivityFeed';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BidForHire — Pay-to-Rank Hiring Leaderboard',
};

// Revalidate every 60 seconds so ranks stay fresh without full SSR on every hit
export const revalidate = 60;

interface HomePageProps {
  searchParams: {
    category?: string;
    timeframe?: string;
    page?: string;
  };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const category = searchParams.category;
  const timeframe = (searchParams.timeframe as 'all' | 'week' | 'today') || 'all';
  const page = Number(searchParams.page) || 1;

  // Category is already a slug from the URL, pass directly to DB query
  const categoryFilter = category || undefined;

  const [leaderboard, stats, activity] = await Promise.all([
    getLeaderboard({ category: categoryFilter, timeframe, page }),
    getSiteStats(),
    getRecentActivity(10),
  ]);

  const topBid = leaderboard.candidates[0]?.currentBid ?? 100;

  return (
    <>
      {/* Hero stats bar */}
      <StatsBar
        totalCandidates={stats.totalCandidates}
        totalUnlocks={stats.totalUnlocks}
        totalRevenueCents={stats.totalRevenueCents}
      />

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-stone-900">
            Hiring Leaderboard{' '}
            <span className="inline-flex items-center gap-1.5 text-sm font-normal text-muted">
              <span className="live-dot h-2 w-2 rounded-full bg-accent" />
              live
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Candidates ranked by bid size. Higher bid = more visibility.{' '}
            <Link href="/rules" className="text-accent hover:underline">
              How it works →
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left: leaderboard */}
          <div className="min-w-0 flex-1">
            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <Suspense>
                <CategoryPills />
              </Suspense>
              <Suspense>
                <TimeToggle />
              </Suspense>
            </div>

            {/* Rows */}
            {leaderboard.candidates.length === 0 ? (
              <EmptyState timeframe={timeframe} />
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

            {/* Pagination */}
            {leaderboard.pageCount > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                {Array.from({ length: leaderboard.pageCount }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`?${new URLSearchParams({
                      ...(category ? { category } : {}),
                      ...(timeframe !== 'all' ? { timeframe } : {}),
                      page: String(p),
                    })}`}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-accent text-white'
                        : 'border border-border text-muted hover:text-stone-900'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="w-full lg:w-72 lg:shrink-0">
            <div className="space-y-6">
              <BidWidget topBidCents={topBid} />

              {/* Activity feed */}
              <div className="rounded-xl border border-border bg-bg-card p-4 shadow-sm">
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
                  Live Activity
                </h2>
                <ActivityFeed activities={activity} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function EmptyState({ timeframe }: { timeframe: string }) {
  const message =
    timeframe === 'today'
      ? 'No candidates listed today yet.'
      : timeframe === 'week'
      ? 'No candidates listed this week yet.'
      : 'No candidates yet — be the first!';

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-bg-card py-16 text-center shadow-sm">
      <p className="text-muted">{message}</p>
      <Link
        href="/submit"
        className="rounded-full bg-accent px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Be the first →
      </Link>
    </div>
  );
}