import { formatCents } from '@/lib/utils';

interface StatsBarProps {
  totalCandidates: number;
  totalUnlocks: number;
  totalRevenueCents: number;
}

export function StatsBar({ totalCandidates, totalUnlocks, totalRevenueCents }: StatsBarProps) {
  return (
    <div className="border-b border-border bg-white py-4">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-around gap-4 px-4 text-center">
        <Stat label="Total Revenue" value={formatCents(totalRevenueCents)} />
        <Stat label="Active Candidates" value={String(totalCandidates)} />
        <Stat label="Contact Unlocks" value={String(totalUnlocks)} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xl font-black text-stone-900">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}