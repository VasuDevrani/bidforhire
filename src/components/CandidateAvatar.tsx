'use client';

import { useState } from 'react';
import { Crown } from 'lucide-react';
import { resolveAvatarUrl } from '@/lib/avatar';

interface CandidateAvatarProps {
  name: string;
  socialLinks: Record<string, string>;
  size: number;
  rank: 1 | 2 | 3;
}

/** Rank badge colours — shown bottom-right for #2 and #3 */
const BADGE_STYLE: Record<2 | 3, string> = {
  2: 'bg-slate-200 text-slate-700 border-slate-300',
  3: 'bg-amber-200 text-amber-800 border-amber-300',
};

/** Ring / shadow per rank */
const RING_STYLE: Record<1 | 2 | 3, string> = {
  1: 'border-2 border-foreground shadow-pop-violet',
  2: 'border-2 border-foreground shadow-pop-pink',
  3: 'border-2 border-foreground shadow-pop-amber',
};

export function CandidateAvatar({ name, socialLinks, size, rank }: CandidateAvatarProps) {
  const primary = resolveAvatarUrl(name, socialLinks);
  const dicebear = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const [src, setSrc] = useState(primary);

  const handleError = () => {
    if (src !== dicebear) setSrc(dicebear);
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Gold crown floating above for #1 */}
      {rank === 1 && (
        <Crown
          className="absolute -top-7 left-1/2 h-7 w-7 -translate-x-1/2 -rotate-12 text-yellow-400 drop-shadow-md"
          fill="currentColor"
          aria-hidden
        />
      )}

      {/* Avatar image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        onError={handleError}
        className={`rounded-full bg-muted object-cover transition-transform duration-300 group-hover:scale-110 ${RING_STYLE[rank]}`}
        style={{ width: size, height: size }}
      />

      {/* Silver / bronze rank badge */}
      {rank !== 1 && (
        <span
          className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-extrabold ${BADGE_STYLE[rank as 2 | 3]}`}
        >
          {rank}
        </span>
      )}
    </div>
  );
}