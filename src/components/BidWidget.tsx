import Link from 'next/link';
import { formatCents } from '@/lib/utils';

interface BidWidgetProps {
  topBidCents: number;
}

export function BidWidget({ topBidCents }: BidWidgetProps) {
  const nextBidDollars = Math.floor(topBidCents / 100) + 1; // current #1 + $1

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-foreground bg-accent p-5 shadow-pop-violet">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full border-2 border-white/20 bg-white/10" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-16 w-16 rounded-full border-2 border-white/20 bg-secondary/30" />

      <div className="relative">
        <div className="mb-0.5 font-display text-xs font-bold uppercase tracking-widest text-white/70">
          Current #1 Bid
        </div>
        <div className="mb-4 font-display text-4xl font-extrabold text-white">
          {formatCents(topBidCents)}
        </div>

        <p className="mb-5 text-sm font-medium text-white/80">
          Outbid to claim the top spot. Your profile gets seen first by every recruiter who visits.
        </p>

        <Link
          href={`/submit?minBid=${nextBidDollars}`}
          className="btn-pop flex w-full items-center justify-center gap-2 rounded-full
                     border-2 border-foreground bg-tertiary px-4 py-3
                     font-display text-sm font-extrabold text-foreground shadow-pop"
        >
          Claim #1 for ${nextBidDollars}+
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs text-tertiary">
            →
          </span>
        </Link>

        <p className="mt-3 text-center text-xs font-medium text-white/60">
          Minimum $1 · Beat #1 by $1 · Pay once
        </p>
      </div>
    </div>
  );
}