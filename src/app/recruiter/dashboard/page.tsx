import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOrCreateRecruiter, getRecruiterUnlocks } from '@/lib/recruiters';
import Link from 'next/link';
import type { Metadata } from 'next';
import { KeyRound, UserSearch, ExternalLink, ArrowRight, Infinity, Mail, Phone } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Unlocks — BidForHire',
};

export default async function RecruiterDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/recruiter/signup');

  const userId = (session.user as { id?: string }).id!;
  const userEmail = session.user.email!;

  const recruiter = await getOrCreateRecruiter(userId, userEmail);
  const { unlocks, total } = await getRecruiterUnlocks(recruiter.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="mb-8">
        {/* Badges row */}
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-accent/10 px-3 py-1 text-xs font-bold text-accent shadow-pop-sm">
            <KeyRound className="h-3.5 w-3.5" />
            Recruiter Dashboard
          </div>
          {recruiter.hasLifetimeAccess ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-accent px-3 py-1 text-xs font-bold text-white shadow-pop-sm">
              <Infinity className="h-3.5 w-3.5" />
              Lifetime Member
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-amber-100 dark:bg-amber-950/50 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-200 shadow-pop-sm">
              {Math.max(0, 3 - total)} of 3 Free Unlocks Remaining
            </div>
          )}
        </div>

        {/* Title + Browse Board on same row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-black text-foreground">My Unlocked Candidates</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-bold text-accent">{total}</span> contact{total !== 1 ? 's' : ''} unlocked
              {' · '}Signed in as <span className="font-semibold text-foreground">{userEmail}</span>
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-5 py-2.5 text-sm font-bold text-foreground shadow-pop transition-all hover:shadow-pop-hover hover:-translate-y-0.5 active:shadow-pop-active shrink-0"
          >
            Browse Board <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────────────── */}
      {unlocks.length === 0 ? (
        <div className="rounded-2xl border-2 border-foreground bg-card py-16 text-center shadow-pop">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-foreground bg-accent/10 shadow-pop-violet">
            <UserSearch className="h-7 w-7 text-accent" />
          </div>
          <p className="font-medium text-muted-foreground">You haven&apos;t unlocked any candidates yet.</p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent px-6 py-2.5 font-bold text-white shadow-pop transition-all hover:shadow-pop-hover hover:-translate-y-0.5"
          >
            Browse the leaderboard <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      ) : (
        /* ── Candidate list ──────────────────────────────────────── */
        <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
          {unlocks.map((unlock) => {
            const c = unlock.candidate;
            const social = c.socialLinks as Record<string, string>;
            const unlockedDate = new Date(unlock.unlockedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={unlock.id} className="flex flex-col gap-2 px-5 py-4 bg-card hover:bg-muted/30 transition-colors">
                {/* Row 1: name · role ··· date */}
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <Link
                      href={`/candidate/${c.id}`}
                      className="font-bold text-foreground hover:text-accent transition-colors text-base truncate"
                    >
                      {c.name}
                    </Link>
                    <span className="text-sm text-muted-foreground shrink-0">· {c.role}</span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    Unlocked {unlockedDate}
                  </span>
                </div>

                {/* Row 2: contact + socials */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                  {/* Email */}
                  <a
                    href={`mailto:${c.email}`}
                    className="inline-flex items-center gap-1.5 text-accent hover:underline font-medium"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {c.email}
                  </a>

                  {/* Phone */}
                  {c.phone && (
                    <a
                      href={`tel:${c.phone}`}
                      className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {c.phone}
                    </a>
                  )}

                  {/* Social links */}
                  {Object.entries(social).map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold capitalize text-muted-foreground hover:text-accent transition-colors"
                    >
                      {key}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}