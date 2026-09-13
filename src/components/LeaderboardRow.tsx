import Link from 'next/link';
import { ArrowRight, Eye, Crown } from 'lucide-react';
import { SkillChip } from './SkillChip';
import { formatCents } from '@/lib/utils';
import type { PublicCandidate } from '@/lib/candidates';

interface LeaderboardRowProps {
  candidate: PublicCandidate;
  position: number;
}

const MAX_SKILLS = 3;

/* Coloured borders + shadows for top 3 */
const TOP3_STYLE: Record<number, string> = {
  1: 'border-2 border-foreground shadow-pop-violet',
  2: 'border-2 border-foreground shadow-pop-pink',
  3: 'border-2 border-foreground shadow-pop-amber',
};

export function LeaderboardRow({ candidate, position }: LeaderboardRowProps) {
  const rank = position;
  const visibleSkills = candidate.skills.slice(0, MAX_SKILLS);
  const extraSkills = candidate.skills.length - MAX_SKILLS;
  const cardStyle = TOP3_STYLE[rank] ?? 'border border-border';

  return (
    <div className={`relative rounded-xl bg-card px-5 py-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${cardStyle}`}>
      {/* Full-card link — sits below all other content */}
      <Link href={`/candidate/${candidate.id}`} className="absolute inset-0 rounded-xl" aria-label={`View ${candidate.name}'s profile`} />

      {/* ── Header row: rank · name · role ···················· bid ── */}
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-2 overflow-hidden">
          <span className="shrink-0 font-display text-xs font-bold text-muted-foreground">
            #{rank}
          </span>
          {/* Name — relative so it sits above the background link */}
          <span className="truncate font-display text-base font-bold text-foreground">
            {candidate.name}
          </span>
          {/* Role inline on sm+ */}
          <span className="hidden shrink-0 items-baseline gap-1 text-sm text-muted-foreground sm:inline-flex">
            · {candidate.role}
            {rank === 1 && <Crown className="ml-1 inline h-3.5 w-3.5 text-accent" />}
          </span>
        </div>
        <span className="shrink-0 font-display text-base font-extrabold text-accent">
          {formatCents(candidate.currentBid)}
        </span>
      </div>

      {/* Role on mobile */}
      <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground sm:hidden">
        {candidate.role}
        {rank === 1 && <Crown className="h-3.5 w-3.5 text-accent" />}
      </p>

      {/* ── Summary ── */}
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
        {candidate.summary}
      </p>

      {/* ── Footer: skills · views · outbid CTA ── */}
      <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-xs text-muted-foreground">

        {/* Skills */}
        {visibleSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {visibleSkills.map((s) => (
              <SkillChip key={s} skill={s} />
            ))}
            {extraSkills > 0 && (
              <span className="font-medium text-muted-foreground">+{extraSkills}</span>
            )}
          </div>
        )}

        <span className="select-none text-border">·</span>

        {/* Views */}
        <span className="flex items-center gap-1">
          <Eye className="h-3.5 w-3.5 shrink-0" />
          {Math.max(candidate.profileViews, 1)} views
        </span>

        <span className="select-none text-border">·</span>

        {/* Outbid CTA — relative z-10 so it sits above the background link */}
        <Link
          href={`/submit?minBid=${Math.floor(candidate.currentBid / 100) + 1}`}
          className="relative z-10 ml-auto flex items-center gap-1 font-semibold text-accent transition-colors hover:text-accent/75"
        >
          Outbid #{rank} <ArrowRight className="h-3.5 w-3.5 shrink-0" />
        </Link>
      </div>
    </div>
  );
}