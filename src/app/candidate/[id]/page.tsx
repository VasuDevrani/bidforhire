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
import { formatCents, timeAgo } from '@/lib/utils';
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

const RANK_COLORS = [
  { bg: 'bg-accent', text: 'text-white', shadow: 'shadow-pop-violet' },
  { bg: 'bg-secondary', text: 'text-white', shadow: 'shadow-pop-pink' },
  { bg: 'bg-tertiary', text: 'text-foreground', shadow: 'shadow-pop-amber' },
  { bg: 'bg-quaternary', text: 'text-foreground', shadow: 'shadow-pop-emerald' },
];

export default async function CandidatePage({ params }: CandidatePageProps) {
  const candidate = await getCandidatePublicProfile(params.id);
  if (!candidate) notFound();

  const headerList = headers();
  const ip = headerList.get('x-forwarded-for') ?? headerList.get('x-real-ip') ?? 'unknown';
  const dateStr = new Date().toISOString().slice(0, 10);
  const viewerHash = crypto.createHash('sha256').update(`${ip}:${dateStr}`).digest('hex');
  await recordProfileView(params.id, viewerHash);

  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  const isAuthenticated = !!session?.user;
  let contactInfo: { email: string; phone: string | null } | null = null;

  if (userId) {
    const recruiter = await getRecruiterByUserId(userId);
    if (recruiter) {
      contactInfo = await getCandidateContactInfo(params.id, recruiter.id);
    }
  }

  const rank = candidate.rank;
  const rankStyle = rank ? RANK_COLORS[(rank - 1) % RANK_COLORS.length] : null;
  const socialLinks = candidate.socialLinks as Record<string, string>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Back */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        ← Back to leaderboard
      </Link>

      {/* Header card */}
      <div className="rounded-2xl border-2 border-foreground bg-card p-6 shadow-pop">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-3 flex-wrap">
              <h1 className="font-display text-2xl font-black text-foreground">{candidate.name}</h1>
              {rank && rankStyle && (
                <span
                  className={`inline-flex items-center justify-center h-8 w-8 rounded-full border-2 border-foreground text-sm font-black ${rankStyle.bg} ${rankStyle.text} ${rankStyle.shadow}`}
                >
                  #{rank}
                </span>
              )}
            </div>
            <p className="mt-1 text-muted-foreground font-medium">{candidate.role}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="font-display text-2xl font-black text-accent">{formatCents(candidate.currentBid)}</div>
            <div className="text-xs text-muted-foreground">current bid</div>
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
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{candidate.summary}</p>

        {/* Social links */}
        {Object.entries(socialLinks).length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(socialLinks).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border-2 border-foreground px-3 py-1 text-xs font-semibold text-foreground capitalize transition-all hover:bg-accent hover:text-white hover:border-accent shadow-pop-sm"
              >
                {key} ↗
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Profile Views" value={String(candidate.profileViews)} color="violet" />
        <StatCard label="Recruiters Interested" value={String(candidate.unlockCount)} color="pink" />
        <StatCard label="Days Listed" value={String(candidate.daysListed)} color="amber" />
        {candidate.peakRank && (
          <StatCard label="Peak Rank" value={`#${candidate.peakRank}`} color="emerald" />
        )}
      </div>

      {/* Contact unlock */}
      <div className="mt-4 rounded-2xl border-2 border-foreground bg-card p-5 shadow-pop">
        {contactInfo ? (
          <div>
            <h2 className="mb-3 text-sm font-bold text-foreground uppercase tracking-wider">Contact Info (Unlocked ✓)</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-12 text-muted-foreground font-medium">Email</span>
                <a href={`mailto:${contactInfo.email}`} className="font-semibold text-accent hover:underline">
                  {contactInfo.email}
                </a>
              </div>
              {contactInfo.phone && (
                <div className="flex items-center gap-3">
                  <span className="w-12 text-muted-foreground font-medium">Phone</span>
                  <a href={`tel:${contactInfo.phone}`} className="font-semibold text-foreground">
                    {contactInfo.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="mb-1 font-bold text-foreground">Want to reach {candidate.name}?</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Pay $5 to unlock their email and phone number (if provided). One-time fee, access forever.
            </p>
            <UnlockButton candidateId={params.id} isAuthenticated={isAuthenticated} />
          </div>
        )}
      </div>

      {/* Bid history */}
      {candidate.recentBids.length > 0 && (
        <div className="mt-4 rounded-2xl border-2 border-foreground bg-card p-5 shadow-pop">
          <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-muted-foreground">
            Bid History
          </h2>
          <ul className="divide-y divide-border">
            {candidate.recentBids.map((bid, i) => (
              <li key={i} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-bold text-accent">{formatCents(bid.amount)}</span>
                <span className="text-muted-foreground">{timeAgo(bid.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const COLOR_MAP = {
  violet:  { bg: 'bg-accent/10',     text: 'text-accent',      border: 'border-accent/30' },
  pink:    { bg: 'bg-secondary/10',  text: 'text-secondary',   border: 'border-secondary/30' },
  amber:   { bg: 'bg-tertiary/20',   text: 'text-amber-600',   border: 'border-tertiary/50' },
  emerald: { bg: 'bg-quaternary/10', text: 'text-quaternary',  border: 'border-quaternary/30' },
};

function StatCard({ label, value, color }: { label: string; value: string; color: keyof typeof COLOR_MAP }) {
  const c = COLOR_MAP[color];
  return (
    <div className={`rounded-xl border-2 border-foreground ${c.bg} p-3 text-center shadow-pop-sm`}>
      <div className={`font-display text-xl font-black ${c.text}`}>{value}</div>
      <div className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</div>
    </div>
  );
}