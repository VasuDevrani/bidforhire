import Link from 'next/link';
import { formatCents } from '@/lib/utils';

interface BidWidgetProps {
  topBidCents: number;
}

export function BidWidget({ topBidCents }: BidWidgetProps) {
  const nextBidDollars = Math.floor(topBidCents / 100) + 1; // current #1 + $1

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-foreground bg-card p-5">
      <div className="relative">
        <div className="mb-0.5 font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Current #1 Bid
        </div>
        <div className="mb-4 font-display text-4xl font-extrabold text-accent">
          {formatCents(topBidCents)}
        </div>

        <p className="mb-5 text-sm font-medium text-muted-foreground">
          Outbid to claim the top spot. Your profile gets seen first by every recruiter who visits.
        </p>

        <Link
          href={`/submit?minBid=${nextBidDollars}`}
          className="btn-pop flex w-full items-center justify-center gap-2 rounded-full
                     border-2 border-foreground bg-tertiary px-4 py-3
                     font-display text-sm font-extrabold text-foreground"
        >
          Claim #1 for ${nextBidDollars}+
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs text-tertiary">
            →
          </span>
        </Link>

        <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
          Minimum $1 · Beat #1 by $1 · Pay once
        </p>
      </div>
    </div>
  );
}