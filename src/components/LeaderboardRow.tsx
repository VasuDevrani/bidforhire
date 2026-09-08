import Link from 'next/link';
import { SkillChip } from './SkillChip';
import { formatCents, rankColor } from '@/lib/utils';
import type { PublicCandidate } from '@/lib/candidates';

interface LeaderboardRowProps {
  candidate: PublicCandidate;
  position: number;
}

export function LeaderboardRow({ candidate, position }: LeaderboardRowProps) {
  const rank = position;
  const isTop3 = rank <= 3;

  return (
    <div
      className={`group flex items-start gap-4 rounded-xl border p-4 transition-colors ${
        isTop3
          ? 'border-accent/20 bg-accent/5'
          : 'border-border bg-bg-card hover:bg-bg-card-hover'
      }`}
    >
      {/* Rank badge */}
      <div className="flex w-10 shrink-0 flex-col items-center pt-1">
        <span className={`text-lg font-black tabular-nums ${rankColor(rank)}`}>
          #{rank}
        </span>
        {rank === 1 && <span className="mt-0.5 text-base">👑</span>}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <Link
            href={`/candidate/${candidate.id}`}
            className="font-semibold text-stone-900 hover:text-accent"
          >
            {candidate.name}
          </Link>
          <span className="text-sm text-muted">{candidate.role}</span>
        </div>

        {candidate.skills.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {candidate.skills.slice(0, 6).map((s) => (
              <SkillChip key={s} skill={s} />
            ))}
          </div>
        )}

        <p className="mt-2 line-clamp-2 text-sm text-muted">{candidate.summary}</p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
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
      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="text-right">
          <div className="text-lg font-bold text-accent">{formatCents(candidate.currentBid)}</div>
          <div className="text-xs text-muted">current bid</div>
        </div>
        <Link
          href={`/submit?minBid=${Math.floor(candidate.currentBid / 100) + 1}`}
          className="rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
        >
          Outbid #{rank}
        </Link>
      </div>
    </div>
  );
}