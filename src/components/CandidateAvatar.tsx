'use client';

import { useState } from 'react';
import { Crown } from 'lucide-react';
import { resolveAvatarUrl } from '@/lib/avatar';

interface CandidateAvatarProps {
  name: string;
  socialLinks: Record<string, string>;
  size: number;
  rank?: number | null;
}

/** Rank badge colours — shown bottom-right for #2 and #3 */
const BADGE_STYLE: Record<number, string> = {
  2: 'bg-slate-200 text-slate-700 border-slate-300',
  3: 'bg-amber-200 text-amber-800 border-amber-300',
};

/** Ring / shadow per rank */
const RING_STYLE: Record<number, string> = {
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

  const ringClass = rank && RING_STYLE[rank]
    ? RING_STYLE[rank]
    : 'border-2 border-foreground shadow-pop-sm';

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      {/* Gold crown floating above for #1 */}
      {rank === 1 && (
        <Crown
          className="absolute -top-7 left-1/2 h-7 w-7 -translate-x-1/2 -rotate-12 text-yellow-400 drop-shadow-md z-10"
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
        className={`rounded-full bg-muted object-cover transition-transform duration-300 group-hover:scale-110 ${ringClass}`}
        style={{ width: size, height: size }}
      />

      {/* Silver / bronze / other rank badge */}
      {rank && rank > 1 && (
        <span
          className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-extrabold shadow-xs ${
            BADGE_STYLE[rank] ?? 'bg-white text-foreground border-foreground'
          }`}
        >
          {rank}
        </span>
      )}
    </div>
  );
}