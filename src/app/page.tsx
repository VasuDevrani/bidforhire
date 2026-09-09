import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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
  const categoryFilter = category || undefined;

  const [session, leaderboard, stats, activity] = await Promise.all([
    getServerSession(authOptions),
    getLeaderboard({ category: categoryFilter, timeframe, page }),
    getSiteStats(),
    getRecentActivity(10),
  ]);
  const isRecruiter = !!session?.user;

  const topBid = leaderboard.candidates[0]?.currentBid ?? 100;

  return (
    <>
      {/* ── Marquee Stats Band ─────────────────────────────────── */}
      <StatsBar
        totalCandidates={stats.totalCandidates}
        totalUnlocks={stats.totalUnlocks}
        totalRevenueCents={stats.totalRevenueCents}
      />

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b-2 border-border px-4 py-16 dot-grid">
        {/* Decorative confetti shapes */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Big violet circle — top left */}
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-tertiary/30 animate-float-slow" />
          {/* Pink blob — bottom right */}
          <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-secondary/20 animate-float" />
          {/* Small emerald circle */}
          <div className="absolute right-1/4 top-8 h-12 w-12 rounded-full border-4 border-quaternary bg-quaternary/30 animate-float-rev" />
          {/* Floating triangle (via clip) */}
          <div
            className="absolute left-1/3 bottom-8 h-10 w-10 bg-accent/30 animate-float"
            style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
          />
          {/* Stripe-fill square */}
          <div className="stripe-fill absolute right-12 top-12 h-20 w-20 rounded-lg border-2 border-accent/40 opacity-60 rotate-12" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-2xl">
            {/* Eyebrow pill */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-foreground
                            bg-white px-3 py-1 shadow-pop-sm">
              <span className="live-dot h-2 w-2 rounded-full bg-quaternary" />
              <span className="font-display text-xs font-bold uppercase tracking-widest text-foreground">
                Live Leaderboard
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tight
                           text-foreground sm:text-6xl lg:text-7xl">
              Rank to{' '}
              <span className="gradient-text squiggle-underline">get hired.</span>
            </h1>

            <p className="mt-5 max-w-lg text-lg font-medium text-muted-foreground">
              Candidates bid for visibility. Recruiters pay to unlock contact info.
              The open hiring leaderboard - no gatekeepers, just bids.
            </p>

            {/* CTA row */}
            <div className="mt-8 flex flex-wrap gap-3">
              {/* Primary candy button */}
              <Link
                href="/submit"
                className="btn-pop flex items-center gap-2 rounded-full border-2 border-foreground
                           bg-accent px-6 py-3 font-display text-base font-bold text-white shadow-pop"
              >
                List Yourself
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm text-accent font-bold">
                  →
                </span>
              </Link>

              {/* "I'm Hiring" only shown to non-recruiters */}
              {!isRecruiter && (
                <Link
                  href="/recruiter/signup"
                  className="btn-pop flex items-center gap-2 rounded-full border-2 border-foreground
                             bg-transparent px-6 py-3 font-display text-base font-bold
                             text-foreground hover:bg-tertiary"
                >
                  I&apos;m Hiring
                </Link>
              )}
            </div>

            {/* Mini stats strip */}
            <div className="mt-8 flex flex-wrap gap-6">
              {[
                { value: String(stats.totalCandidates), label: 'Candidates' },
                { value: String(stats.totalUnlocks),    label: 'Unlocks'    },
              ].map(({ value, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="font-display text-2xl font-extrabold text-accent">{value}</span>
                  <span className="text-sm font-medium text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Leaderboard ─────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Section header */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-extrabold text-foreground">
            Hiring Leaderboard
          </h2>
          <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground
                           bg-secondary px-3 py-1 font-display text-xs font-bold text-white shadow-pop-sm">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-white" />
            live
          </span>
          <p className="ml-auto hidden text-sm font-medium text-muted-foreground sm:block">
            Higher bid = more visibility ·{' '}
            <Link href="/rules" className="text-accent hover:underline">
              How it works →
            </Link>
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left: leaderboard */}
          <div className="min-w-0 flex-1">
            {/* Filters */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
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
              <div className="space-y-4">
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
              <div className="mt-8 flex justify-center gap-2">
                {Array.from({ length: leaderboard.pageCount }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`?${new URLSearchParams({
                      ...(category ? { category } : {}),
                      ...(timeframe !== 'all' ? { timeframe } : {}),
                      page: String(p),
                    })}`}
                    className={`btn-pop rounded-full border-2 border-foreground px-3 py-1.5
                                font-display text-sm font-bold shadow-pop-sm
                                ${p === page
                                  ? 'bg-accent text-white'
                                  : 'bg-white text-foreground hover:bg-tertiary'
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
            <div className="space-y-5">
              <BidWidget topBidCents={topBid} />

              {/* Activity feed */}
              <div className="rounded-xl border-2 border-border bg-card p-4 shadow-pop-sm">
                <h2 className="mb-3 font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                  Live Activity ⚡
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
    <div className="flex flex-col items-center gap-5 rounded-xl border-2 border-border
                    bg-card py-16 text-center shadow-pop-sm">
      <span className="text-5xl animate-float">🌟</span>
      <p className="font-medium text-muted-foreground">{message}</p>
      <Link
        href="/submit"
        className="btn-pop flex items-center gap-2 rounded-full border-2 border-foreground
                   bg-accent px-6 py-2.5 font-display text-sm font-bold text-white shadow-pop"
      >
        Be the first →
      </Link>
    </div>
  );
}