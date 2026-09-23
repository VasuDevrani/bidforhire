import Link from 'next/link';
import type { Metadata } from 'next';
import { ListPlus, PencilLine, WalletCards, Rocket, ArrowLeft } from 'lucide-react';
import { SubmitForm } from '@/components/SubmitForm';
import { prisma } from '@/lib/db';
import { formatCents } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Get Listed — BidForHire',
  description: 'Submit your profile and bid for the top spot on the BidForHire leaderboard.',
};

interface SubmitPageProps {
  searchParams: { minBid?: string; error?: string };
}

export default async function SubmitPage({ searchParams }: SubmitPageProps) {
  const minBid = Math.min(Math.max(Number(searchParams.minBid) || 1, 1), 999_999);

  const topCandidate = await prisma.candidate.findFirst({
    where: { status: 'active' },
    orderBy: [{ currentBid: 'desc' }, { createdAt: 'asc' }],
    select: { currentBid: true },
  });
  const topBidCents = topCandidate?.currentBid ?? 0;
  const nextBidDollars = Math.floor(topBidCents / 100) + 1;

  return (
    <div className="mx-auto max-w-xl px-4 pb-12 pt-4">
      {/* Back */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to leaderboard
      </Link>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent shadow-pop-sm">
          <ListPlus className="h-4 w-4" />
          Create your listing
        </div>
        <h1 className="font-display text-4xl font-black text-foreground">Get Listed on BidForHire</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Fill in your profile, set your bid, and pay once. Your listing goes live immediately
          after payment. Higher bid = higher rank.
        </p>
      </div>

      {/* How it works */}
      <div className="relative mb-8 grid grid-cols-3 gap-3 text-center">
        <Step number={1} label="Fill profile" Icon={PencilLine} color="violet" />
        <Step number={2} label="Set bid (min $1)" Icon={WalletCards} color="amber" />
        <Step number={3} label="Pay & go live" Icon={Rocket} color="pink" />
      </div>

      {/* Current #1 bid banner */}
      {topBidCents > 0 && (
        <div className="mb-4 flex items-center justify-between gap-4 rounded-xl border-2 border-foreground bg-card px-5 py-4 shadow-pop-sm">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Current #1 Bid
            </p>
            <p className="font-display text-3xl font-extrabold text-accent">
              {formatCents(topBidCents)}
            </p>
          </div>
          <p className="text-right text-sm font-medium text-muted-foreground">
            Bid{' '}
            <span className="font-bold text-foreground">${nextBidDollars}+</span>
            {' '}to take<br />the top spot
          </p>
        </div>
      )}

      <div className="rounded-2xl border-2 border-foreground bg-card p-5 shadow-pop sm:p-6">
        <SubmitForm initialMinBid={minBid} initialError={searchParams.error} />
      </div>
    </div>
  );
}

const STEP_COLORS = {
  violet: 'bg-accent text-white shadow-pop-violet',
  amber: 'bg-tertiary text-foreground shadow-pop-amber',
  pink: 'bg-secondary text-white shadow-pop-pink',
};

function Step({
  number,
  label,
  Icon,
  color,
}: {
  number: number;
  label: string;
  Icon: typeof PencilLine;
  color: keyof typeof STEP_COLORS;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground ${STEP_COLORS[color]}`}>
        <Icon className="h-4 w-4" />
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-foreground bg-card text-[10px] font-black text-foreground">
          {number}
        </span>
      </div>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}