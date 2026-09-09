import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Payment Cancelled — BidForHire',
};

export default function SubmitCancelPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="rounded-2xl border-2 border-foreground bg-card p-8 shadow-pop">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-foreground bg-tertiary/20 shadow-pop-amber">
          <RotateCcw className="h-7 w-7 text-amber-600" />
        </div>
        <h1 className="font-display text-3xl font-black text-foreground">Payment cancelled</h1>
        <p className="mt-3 text-muted-foreground">
          No charge was made. You can try again whenever you&apos;re ready.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent px-5 py-2.5 font-bold text-white shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-hover active:shadow-pop-active"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-5 py-2.5 font-bold text-foreground shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-hover active:shadow-pop-active"
          >
            <ArrowLeft className="h-4 w-4" />
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}