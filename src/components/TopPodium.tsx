import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy, Medal } from 'lucide-react';
import { formatCents } from '@/lib/utils';
import type { PublicCandidate } from '@/lib/candidates';

interface TopPodiumProps {
  top3: PublicCandidate[];
}

/* ── Chibi image map ── */
const CHIBI_MAP: Record<string, string> = {
  rank1_female: '/chibis/rank1_female.png',
  rank1_male:   '/chibis/rank1_male.jpg',
  rank2_female: '/chibis/rank2_female.png',
  rank2_male:   '/chibis/rank2_male.jpg',
  rank3_female: '/chibis/rank3_female.png',
  rank3_male:   '/chibis/rank3_male.png',
};

/**
 * Deterministically pick male/female chibi for a candidate
 * based on the sum of their ID char codes (no gender field needed).
 */
function getChibiSrc(candidateId: string, rank: 1 | 2 | 3): string {
  const sum = candidateId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const gender = sum % 2 === 0 ? 'female' : 'male';
  return CHIBI_MAP[`rank${rank}_${gender}`];
}

/* ── Per-rank platform styling ── */
const PLATFORM: Record<
  1 | 2 | 3,
  { heightClass: string; bg: string; textColor: string; shadowClass: string; chibiSize: number; floatAnim: string }
> = {
  1: {
    heightClass: 'h-28',
    bg:          'bg-accent',
    textColor:   'text-white',
    shadowClass: 'shadow-pop-violet',
    chibiSize:   128,
    floatAnim:   'animate-float',
  },
  2: {
    heightClass: 'h-20',
    bg:          'bg-secondary',
    textColor:   'text-white',
    shadowClass: 'shadow-pop-pink',
    chibiSize:   108,
    floatAnim:   'animate-float-slow',
  },
  3: {
    heightClass: 'h-14',
    bg:          'bg-tertiary',
    textColor:   'text-foreground',
    shadowClass: 'shadow-pop-amber',
    chibiSize:   96,
    floatAnim:   'animate-float-rev',
  },
};

const RANK_ICONS: Record<1 | 2 | 3, React.ReactNode> = {
  1: <Medal className="h-5 w-5 text-white" />,
  2: <Medal className="h-4 w-4 text-white" />,
  3: <Medal className="h-4 w-4 text-foreground" />,
};

export function TopPodium({ top3 }: TopPodiumProps) {
  if (top3.length < 3) return null;

  const [first, second, third] = top3 as [PublicCandidate, PublicCandidate, PublicCandidate];

  /* Render order: 2nd (left) · 1st (centre) · 3rd (right) — classic podium */
  const slots: Array<{ candidate: PublicCandidate; rank: 1 | 2 | 3 }> = [
    { candidate: second, rank: 2 },
    { candidate: first,  rank: 1 },
    { candidate: third,  rank: 3 },
  ];

  return (
    <div className="mb-10">
      {/* Section label */}
      <p className="mb-4 flex items-center justify-center gap-1.5 font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
        <Trophy className="h-3.5 w-3.5" />
        Hall of Fame
      </p>

      {/* Podium stage */}
      <div className="flex items-end justify-center gap-3 sm:gap-6">
        {slots.map(({ candidate, rank }) => {
          const p = PLATFORM[rank];
          const chibi = getChibiSrc(candidate.id, rank);
          const firstName = candidate.name.split(' ')[0];

          return (
            <Link
              key={candidate.id}
              href={`/candidate/${candidate.id}`}
              className="group flex flex-col items-center no-underline focus:outline-none"
            >
              {/* Floating chibi */}
              <div className={p.floatAnim}>
                <Image
                  src={chibi}
                  alt={`Rank ${rank} — ${candidate.name}`}
                  width={p.chibiSize}
                  height={p.chibiSize}
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                  priority={rank === 1}
                />
              </div>

              {/* Name + bid label */}
              <div className="mb-1.5 mt-1 text-center">
                <p className="max-w-[88px] overflow-hidden text-ellipsis whitespace-nowrap font-display text-[11px] font-bold text-foreground sm:max-w-[104px] sm:text-xs">
                  {firstName}
                </p>
                <p className="font-display text-[11px] font-extrabold text-accent sm:text-xs">
                  {formatCents(candidate.currentBid)}
                </p>
              </div>

              {/* Platform block */}
              <div
                className={`flex w-20 sm:w-24 ${p.heightClass} items-center justify-center
                            rounded-t-2xl border-2 border-foreground ${p.bg}
                            transition-colors duration-200`}
              >
                {RANK_ICONS[rank]}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}