import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getRecruiterByUserId, getOrCreateRecruiter, getRecruiterUnlocks } from '@/lib/recruiters';
import Link from 'next/link';
import type { Metadata } from 'next';
import { KeyRound, UserSearch, ExternalLink } from 'lucide-react';

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
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent/10 px-3 py-1 text-xs font-bold text-accent shadow-pop-sm">
            <KeyRound className="h-3.5 w-3.5" />
            Recruiter Dashboard
          </div>
          <h1 className="font-display text-3xl font-black text-foreground">My Unlocked Candidates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-bold text-accent">{total}</span> contact{total !== 1 ? 's' : ''} unlocked
            · Signed in as <span className="font-semibold text-foreground">{userEmail}</span>
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full border-2 border-foreground bg-card px-5 py-2.5 text-sm font-bold text-foreground shadow-pop transition-all hover:shadow-pop-hover hover:-translate-y-0.5 active:shadow-pop-active"
        >
          Browse Board →
        </Link>
      </div>

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
            Browse the leaderboard →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {unlocks.map((unlock, i) => {
            const c = unlock.candidate;
            const social = c.socialLinks as Record<string, string>;
            const shadows = ['shadow-pop-violet', 'shadow-pop-pink', 'shadow-pop-amber', 'shadow-pop-emerald'];
            const shadow = shadows[i % shadows.length];

            return (
              <div
                key={unlock.id}
                className={`rounded-2xl border-2 border-foreground bg-card p-5 transition-all hover:-translate-y-0.5 ${shadow}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <Link
                      href={`/candidate/${c.id}`}
                      className="font-bold text-foreground hover:text-accent transition-colors text-lg"
                    >
                      {c.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{c.role}</p>
                  </div>
                  <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground font-medium">
                    Unlocked {new Date(unlock.unlockedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Contact info */}
                <div className="mt-4 rounded-xl border border-border bg-background p-3 space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="w-12 shrink-0 text-xs font-bold uppercase tracking-wide text-muted-foreground">Email</span>
                    <a href={`mailto:${c.email}`} className="font-semibold text-accent hover:underline">
                      {c.email}
                    </a>
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-12 shrink-0 text-xs font-bold uppercase tracking-wide text-muted-foreground">Phone</span>
                      <a href={`tel:${c.phone}`} className="font-semibold text-foreground">
                        {c.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Social links */}
                {Object.keys(social).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(social).map(([key, url]) => (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground px-3 py-1 text-xs font-semibold capitalize text-foreground transition-all hover:bg-accent hover:text-white hover:border-accent shadow-pop-sm"
                      >
                        {key}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}