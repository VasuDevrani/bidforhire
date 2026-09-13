'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { formatCents } from '@/lib/utils';

interface MobileStickyBarProps {
  topBidCents: number;
}

export function MobileStickyBar({ topBidCents }: MobileStickyBarProps) {
  const nextBidDollars = Math.floor(topBidCents / 100) + 1;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-foreground bg-card/95 px-4 py-3 backdrop-blur-md shadow-[0_-4px_16px_rgba(0,0,0,0.12)] lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm">👑</span>
            <span className="font-display text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Current #1
            </span>
          </div>
          <div className="font-display text-lg font-extrabold text-accent">
            {formatCents(topBidCents)}
          </div>
        </div>

        <Link
          href={`/submit?minBid=${nextBidDollars}`}
          className="btn-pop flex items-center gap-2 rounded-full border-2 border-foreground bg-tertiary px-4 py-2.5 font-display text-xs font-extrabold text-foreground shadow-pop-sm active:translate-y-0.5"
        >
          <span>Claim #1 for ${nextBidDollars}+</span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-tertiary">
            <ArrowRight className="h-3 w-3 stroke-[3]" />
          </span>
        </Link>
      </div>
    </div>
  );
}
