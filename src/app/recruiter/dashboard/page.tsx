import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getRecruiterByUserId, getOrCreateRecruiter, getRecruiterUnlocks } from '@/lib/recruiters';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Unlocks — BidForHire',
};

export default async function RecruiterDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/recruiter/signup');

  const userId = (session.user as { id?: string }).id!;
  const userEmail = session.user.email!;

  // Ensure recruiter record exists
  const recruiter = await getOrCreateRecruiter(userId, userEmail);

  const { unlocks, total } = await getRecruiterUnlocks(recruiter.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">My Unlocked Candidates</h1>
          <p className="mt-0.5 text-sm text-muted">
            {total} contact{total !== 1 ? 's' : ''} unlocked · Signed in as{' '}
            <span className="text-white">{userEmail}</span>
          </p>
        </div>
        <Link
          href="/"
          className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:border-white hover:text-white"
        >
          Browse Board →
        </Link>
      </div>

      {unlocks.length === 0 ? (
        <div className="rounded-xl border border-border py-16 text-center">
          <p className="text-muted">You haven&apos;t unlocked any candidates yet.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-accent px-5 py-2.5 font-semibold text-black hover:bg-accent-hover"
          >
            Browse the leaderboard →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {unlocks.map((unlock) => {
            const c = unlock.candidate;
            const social = c.socialLinks as Record<string, string>;

            return (
              <div
                key={unlock.id}
                className="rounded-xl border border-border bg-bg-card p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/candidate/${c.id}`}
                      className="font-semibold text-white hover:text-accent"
                    >
                      {c.name}
                    </Link>
                    <p className="text-sm text-muted">{c.role}</p>
                  </div>
                  <span className="text-xs text-muted">
                    Unlocked {new Date(unlock.unlockedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Contact info */}
                <div className="mt-3 flex flex-col gap-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-10 text-muted">Email</span>
                    <a
                      href={`mailto:${c.email}`}
                      className="font-medium text-accent hover:underline"
                    >
                      {c.email}
                    </a>
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-muted">Phone</span>
                      <a href={`tel:${c.phone}`} className="font-medium text-white">
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
                        className="rounded-md border border-border px-2 py-0.5 text-xs capitalize text-muted hover:border-white hover:text-white"
                      >
                        {key} ↗
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