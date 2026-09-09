import { formatCents } from '@/lib/utils';

interface StatsBarProps {
  totalCandidates: number;
  totalUnlocks: number;
  totalRevenueCents: number;
}

const DIVIDER = (
  <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-tertiary" />
);

export function StatsBar({ totalCandidates, totalUnlocks, totalRevenueCents }: StatsBarProps) {
  const items = [
    `${formatCents(totalRevenueCents)} paid out`,
    `${totalCandidates} active candidates`,
    `${totalUnlocks} contact unlocks`,
    `higher bid = more visibility`,
    `pay once · stay listed forever`,
    `real bids. real visibility.`,
  ];

  const track = [...items, ...items, ...items, ...items];

  return (
    <div className="overflow-hidden border-y-2 border-foreground bg-accent py-3">
      <div className="flex animate-marquee gap-10 whitespace-nowrap">
        {track.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 font-display text-xs font-bold
                       uppercase tracking-widest text-white"
          >
            <span>{item}</span>
            {DIVIDER}
          </span>
        ))}
      </div>
    </div>
  );
}