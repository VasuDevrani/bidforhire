import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Listing Submitted — BidForHire',
};

interface SuccessPageProps {
  searchParams: { candidateId?: string };
}

export default function SubmitSuccessPage({ searchParams }: SuccessPageProps) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="mb-4 text-6xl">🎉</div>
      <h1 className="mb-3 text-2xl font-black text-white">Payment received!</h1>
      <p className="mb-2 text-muted">
        Your listing is being processed. It will appear on the leaderboard within a few seconds
        once our webhook confirms the payment.
      </p>
      <p className="mb-8 text-sm text-muted">
        Bookmark your profile link so you can share it with recruiters.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {searchParams.candidateId && (
          <Link
            href={`/candidate/${searchParams.candidateId}`}
            className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-black hover:bg-accent-hover"
          >
            View My Profile
          </Link>
        )}
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