import Link from 'next/link';
import { formatCents } from '@/lib/utils';

interface BidWidgetProps {
  topBidCents: number;
}

export function BidWidget({ topBidCents }: BidWidgetProps) {
  const nextBidDollars = Math.floor(topBidCents / 100) + 1;

  return (
    <div className="rounded-xl border border-border bg-bg-card p-5 shadow-sm">
      <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted">
        Current #1 Bid
      </div>
      <div className="mb-4 text-3xl font-black text-accent">{formatCents(topBidCents)}</div>

      <p className="mb-4 text-sm text-muted">
        Outbid to claim the top spot. Your profile gets seen first by every recruiter who visits.
      </p>

      <Link
        href={`/submit?minBid=${nextBidDollars}`}
        className="block w-full rounded-full bg-accent py-3 text-center text-sm font-bold text-white transition-colors hover:bg-accent-hover"
      >
        Claim #1 for ${nextBidDollars}+
      </Link>

      <p className="mt-2 text-center text-xs text-muted">
        Minimum bid is $1 · Pay once · Stay listed
      </p>
    </div>
  );
}