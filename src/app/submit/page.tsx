import type { Metadata } from 'next';
import { SubmitForm } from '@/components/SubmitForm';

export const metadata: Metadata = {
  title: 'Get Listed — BidForHire',
  description: 'Submit your profile and bid for the top spot on the BidForHire leaderboard.',
};

interface SubmitPageProps {
  searchParams: { minBid?: string };
}

export default function SubmitPage({ searchParams }: SubmitPageProps) {
  const minBid = Math.max(Number(searchParams.minBid) || 1, 1);

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white">Get Listed on BidForHire</h1>
        <p className="mt-2 text-sm text-muted">
          Fill in your profile, set your bid, and pay once. Your listing goes live immediately
          after payment. Higher bid = higher rank.
        </p>
      </div>

      {/* How it works */}
      <div className="mb-8 grid grid-cols-3 gap-3 text-center text-xs">
        <Step n={1} label="Fill profile" />
        <Step n={2} label="Set bid (min $1)" />
        <Step n={3} label="Pay & go live" />
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-6">
        <SubmitForm initialMinBid={minBid} />
      </div>
    </div>
  );
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-black text-black">
        {n}
      </div>
      <span className="text-muted">{label}</span>
    </div>
  );
}