import Link from 'next/link';
import type { Metadata } from 'next';
import { Building2, Unlock, CalendarCheck, Archive, ArrowRight, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Recruiter Sign In — BidForHire',
  description: 'Sign in with your work email to unlock candidate contact details.',
};

interface SignupPageProps {
  searchParams: { next?: string; callbackUrl?: string };
}

const PERKS = [
  { Icon: Unlock,        text: 'First 3 unlocks are free — then $5 per candidate' },
  { Icon: CalendarCheck, text: 'Up to 20 unlocks per day'                          },
  { Icon: Archive,       text: 'Access your unlocked contacts forever'              },
];

export default function RecruiterSignupPage({ searchParams }: SignupPageProps) {
  const callbackUrl = searchParams.callbackUrl ?? searchParams.next ?? '/recruiter/dashboard';

  return (
    <div className="mx-auto max-w-md px-4 pb-16 pt-4">
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
          <Building2 className="h-4 w-4" />
          Recruiter Access
        </div>
        <h1 className="font-display text-3xl font-black text-foreground">Sign In to Hire</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your work email to sign in. We&apos;ll send a magic link — no password needed.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border-2 border-foreground bg-card p-6 shadow-pop">
        <RecruiterSignupForm callbackUrl={callbackUrl} />
      </div>

      {/* Perks card */}
      <div className="mt-5 rounded-2xl border-2 border-foreground bg-accent/10 p-5 shadow-pop-violet">
        <p className="mb-3 font-bold text-foreground">What you get:</p>
        <ul className="space-y-2.5">
          {PERKS.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-card shadow-pop-sm">
                <Icon className="h-3.5 w-3.5 text-accent" />
              </div>
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* Already signed in? */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already signed in?{' '}
        <Link href="/recruiter/dashboard" className="font-semibold text-accent hover:underline">
          Go to Dashboard <ArrowRight className="inline h-3.5 w-3.5" />
        </Link>
      </p>
    </div>
  );
}