import Link from 'next/link';
import { Crown, ArrowRight } from 'lucide-react';
import { SkillChip } from './SkillChip';
import { formatCents } from '@/lib/utils';
import type { PublicCandidate } from '@/lib/candidates';

interface LeaderboardRowProps {
  candidate: PublicCandidate;
  position: number;
}

/* Coloured shadows only for the top 3 */
const TOP3_SHADOWS: Record<number, string> = {
  1: 'shadow-pop-violet',
  2: 'shadow-pop-pink',
  3: 'shadow-pop-amber',
};

/* Rank badge colour — unique colours for top 5; 6+ get a neutral badge */
const TOP5_BADGE_COLORS: Record<number, string> = {
  1: 'bg-accent text-white',
  2: 'bg-secondary text-white',
  3: 'bg-tertiary text-foreground',
  4: 'bg-quaternary text-foreground',
  5: 'bg-accent text-white',
};

export function LeaderboardRow({ candidate, position }: LeaderboardRowProps) {
  const rank = position;
  const shadow = TOP3_SHADOWS[rank] ?? '';
  const badgeColor = TOP5_BADGE_COLORS[rank] ?? 'bg-card text-foreground';

  return (
    <div
      className={`card-sticker flex items-start gap-4 rounded-xl border-2 border-foreground
                  bg-card p-4 ${shadow}`}
    >
      {/* Rank badge — floating circle */}
      <div className="flex w-12 shrink-0 flex-col items-center gap-1 pt-0.5">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-foreground
                     font-display text-sm font-extrabold ${badgeColor}`}
        >
          #{rank}
        </span>
        {rank === 1 && <Crown className="h-5 w-5 text-accent" />}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <Link
            href={`/candidate/${candidate.id}`}
            className="font-display text-base font-bold text-foreground hover:text-accent
                       transition-colors"
          >
            {candidate.name}
          </Link>
          <span className="text-sm text-muted-foreground">{candidate.role}</span>
        </div>

        {candidate.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {candidate.skills.slice(0, 3).map((s) => (
              <SkillChip key={s} skill={s} />
            ))}
            {candidate.skills.length > 3 && (
              <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                +{candidate.skills.length - 3}
              </span>
            )}
          </div>
        )}

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{candidate.summary}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {/* Always show at least 1 view */}
          <span>{Math.max(candidate.profileViews, 1)} views</span>
          {/* Only show recruiter interest when ≥ 1 */}
          {candidate.unlockCount >= 1 && (
            <>
              <span>·</span>
              <span>{candidate.unlockCount} recruiter{candidate.unlockCount !== 1 ? 's' : ''} interested</span>
            </>
          )}
          {/* Only show unlock count when ≥ 5 */}
          {/* {candidate.daysListed > 0 && (
            <>
              <span>·</span>
              <span>{candidate.daysListed}d listed</span>
            </>
          )} */}
        </div>
      </div>

      {/* Right side: bid + CTA */}
      <div className="flex shrink-0 flex-col items-end gap-3">
        <div className="text-right">
          <div className="font-display text-2xl font-extrabold text-accent">
            {formatCents(candidate.currentBid)}
          </div>
          <div className="text-xs text-muted-foreground">current bid</div>
        </div>

          <Link
            href={`/submit?minBid=${Math.floor(candidate.currentBid / 100) + 1}`}
            className="flex items-center gap-1.5 rounded-full border-2 border-foreground
                       bg-foreground px-3 py-1.5 font-display text-xs font-bold text-white
                       transition-all"
          >
            Outbid #{rank} <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </Link>
      </div>
    </div>
  );
}