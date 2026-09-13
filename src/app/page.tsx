import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLeaderboard, getSiteStats, getRecentActivity, getAllActiveBids } from '@/lib/candidates';
import { LeaderboardRow } from '@/components/LeaderboardRow';
import { TopPodium } from '@/components/TopPodium';
import { BidWidget } from '@/components/BidWidget';
import { CategoryPills } from '@/components/CategoryPills';
import { TimeToggle } from '@/components/TimeToggle';
import { ActivityFeed } from '@/components/ActivityFeed';
import { StickyBidBar } from '@/components/StickyBidBar';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';

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

  const [session, leaderboard, stats, activity, globalTop3, allBids] = await Promise.all([
    getServerSession(authOptions),
    getLeaderboard({ category: categoryFilter, timeframe, page }),
    getSiteStats(),
    getRecentActivity(10),
    getLeaderboard({ page: 1, pageSize: 3 }), // always global all-time top 3 (ignores active filters)
    getAllActiveBids(), // all active bid amounts for rank prediction in BidWidget
  ]);
  const isRecruiter = !!session?.user;

  // Use global #1 bid (not filter-specific) so the widget always reflects the real top
  const topBid = allBids[0] ?? 100;

  return (
    // pb-24 leaves room so the sticky bar doesn't cover the page footer on mobile
    <div className="pb-24 lg:pb-0">
      {/* ── Hero Banner (compact) ──────────────────────────────────────────────────────────────── */}
      <section className="border-b-2 border-border px-4 py-5">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Left: eyebrow + headline + tagline */}
            <div>
              <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border-black-1 border-foreground
                              bg-white px-2.5 py-0.5">
                <span className="live-dot h-2 w-2 rounded-full bg-quaternary" />
                <span className="font-display text-xs font-bold uppercase tracking-widest text-foreground">
                  Live Leaderboard
                </span>
                <span className="text-muted-foreground/50">·</span>
                <span className="font-display text-xs font-bold text-accent">{stats.totalCandidates} candidates</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight
                             text-foreground sm:text-4xl">
                Rank to{' '}
                <span className="gradient-text squiggle-underline">get hired.</span>
              </h1>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Bid for visibility · Recruiters pay to unlock contact
              </p>
            </div>

            {/* Right: CTAs + stats always stacked below */}
            <div className="flex flex-col items-start gap-2">
              {/* Buttons row — never wraps internally */}
              <div className="flex items-center gap-3">
                {/* id is watched by NavbarCta to reveal the navbar button on scroll */}
                <Link
                  id="hero-list-yourself"
                  href="/submit"
                  className="btn-pop flex items-center gap-2 rounded-full border-2 border-foreground
                             bg-accent px-5 py-2 font-display text-sm font-bold text-white shadow-pop"
                >
                  List Yourself
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-accent">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
                {!isRecruiter && (
                  <Link
                    href="/recruiter/signup"
                    className="btn-pop flex items-center gap-2 rounded-full border-2 border-foreground
                               bg-transparent px-5 py-2 font-display text-sm font-bold
                               text-foreground hover:bg-tertiary"
                  >
                    I&apos;m Hiring
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Leaderboard ──────────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 py-10 pt-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left: leaderboard */}
          <div className="min-w-0 flex-1">
            {/* Filters + "Higher bid" hint on the same row */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Suspense>
                <CategoryPills />
              </Suspense>
              <Suspense>
                <TimeToggle />
              </Suspense>
              <p className="ml-auto hidden text-sm font-medium text-muted-foreground sm:block">
                Higher bid = more visibility ·{' '}
                <Link href="/rules" className="inline-flex items-center gap-1 text-accent hover:underline">
                  How it works <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </p>
            </div>

            {/* Rows */}
            {leaderboard.candidates.length === 0 ? (
              <EmptyState timeframe={timeframe} />
            ) : (
              <>
                    {/* Podium — top 3 for the current filters */}
                    {page === 1 && globalTop3.candidates.length >= 1 && (
                      <TopPodium top3={globalTop3.candidates.slice(0, 3)} />
                    )}

              <div className="space-y-4">
                {leaderboard.candidates.map((c, i) => (
                  <LeaderboardRow
                    key={c.id}
                    candidate={c}
                    position={(page - 1) * leaderboard.pageSize + i + 1}
                  />
                ))}
              </div>
              </>
            )}

            {/* Pagination */}
            {leaderboard.pageCount > 1 && (
              <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
                {/* Prev */}
                {page > 1 ? (
                  <Link
                    href={`?${new URLSearchParams({ ...(category ? { category } : {}), ...(timeframe !== 'all' ? { timeframe } : {}), page: String(page - 1) })}`}
                    className="btn-pop flex items-center gap-1.5 rounded-full border-2 border-foreground px-3 py-1.5 font-display text-sm font-bold shadow-pop-sm bg-white text-foreground hover:bg-tertiary"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Prev
                  </Link>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full border-2 border-border px-3 py-1.5 font-display text-sm font-bold text-muted-foreground opacity-40 cursor-not-allowed select-none">
                    <ArrowLeft className="h-3.5 w-3.5" /> Prev
                  </span>
                )}

                {/* Page number window */}
                {buildPageWindow(page, leaderboard.pageCount).map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-1 font-bold text-muted-foreground">…</span>
                  ) : (
                    <Link
                      key={p}
                      href={`?${new URLSearchParams({ ...(category ? { category } : {}), ...(timeframe !== 'all' ? { timeframe } : {}), page: String(p) })}`}
                      className={`btn-pop flex h-9 w-9 items-center justify-center rounded-full border-2 border-foreground font-display text-sm font-bold shadow-pop-sm
                                  ${p === page ? 'bg-accent text-white' : 'bg-white text-foreground hover:bg-tertiary'}`}
                    >
                      {p}
                    </Link>
                  )
                )}

                {/* Next */}
                {page < leaderboard.pageCount ? (
                  <Link
                    href={`?${new URLSearchParams({ ...(category ? { category } : {}), ...(timeframe !== 'all' ? { timeframe } : {}), page: String(page + 1) })}`}
                    className="btn-pop flex items-center gap-1.5 rounded-full border-2 border-foreground px-3 py-1.5 font-display text-sm font-bold shadow-pop-sm bg-white text-foreground hover:bg-tertiary"
                  >
                    Next <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full border-2 border-border px-3 py-1.5 font-display text-sm font-bold text-muted-foreground opacity-40 cursor-not-allowed select-none">
                    Next <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <aside className="w-full lg:w-72 lg:shrink-0">
            <div className="space-y-5">
                {/* Hidden on small screens — the StickyBidBar handles mobile CTAs */}
                <div className="hidden lg:block">
                  <BidWidget topBidCents={topBid} allBidsCents={allBids} />
                </div>

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
      {/* Sticky mobile bid bar — hidden on lg where the sidebar widget is visible */}
      <StickyBidBar topBidCents={topBid} allBidsCents={allBids} />
    </div>
  );
}

/** Returns an array of page numbers and '...' ellipsis markers for the pagination bar. */
function buildPageWindow(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
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
        Be the first <ArrowRight className="h-4 w-4 shrink-0" />
      </Link>
    </div>
  );
}