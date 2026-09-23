import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getCandidatePublicProfile, getCandidateContactInfo, recordProfileView } from '@/lib/candidates';
import { FREE_UNLOCKS_PER_RECRUITER } from '@/lib/constants';
import { BoostBidWidget } from '@/components/BoostBidWidget';
import { getRecruiterByUserId } from '@/lib/recruiters';
import { SkillChip } from '@/components/SkillChip';
import { CompanyLogo } from '@/components/CompanyLogo';
import { type CompanyInfo } from '@/lib/companies';
import { UnlockButton } from '@/components/UnlockButton';
import { CandidateAvatar } from '@/components/CandidateAvatar';
import { formatCents, timeAgo } from '@/lib/utils';
import Link from 'next/link';
import {
  ArrowLeft,
  Eye,
  Users,
  Clock,
  Trophy,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  History,
  TrendingUp,
} from 'lucide-react';

const getCandidateForPage = cache((id: string) => getCandidatePublicProfile(id));

interface CandidatePageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: CandidatePageProps): Promise<Metadata> {
  const candidate = await getCandidateForPage(params.id);
  if (!candidate) return { title: 'Candidate Not Found' };
  return {
    title: `${candidate.name} — ${candidate.role} | BidForHire`,
    description: candidate.summary,
  };
}

const RANK_BADGE_STYLE: Record<number, { bg: string; text: string; shadow: string }> = {
  1: { bg: 'bg-accent', text: 'text-white', shadow: 'shadow-pop-violet' },
  2: { bg: 'bg-secondary', text: 'text-white', shadow: 'shadow-pop-pink' },
  3: { bg: 'bg-tertiary', text: 'text-foreground', shadow: 'shadow-pop-amber' },
};

