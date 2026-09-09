import Link from 'next/link';
import { SkillChip } from './SkillChip';
import { formatCents } from '@/lib/utils';
import type { PublicCandidate } from '@/lib/candidates';

interface LeaderboardRowProps {
  candidate: PublicCandidate;
  position: number;
}

/* Rotating shadow colours for a "confetti" feel */
const CARD_SHADOWS = [
  'shadow-pop-violet',
  'shadow-pop-pink',
  'shadow-pop-amber',
  'shadow-pop-emerald',
  'shadow-pop-violet',
];

/* Rank badge colour per position */
const BADGE_COLORS = [
  'bg-accent text-white',
  'bg-secondary text-white',
  'bg-tertiary text-foreground',
  'bg-quaternary text-foreground',
];

export function LeaderboardRow({ candidate, position }: LeaderboardRowProps) {
  const rank = position;
  const shadow = CARD_SHADOWS[(rank - 1) % CARD_SHADOWS.length];
  const badgeColor = BADGE_COLORS[(rank - 1) % BADGE_COLORS.length];

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
        {rank === 1 && <span className="animate-float text-lg">👑</span>}
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
            {candidate.skills.slice(0, 5).map((s) => (
              <SkillChip key={s} skill={s} />
            ))}
          </div>
        )}

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{candidate.summary}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{candidate.profileViews} views</span>
          <span>·</span>
          <span>{candidate.unlockCount} recruiters interested</span>
          {candidate.daysListed > 0 && (
            <>
              <span>·</span>
              <span>{candidate.daysListed}d listed</span>
            </>
          )}
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
          className="btn-pop rounded-full border-2 border-foreground bg-foreground
                     px-3 py-1.5 font-display text-xs font-bold text-white
                     shadow-pop-sm transition-all"
        >
          Outbid #{rank} →
        </Link>
      </div>
    </div>
  );
}