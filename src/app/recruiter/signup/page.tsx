import type { Metadata } from 'next';
import { RecruiterSignupForm } from '@/components/RecruiterSignupForm';

export const metadata: Metadata = {
  title: 'Recruiter Sign In — BidForHire',
  description: 'Sign in with your work email to unlock candidate contact details.',
};

interface SignupPageProps {
  searchParams: { next?: string; callbackUrl?: string };
}

export default function RecruiterSignupPage({ searchParams }: SignupPageProps) {
  const callbackUrl = searchParams.callbackUrl ?? searchParams.next ?? '/recruiter/dashboard';

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-black text-white">Recruiter Access</h1>
        <p className="mt-2 text-sm text-muted">
          Use your work email to sign in. We&apos;ll send a magic link — no password needed.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-bg-card p-6">
        <RecruiterSignupForm callbackUrl={callbackUrl} />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-bg-card p-5 text-sm text-muted">
        <p className="font-semibold text-white">What you get:</p>
        <ul className="mt-2 space-y-1">
          <li>✓ Unlock any candidate&apos;s email + phone for $5</li>
          <li>✓ Up to 20 unlocks per day</li>
          <li>✓ Access your unlocked contacts forever</li>
        </ul>
      </div>
    </div>
  );
}