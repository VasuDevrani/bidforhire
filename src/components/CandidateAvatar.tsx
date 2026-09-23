'use client';

import { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import { resolveAvatarUrl } from '@/lib/avatar';

interface CandidateAvatarProps {
  name: string;
  socialLinks: Record<string, string>;
  size: number;
  rank?: number | null;
}

/** Rank badge colours — shown bottom-right for #2 and #3 when rank is passed */
const BADGE_STYLE: Record<number, string> = {
  2: 'bg-slate-200 text-slate-700 border-slate-300',
  3: 'bg-amber-200 text-amber-800 border-amber-300',
};

export function CandidateAvatar({ name, socialLinks, size, rank }: CandidateAvatarProps) {
  const primary = resolveAvatarUrl(name, socialLinks);
  const dicebear = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const [imgSrc, setImgSrc] = useState(primary);

  // Sync image URL whenever candidate name or social links update (e.g. category change)
  useEffect(() => {
    setImgSrc(primary);
  }, [primary]);

  const handleError = () => {
    if (imgSrc !== dicebear) setImgSrc(dicebear);
  };

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

      {/* Avatar image — clean border with no drop shadow */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={primary}
        src={imgSrc}
        alt={name}
        onError={handleError}
        className="rounded-full bg-muted object-cover border-2 border-foreground"
        style={{ width: size, height: size }}
      />

      {/* Silver / bronze rank badge (only when rank is 2 or 3) */}
      {rank && (rank === 2 || rank === 3) && (
        <span
          className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-extrabold ${
            BADGE_STYLE[rank] ?? 'bg-white text-foreground border-foreground'
          }`}
        >
          {rank}
        </span>
      )}
    </div>
  );
}