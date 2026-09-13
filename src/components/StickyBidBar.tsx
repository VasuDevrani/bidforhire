'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, Crown } from 'lucide-react';

interface StickyBidBarProps {
  topBidCents: number;
  allBidsCents: number[];
}

export function StickyBidBar({ topBidCents, allBidsCents }: StickyBidBarProps) {
  const topBidDollars = Math.floor(topBidCents / 100);
  const initialBidDollars = Math.max(topBidDollars + 1, 1);

  const [bidInput, setBidInput] = useState<string>(String(initialBidDollars));

  const parsed = parseInt(bidInput, 10);
  const bidDollars = !isNaN(parsed) && parsed >= 1 ? Math.min(parsed, 999_999) : 1;

  const bidCents = bidDollars * 100;
  const higherOrEqualBids = allBidsCents.filter((b) => b >= bidCents).length;
  const predictedRank = higherOrEqualBids + 1;

  const rankBadgeClass =
    predictedRank === 1
      ? 'bg-accent'
      : predictedRank === 2
      ? 'bg-secondary'
      : predictedRank === 3
      ? 'bg-amber-600'
      : 'bg-foreground';

  function handleDecrement() {
    setBidInput(String(Math.max(bidDollars - 1, 1)));
  }

  function handleIncrement() {
    setBidInput(String(Math.min(bidDollars + 1, 999_999)));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === '') {
      setBidInput('');
      return;
    }
    const num = parseInt(raw, 10);
    if (!isNaN(num)) setBidInput(String(num));
  }

  function handleInputBlur() {
    setBidInput(String(bidDollars));
  }

  return (
    /* Only visible on screens smaller than lg — the sidebar BidWidget covers lg+ */
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card shadow-[0_-2px_12px_rgba(0,0,0,0.08)] lg:hidden">
      <div className="mx-auto max-w-xl px-4 py-3">
        <div className="flex items-center gap-2">
          {/* Rank badge */}
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold text-white ${rankBadgeClass}`}
          >
            {predictedRank === 1 ? (
              <>
                #1 <Crown className="h-3 w-3" />
              </>
            ) : (
              `#${predictedRank}`
            )}
          </span>

          {/* Decrement */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={bidDollars <= 1}
            aria-label="Decrease bid"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-foreground bg-background font-extrabold text-foreground transition-all hover:bg-tertiary active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-4 w-4 stroke-[3]" />
          </button>

          {/* Amount input */}
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center font-display font-extrabold text-muted-foreground">
              $
            </span>
            <input
              type="number"
              min={1}
              max={999999}
              step={1}
              value={bidInput}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-full rounded-xl border-2 border-foreground bg-background py-2 pl-6 pr-1 text-center font-display font-black text-foreground outline-none focus:border-accent"
            />
          </div>

          {/* Increment */}
          <button
            type="button"
            onClick={handleIncrement}
            aria-label="Increase bid"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-foreground bg-background font-extrabold text-foreground transition-all hover:bg-tertiary active:translate-y-0.5"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
          </button>

          {/* CTA */}
          <Link
            href={`/submit?minBid=${bidDollars}`}
            className="btn-pop flex shrink-0 items-center gap-1.5 rounded-full border-2 border-foreground bg-tertiary px-3 py-2 font-display text-sm font-black text-foreground shadow-pop transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="whitespace-nowrap">
              Claim for ${bidDollars}
            </span>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground text-tertiary">
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}