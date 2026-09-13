import Link from 'next/link';
import { formatCents } from '@/lib/utils';
import { CandidateAvatar } from '@/components/CandidateAvatar';
import type { PublicCandidate } from '@/lib/candidates';

interface TopPodiumProps {
  top3: PublicCandidate[];
}

/* ── Per-rank platform styling ── */
const PLATFORM: Record<
  1 | 2 | 3,
  { heightClass: string; bg: string; textColor: string; floatAnim: string; avatarSize: number }
> = {
  1: {
    heightClass: 'h-28',
    bg:          'bg-accent',
    textColor:   'text-white',
    floatAnim:   'animate-float',
    avatarSize:  88,
  },
  2: {
    heightClass: 'h-20',
    bg:          'bg-secondary',
    textColor:   'text-white',
    floatAnim:   'animate-float-slow',
    avatarSize:  72,
  },
  3: {
    heightClass: 'h-14',
    bg:          'bg-tertiary',
    textColor:   'text-foreground',
    floatAnim:   'animate-float-rev',
    avatarSize:  60,
  },
};

/* Rank label shown inside each platform block */
const RANK_LABEL: Record<1 | 2 | 3, string> = { 1: '#1', 2: '#2', 3: '#3' };
const RANK_LABEL_COLOR: Record<1 | 2 | 3, string> = {
  1: 'text-white',
  2: 'text-white',
  3: 'text-foreground',
};

export function TopPodium({ top3 }: TopPodiumProps) {
  if (top3.length < 3) return null;

  const [first, second, third] = top3 as [PublicCandidate, PublicCandidate, PublicCandidate];

  /* Classic podium order: 2nd left · 1st centre · 3rd right */
  const slots: Array<{ candidate: PublicCandidate; rank: 1 | 2 | 3 }> = [
    { candidate: second, rank: 2 },
    { candidate: first,  rank: 1 },
    { candidate: third,  rank: 3 },
  ];

  return (
    <div className="mb-10">
      <div className="flex items-end justify-center gap-0 sm:gap-3">
        {slots.map(({ candidate, rank }) => {
          const p = PLATFORM[rank];
          const firstName = candidate.name.split(' ')[0];

          return (
            <Link
              key={candidate.id}
              href={`/candidate/${candidate.id}`}
              className="group flex flex-col items-center no-underline focus:outline-none"
            >
              {/* Floating avatar — extra top padding on #1 to make room for the crown */}
              <div className={`${p.floatAnim} ${rank === 1 ? 'pt-8' : 'pt-4'}`}>
                <CandidateAvatar
                  name={candidate.name}
                  socialLinks={candidate.socialLinks}
                  size={p.avatarSize}
                  rank={rank}
                />
              </div>

              {/* Name + bid */}
              <div className="mb-1 mt-2 text-center">
                <p className="max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap font-display text-[11px] font-bold text-foreground sm:max-w-[96px] sm:text-xs">
                  {firstName}
                </p>
                <p className="font-display text-[11px] font-extrabold text-accent sm:text-xs">
                  {formatCents(candidate.currentBid)}
                </p>
              </div>

              {/* Platform block */}
              <div
                className={`flex w-20 sm:w-24 ${p.heightClass} items-center justify-center
                            rounded-t-2xl border-2 border-foreground ${p.bg}`}
              >
                <span className={`font-display text-sm font-extrabold ${RANK_LABEL_COLOR[rank]}`}>
                  {RANK_LABEL[rank]}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}