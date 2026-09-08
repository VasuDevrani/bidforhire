import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getCandidatePublicProfile, getCandidateContactInfo, recordProfileView } from '@/lib/candidates';
import { getRecruiterByUserId } from '@/lib/recruiters';
import { SkillChip } from '@/components/SkillChip';
import { UnlockButton } from '@/components/UnlockButton';
import { formatCents, rankColor, timeAgo } from '@/lib/utils';
import Link from 'next/link';

interface CandidatePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: CandidatePageProps): Promise<Metadata> {
  const candidate = await getCandidatePublicProfile(params.id);
  if (!candidate) return { title: 'Candidate Not Found' };
  return {
    title: `${candidate.name} — ${candidate.role}`,
    description: candidate.summary,
  };
}

export default async function CandidatePage({ params }: CandidatePageProps) {
  const candidate = await getCandidatePublicProfile(params.id);
  if (!candidate) notFound();

  // Record anonymous profile view (hash of IP + date to deduplicate)
  const headerList = headers();
  const ip = headerList.get('x-forwarded-for') ?? headerList.get('x-real-ip') ?? 'unknown';
  const dateStr = new Date().toISOString().slice(0, 10);
  const viewerHash = crypto.createHash('sha256').update(`${ip}:${dateStr}`).digest('hex');
  await recordProfileView(params.id, viewerHash);

  // Check recruiter auth for unlock status
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  let isAuthenticated = !!session?.user;
  let contactInfo: { email: string; phone: string | null } | null = null;

  if (userId) {
    const recruiter = await getRecruiterByUserId(userId);
    if (recruiter) {
      contactInfo = await getCandidateContactInfo(params.id, recruiter.id);
    }
  }

  const rank = candidate.rank;
  const socialLinks = candidate.socialLinks as Record<string, string>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Back */}
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-white">
        ← Back to leaderboard
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-border bg-bg-card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <h1 className="text-2xl font-black text-white">{candidate.name}</h1>
              {rank && (
                <span className={`text-lg font-black ${rankColor(rank)}`}>#{rank}</span>
              )}
            </div>
            <p className="mt-0.5 text-muted">{candidate.role}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-accent">{formatCents(candidate.currentBid)}</div>
            <div className="text-xs text-muted">current bid</div>
          </div>
        </div>

        {/* Skills */}
        {candidate.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {candidate.skills.map((s) => (
              <SkillChip key={s} skill={s} />
            ))}
          </div>
        )}

        {/* Summary */}
        <p className="mt-4 text-sm leading-relaxed text-muted">{candidate.summary}</p>

        {/* Social links */}
        {Object.entries(socialLinks).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(socialLinks).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-border px-3 py-1 text-xs text-muted capitalize transition-colors hover:border-white hover:text-white"
              >
                {key} ↗
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Profile Views" value={String(candidate.profileViews)} />
        <StatCard label="Recruiters Interested" value={String(candidate.unlockCount)} />
        <StatCard label="Days Listed" value={String(candidate.daysListed)} />
        {candidate.peakRank && (
          <StatCard label="Peak Rank" value={`#${candidate.peakRank}`} accent />
        )}
      </div>

      {/* Contact unlock */}
      <div className="mt-6 rounded-xl border border-border bg-bg-card p-5">
        {contactInfo ? (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-white">Contact Info (Unlocked)</h2>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3">
                <span className="text-muted">Email</span>
                <a href={`mailto:${contactInfo.email}`} className="font-medium text-accent hover:underline">
                  {contactInfo.email}
                </a>
              </div>
              {contactInfo.phone && (
                <div className="flex gap-3">
                  <span className="text-muted">Phone</span>
                  <a href={`tel:${contactInfo.phone}`} className="font-medium text-white">
                    {contactInfo.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="mb-1 text-sm font-semibold text-white">Want to reach {candidate.name}?</h2>
            <p className="mb-4 text-xs text-muted">
              Pay $5 to unlock their email and phone number (if provided). One-time fee, access forever.
            </p>
            <UnlockButton candidateId={params.id} isAuthenticated={isAuthenticated} />
          </div>
        )}
      </div>

      {/* Bid history */}
      {candidate.recentBids.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-bg-card p-5">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
            Bid History
          </h2>
          <ul className="divide-y divide-border">
            {candidate.recentBids.map((bid, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="font-semibold text-accent">{formatCents(bid.amount)}</span>
                <span className="text-muted">{timeAgo(bid.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-bg-card p-3 text-center">
      <div className={`text-xl font-black ${accent ? 'text-accent' : 'text-white'}`}>{value}</div>
      <div className="mt-0.5 text-xs text-muted">{label}</div>
    </div>
  );
}