'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, Crown } from 'lucide-react';
import { formatCents } from '@/lib/utils';

interface BidWidgetProps {
  topBidCents: number;
  allBidsCents?: number[];
}

export function BidWidget({ topBidCents, allBidsCents = [] }: BidWidgetProps) {
  const topBidDollars = Math.floor(topBidCents / 100);
  const initialBidDollars = Math.max(topBidDollars + 1, 1);

  // String state so the user can clear the field and type a fresh number
  const [bidInput, setBidInput] = useState<string>(String(initialBidDollars));

  // Derived numeric value — falls back to 1 when field is empty/invalid
  const parsed = parseInt(bidInput, 10);
  const bidDollars = !isNaN(parsed) && parsed >= 1 ? Math.min(parsed, 999_999) : 1;

  // Dynamic rank calculation
  const bidCents = bidDollars * 100;
  const higherOrEqualBids = allBidsCents.filter((b) => b >= bidCents).length;
  const predictedRank = higherOrEqualBids + 1;

  function handleDecrement() {
    setBidInput(String(Math.max(bidDollars - 1, 1)));
  }

  function handleIncrement() {
    setBidInput(String(Math.min(bidDollars + 1, 999_999)));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Allow the field to be fully cleared so the user can type any number
    if (raw === '') {
      setBidInput('');
      return;
    }
    const num = parseInt(raw, 10);
    if (!isNaN(num)) {
      setBidInput(String(num));
    }
  }

  // On blur, normalise to the clamped value (fills back "1" if left empty)
  function handleInputBlur() {
    setBidInput(String(bidDollars));
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-foreground bg-card p-5 shadow-pop-violet">
      <div className="relative">
        <div className="mb-0.5 font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          Current #1 Bid
        </div>
        <div className="mb-3 font-display text-4xl font-extrabold text-accent">
          {formatCents(topBidCents)}
        </div>

        <p className="mb-5 text-sm font-medium leading-relaxed text-muted-foreground">
          Outbid to claim the top spot. Your profile gets seen first by every recruiter who visits.
        </p>

        {/* Stepper control: Claim #[rank] for [-] $[amount] [+] */}
        <div className="mb-4 rounded-xl border-2 border-foreground bg-background p-3 shadow-pop-sm">
          <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Projected Rank</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold text-white ${
                predictedRank === 1
                  ? 'bg-accent shadow-pop-sm'
                  : predictedRank === 2
                  ? 'bg-secondary'
                  : predictedRank === 3
                  ? 'bg-amber-600'
                  : 'bg-foreground'
              }`}
            >
              {predictedRank === 1 ? (
                <span className="flex items-center gap-1">
                  #1 <Crown className="h-3 w-3" />
                </span>
              ) : `#${predictedRank}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Decrement button */}
            <button
              type="button"
              onClick={handleDecrement}
              disabled={bidDollars <= 1}
              aria-label="Decrease bid"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-foreground bg-white font-extrabold text-foreground shadow-pop-sm transition-all hover:bg-tertiary active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-4 w-4 stroke-[3]" />
            </button>

            {/* Editable Amount Input */}
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-display text-base font-extrabold text-muted-foreground">
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
                className="w-full rounded-xl border-2 border-foreground bg-white py-2 pl-7 pr-2 text-center font-display text-lg font-black text-foreground outline-none transition-all focus:border-accent focus:shadow-pop-sm"
              />
            </div>

            {/* Increment button */}
            <button
              type="button"
              onClick={handleIncrement}
              aria-label="Increase bid"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-foreground bg-white font-extrabold text-foreground shadow-pop-sm transition-all hover:bg-tertiary active:translate-y-0.5"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Dynamic CTA Button */}
        <Link
          href={`/submit?minBid=${bidDollars}`}
          className="btn-pop flex w-full items-center justify-center gap-2 rounded-full
                     border-2 border-foreground bg-tertiary px-4 py-3
                     font-display text-sm font-black text-foreground shadow-pop transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>
            Claim #{predictedRank} for ${bidDollars}
          </span>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-tertiary">
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </span>
        </Link>

        <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
          Minimum $1 · Beat #1 by $1 · Pay once
        </p>
      </div>
    </div>
  );
}