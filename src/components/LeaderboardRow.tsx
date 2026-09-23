import Link from 'next/link';
import { ArrowRight, Eye, Crown } from 'lucide-react';
import { SkillChip } from './SkillChip';
import { CompanyLogosGroup } from './CompanyLogo';
import { CandidateAvatar } from './CandidateAvatar';
import { formatCents } from '@/lib/utils';
import type { PublicCandidate } from '@/lib/candidates';

interface LeaderboardRowProps {
  candidate: PublicCandidate;
  position: number;
}

const MAX_SKILLS = 3;

/* Coloured borders + shadows ONLY for top 3 */
const TOP_CARD_STYLES: Record<number, string> = {
  1: 'border-2 border-foreground shadow-pop-violet bg-card',
  2: 'border-2 border-foreground shadow-pop-pink bg-card',
  3: 'border-2 border-foreground shadow-pop-amber bg-card',
};

const RANK_BADGES: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: 'bg-accent text-white', text: 'text-white', label: '#1' },
  2: { bg: 'bg-secondary text-white', text: 'text-white', label: '#2' },
  3: { bg: 'bg-tertiary text-foreground', text: 'text-foreground', label: '#3' },
};

export function LeaderboardRow({ candidate, position }: LeaderboardRowProps) {
  const rank = position;
  const visibleSkills = candidate.skills.slice(0, MAX_SKILLS);
  const extraSkills = candidate.skills.length - MAX_SKILLS;

  // After top 3: clean border with NO black drop shadow
  const cardStyle =
    TOP_CARD_STYLES[rank] ?? 'border border-border bg-card hover:border-foreground/50';
  const rankBadge = RANK_BADGES[rank];

  return (
    <div
      className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${cardStyle}`}
    >
      {/* Full-card link — ensures the entire tile redirects to candidate profile */}
      <Link
        href={`/candidate/${candidate.id}`}
        className="absolute inset-0 z-0 rounded-2xl cursor-pointer"
        aria-label={`View ${candidate.name}'s profile`}
      />

      <div className="pointer-events-none relative z-10 flex flex-col gap-2">
        {/* Row 1: Rank + Avatar + Name on left · Current Bid on right */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {/* Rank badge for top 3, plain serial number for ranks > 3 */}
            <div className="shrink-0">
              {rankBadge ? (
                <span
                  className={`inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 border-foreground font-display text-xs font-black shadow-xs ${rankBadge.bg}`}
                >
                  {rankBadge.label}
                </span>
              ) : (
                <span className="font-display text-xs sm:text-sm font-bold text-muted-foreground">
                  #{rank}
                </span>
              )}
            </div>

            {/* Avatar with candidate.id key to force reset on candidate change */}
            <div className="shrink-0">
              <CandidateAvatar
                key={candidate.id}
                name={candidate.name}
                socialLinks={candidate.socialLinks}
                size={38}
                rank={null}
              />
            </div>

            {/* Name + Crown + Category */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate font-display text-base font-black text-foreground group-hover:text-accent transition-colors">
                {candidate.name}
              </span>
              {rank === 1 && <Crown className="h-4 w-4 text-amber-500 fill-amber-400 shrink-0" />}
              <span className="hidden sm:inline-flex rounded-full border border-foreground/15 bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {candidate.category}
              </span>
            </div>
          </div>

          {/* Current Bid */}
          <div className="shrink-0 text-right">
            <span className="font-display text-base sm:text-lg font-black text-accent">
              {formatCents(candidate.currentBid)}
            </span>
          </div>
        </div>

        {/* Row 2: Designation and companies UNDER name and image */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground">
          <span className="text-foreground/80 font-semibold">{candidate.role}</span>
          {candidate.previousCompanies && candidate.previousCompanies.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-muted-foreground/40 font-normal">·</span>
              <CompanyLogosGroup companies={candidate.previousCompanies} />
            </span>
          )}
        </div>

        {/* Row 3: Bio Summary */}
        <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-foreground/80 font-normal mt-0.5">
          {candidate.summary}
        </p>

        {/* Row 4: Skills & Action Row */}
        {/* On mobile: Skills row, then Views/Outbid row. On web (sm+): 1 row with Skills + Views on left, Outbid on right */}
        <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-1.5 sm:gap-x-3 text-xs text-muted-foreground">
          {/* Left: Skills (+ Views on web) */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {visibleSkills.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {visibleSkills.map((s) => (
                  <SkillChip key={s} skill={s} />
                ))}
                {extraSkills > 0 && (
                  <span className="rounded-md border border-foreground/15 bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                    +{extraSkills}
                  </span>
                )}
              </div>
            )}

            {/* Views inline on web */}
            <span className="hidden sm:inline select-none text-border">·</span>
            <span className="hidden sm:inline-flex items-center gap-1 font-medium text-xs">
              <Eye className="h-3.5 w-3.5 shrink-0" />
              {Math.max(candidate.profileViews, 1)} views
            </span>
          </div>

          {/* Mobile only: Views on left · Outbid on right */}
          <div className="flex items-center justify-between sm:hidden pt-0.5">
            <span className="flex items-center gap-1 font-medium text-[11px]">
              <Eye className="h-3.5 w-3.5 shrink-0" />
              {Math.max(candidate.profileViews, 1)} views
            </span>

            <Link
              href={`/submit?minBid=${Math.floor(candidate.currentBid / 100) + 1}`}
              className="pointer-events-auto relative z-20 flex items-center gap-1 font-bold text-accent hover:text-accent/80 transition-colors"
            >
              Outbid #{rank} <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
          </div>

          {/* Web only: Outbid on the right */}
          <div className="hidden sm:block shrink-0">
            <Link
              href={`/submit?minBid=${Math.floor(candidate.currentBid / 100) + 1}`}
              className="pointer-events-auto relative z-20 flex items-center gap-1 font-bold text-accent hover:text-accent/80 transition-colors"
            >
              Outbid #{rank} <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}