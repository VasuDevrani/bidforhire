import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle2, ExternalLink, LayoutList } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Listing Submitted — BidForHire',
};

interface SuccessPageProps {
  searchParams: { candidateId?: string };
}

export default function SubmitSuccessPage({ searchParams }: SuccessPageProps) {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="rounded-2xl border-2 border-foreground bg-card p-8 shadow-pop">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-foreground bg-quaternary/20 shadow-pop-emerald">
          <CheckCircle2 className="h-8 w-8 text-quaternary" />
        </div>
        <h1 className="font-display text-3xl font-black text-foreground">Payment received!</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Your listing is being processed. It will appear on the leaderboard within a few seconds
          once our webhook confirms the payment.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Bookmark your profile link so you can share it with recruiters.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {searchParams.candidateId && (
            <Link
              href={`/candidate/${searchParams.candidateId}`}
              className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent px-5 py-2.5 font-bold text-white shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-hover active:shadow-pop-active"
            >
              View My Profile
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-5 py-2.5 font-bold text-foreground shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-hover active:shadow-pop-active"
          >
            <LayoutList className="h-4 w-4" />
            Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}