function SocialIcon({ network }: { network: string }) {
  const n = network.toLowerCase();
  if (n.includes('github')) {
    return (
      <svg className="h-3.5 w-3.5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    );
  }
  if (n.includes('linkedin')) {
    return (
      <svg className="h-3.5 w-3.5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    );
  }
  if (n.includes('twitter') || n === 'x') {
    return (
      <svg className="h-3.5 w-3.5 fill-current shrink-0" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  return <ExternalLink className="h-3.5 w-3.5 shrink-0" />;
}

export default async function CandidatePage({ params }: CandidatePageProps) {
  const [candidate, topCandidate, session] = await Promise.all([
    getCandidateForPage(params.id),
    prisma.candidate.findFirst({
      where: { status: 'active' },
      orderBy: [{ currentBid: 'desc' }, { createdAt: 'asc' }],
      select: { currentBid: true },
    }),
    getServerSession(authOptions),
  ]);

  if (!candidate) notFound();

  // Fire-and-forget view count increment
  const headerList = headers();
  const ip = headerList.get('x-forwarded-for') ?? headerList.get('x-real-ip') ?? 'unknown';
  const dateStr = new Date().toISOString().slice(0, 10);
  const viewerHash = crypto.createHash('sha256').update(`${ip}:${dateStr}`).digest('hex');
  recordProfileView(params.id, viewerHash);

  const topBidCents = topCandidate?.currentBid ?? 100;
  const userId = (session?.user as { id?: string })?.id;
  const isAuthenticated = !!session?.user;
  let contactInfo: { email: string; phone: string | null } | null = null;
  let freeUnlocksRemaining = 0;
  let hasLifetimeAccess = false;

  if (userId) {
    const recruiter = await getRecruiterByUserId(userId);
    if (recruiter) {
      hasLifetimeAccess = recruiter.hasLifetimeAccess;
      contactInfo = await getCandidateContactInfo(params.id, recruiter.id);
      if (!contactInfo && !hasLifetimeAccess) {
        const used = await prisma.unlock.count({ where: { recruiterId: recruiter.id } });
        freeUnlocksRemaining = Math.max(0, FREE_UNLOCKS_PER_RECRUITER - used);
      }
    }
  }

  const rank = candidate.rank;
  const rankStyle = rank
    ? RANK_BADGE_STYLE[rank] ?? {
        bg: 'bg-card',
        text: 'text-foreground',
        shadow: 'shadow-pop-sm',
      }
    : null;
  const socialLinks = candidate.socialLinks as Record<string, string>;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top action bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="btn-pop inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-2 font-display text-xs sm:text-sm font-bold text-foreground shadow-pop-sm transition-colors hover:bg-tertiary"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to leaderboard
        </Link>

        <div className="flex items-center gap-2">
          <span className="rounded-full border-2 border-foreground bg-card px-3 py-1 font-display text-xs font-bold text-foreground shadow-pop-sm">
            {candidate.category}
          </span>
          {rank && rankStyle && (
            <span
              className={`rounded-full border-2 border-foreground px-3.5 py-1 font-display text-xs font-black ${rankStyle.bg} ${rankStyle.text} ${rankStyle.shadow}`}
            >
              Leaderboard #{rank}
            </span>
          )}
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
        {/* LEFT COLUMN: Candidate Profile & Proof of Work */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          {/* Hero Profile Card */}
          <div className="rounded-2xl border-2 border-foreground bg-card p-6 sm:p-8 shadow-pop">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              {/* Candidate Avatar with crown & rank ornamentation */}
              <div className="pt-1">
                <CandidateAvatar
                  name={candidate.name}
                  socialLinks={socialLinks}
                  size={84}
                  rank={candidate.rank}
                />
              </div>

              {/* Identity & details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
                    {candidate.name}
                  </h1>
                  {rank && rankStyle && (
                    <span
                      className={`inline-flex items-center justify-center rounded-full border-2 border-foreground px-2.5 py-0.5 text-xs font-black ${rankStyle.bg} ${rankStyle.text} ${rankStyle.shadow}`}
                    >
                      Rank #{rank}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-base sm:text-lg font-bold text-muted-foreground">
                  {candidate.role}
                </p>

                {/* Availability status tag */}
                <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Available for Hire
                </div>

                {/* Previous companies / experience */}
                {Array.isArray(candidate.previousCompanies) &&
                  (candidate.previousCompanies as unknown as CompanyInfo[]).length > 0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                        Track record:
                      </span>
                      {(candidate.previousCompanies as unknown as CompanyInfo[]).map((comp) => (
                        <span
                          key={comp.name}
                          className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground/20 bg-background px-3 py-1 text-xs font-bold text-foreground shadow-xs hover:border-foreground transition-all"
                        >
                          <CompanyLogo company={comp} size={15} showNameTooltip={false} />
                          {comp.name}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 border-t-2 border-foreground/10" />

            {/* Summary / Bio */}
            <div>
              <h2 className="mb-2.5 font-display text-xs font-black uppercase tracking-wider text-muted-foreground">
                About & Impact
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-foreground/90 font-medium whitespace-pre-line">
                {candidate.summary}
              </p>
            </div>

            {/* Skills */}
            {candidate.skills.length > 0 && (
              <div className="mt-6">
                <h2 className="mb-2.5 font-display text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Skills & Tech Stack
                </h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((s) => (
                    <SkillChip key={s} skill={s} />
                  ))}
                </div>
              </div>
            )}

            {/* Social & Portfolio links */}
            {Object.entries(socialLinks).length > 0 && (
              <div className="mt-6 border-t-2 border-foreground/10 pt-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">
                    Verified links:
                  </span>
                  {Object.entries(socialLinks).map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-pop inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-background px-3.5 py-1.5 text-xs font-bold text-foreground shadow-pop-sm hover:bg-accent hover:text-white hover:border-foreground capitalize transition-all"
                    >
                      <SocialIcon network={key} />
                      {key}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Performance Stats Cards */}
          <div>
            <h2 className="mb-3 font-display text-sm font-black uppercase tracking-wider text-muted-foreground">
              Live Engagement & Performance
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                icon={Eye}
                label="Profile Views"
                value={String(candidate.profileViews)}
                sublabel="Unique views"
                color="violet"
              />
              <StatCard
                icon={Users}
                label="Recruiters"
                value={String(candidate.unlockCount)}
                sublabel="Unlocked contacts"
                color="pink"
              />
              <StatCard
                icon={Clock}
                label="Days Listed"
                value={String(candidate.daysListed)}
                sublabel="On leaderboard"
                color="amber"
              />
              <StatCard
                icon={Trophy}
                label="Peak Rank"
                value={candidate.peakRank ? `#${candidate.peakRank}` : '#1'}
                sublabel="Highest achieved"
                color="emerald"
              />
            </div>
          </div>

          {/* Unlocked Contact Details (Shows when already unlocked) */}
          {contactInfo && (
            <div className="rounded-2xl border-2 border-foreground bg-emerald-50/70 p-6 shadow-pop">
              <div className="flex items-center gap-2 text-emerald-800 mb-3">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <h2 className="font-display text-base font-black text-foreground">
                  Direct Contact Info (Unlocked ✓)
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Reach out to {candidate.name} directly. There are no platform recruiter fees or commissions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-3 rounded-xl border-2 border-foreground/15 bg-background p-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent border border-accent/30">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Email</span>
                    <a href={`mailto:${contactInfo.email}`} className="font-bold text-accent hover:underline truncate block">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                {contactInfo.phone && (
                  <div className="flex items-center gap-3 rounded-xl border-2 border-foreground/15 bg-background p-3.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-300">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Phone</span>
                      <a href={`tel:${contactInfo.phone}`} className="font-bold text-foreground hover:underline truncate block">
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Recruiter Actions & Live Auction Console */}
        <div className="space-y-6 lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8">
          {/* 1. Recruiter Unlock Card (If not unlocked) */}
          {!contactInfo && (
            <div className="rounded-2xl border-2 border-foreground bg-card p-6 shadow-pop">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>For Recruiters & Hiring Managers</span>
              </div>

              <h2 className="font-display text-xl font-black text-foreground">
                Want to reach {candidate.name}?
              </h2>
              <p className="mt-1 mb-4 text-xs leading-relaxed text-muted-foreground">
                Unlock direct contact info (email & phone). Interview and hire with zero placement fees.
              </p>

              <UnlockButton
                candidateId={params.id}
                isAuthenticated={isAuthenticated}
                freeUnlocksRemaining={freeUnlocksRemaining}
                hasLifetimeAccess={hasLifetimeAccess}
              />

              <div className="mt-5 border-t border-border pt-4 space-y-2 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Verified contact info guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
                  <span>3 free unlocks with work email</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Live Auction Status Card */}
          <div className="rounded-2xl border-2 border-foreground bg-card p-5 shadow-pop">
            <div className="flex items-center justify-between border-b border-border pb-3.5 mb-3.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                </span>
                <span className="font-display text-xs font-black uppercase tracking-wider text-foreground">
                  Auction Status
                </span>
              </div>
              <span className="rounded-full border border-foreground/20 bg-muted px-2.5 py-0.5 text-xs font-bold text-foreground">
                {candidate.bidCount} {candidate.bidCount === 1 ? 'bid' : 'bids'} placed
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block">Current Active Bid</span>
                <span className="font-display text-3xl font-black text-accent">
                  {formatCents(candidate.currentBid)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-muted-foreground block">Top Site Bid</span>
                <span className="font-display text-lg font-black text-foreground">
                  {formatCents(topBidCents)}
                </span>
              </div>
            </div>

            {/* Recent Bids Feed */}
            {candidate.recentBids.length > 0 && (
              <div className="mt-4 border-t border-border pt-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  <History className="h-3.5 w-3.5" />
                  <span>Bid History</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {candidate.recentBids.map((bid, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-1.5 text-xs"
                    >
                      <span className="font-bold text-accent">{formatCents(bid.amount)}</span>
                      <span className="text-[11px] text-muted-foreground">{timeAgo(bid.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Candidate Boost Console (collapsible drawer for clean dual-audience UX) */}
          <BoostBidWidget
            candidateId={params.id}
            candidateName={candidate.name.split(' ')[0]}
            currentBidCents={candidate.currentBid}
            topBidCents={topBidCents}
            currentRank={candidate.rank}
            collapsible={true}
            defaultOpen={false}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sublabel?: string;
  color: 'violet' | 'pink' | 'amber' | 'emerald';
}) {
  const COLOR_MAP = {
    violet: { bg: 'bg-accent/10', text: 'text-accent', iconBg: 'bg-accent/20' },
    pink: { bg: 'bg-secondary/15', text: 'text-secondary', iconBg: 'bg-secondary/25' },
    amber: { bg: 'bg-tertiary/25', text: 'text-amber-700', iconBg: 'bg-tertiary/40' },
    emerald: { bg: 'bg-quaternary/20', text: 'text-emerald-700', iconBg: 'bg-quaternary/30' },
  };
  const c = COLOR_MAP[color];

  return (
    <div
      className={`rounded-2xl border-2 border-foreground ${c.bg} p-4 shadow-pop-sm transition-all hover:translate-y-[-2px]`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg border border-foreground/20 ${c.iconBg} ${c.text}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className={`mt-2 font-display text-2xl font-black ${c.text}`}>{value}</div>
      {sublabel && (
        <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">{sublabel}</div>
      )}
    </div>
  );
}