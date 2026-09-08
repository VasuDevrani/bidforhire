import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Check Your Email — BidForHire',
};

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="mb-4 text-5xl">📧</div>
      <h1 className="mb-3 text-2xl font-black text-white">Check your inbox</h1>
      <p className="text-muted">
        A sign-in link has been sent to your email address. Click the link to access your
        recruiter dashboard.
      </p>
      <p className="mt-4 text-sm text-muted">
        Didn&apos;t get it?{' '}
        <Link href="/recruiter/signup" className="text-accent hover:underline">
          Try again →
        </Link>
      </p>
    </div>
  );
}