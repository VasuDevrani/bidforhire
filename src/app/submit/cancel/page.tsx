import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Cancelled — BidForHire',
};

export default function SubmitCancelPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="mb-4 text-5xl">↩</div>
      <h1 className="mb-3 text-2xl font-black text-white">Payment cancelled</h1>
      <p className="mb-8 text-muted">
        No charge was made. You can try again whenever you&apos;re ready.
      </p>
      <div className="flex justify-center gap-3">
        <Link
          href="/submit"
          className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-black hover:bg-accent-hover"
        >
          Try Again
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-border px-5 py-2.5 font-semibold text-white hover:border-white"
        >
          Back to Leaderboard
        </Link>
      </div>
    </div>
  );
}