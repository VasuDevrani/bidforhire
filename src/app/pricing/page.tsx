import type { Metadata } from 'next';
import { Tag, User, Building2, Zap, CreditCard, HelpCircle } from 'lucide-react';

export const metadata: Metadata = { title: 'Pricing — BidForHire' };

const sections = [
  {
    icon: User,
    color: 'text-accent',
    bg: 'bg-accent/10',
    title: 'Candidate Listings',
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed">
        requires a minimum bid of{' '}
          <strong className="text-foreground font-bold">$1</strong>. Your bid determines
          your rank — higher bids rank higher. There is no upper limit on your bid amount.
        </p>
        <ul className="mt-3 space-y-2">
          {[
            'Minimum bid: $1',
            'Your listing stays live until you choose to remove it',
            'You can boost your bid at any time to climb the leaderboard',
            'One active listing per person on the leaderboard',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <User className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    icon: Zap,
    color: 'text-tertiary',
    bg: 'bg-tertiary/20',
    title: 'Bid Boosts',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        Already listed? You can increase your bid at any time from your profile page. The
        new total bid is used to recalculate your leaderboard rank immediately. Boost
        payments are added to your existing bid — they are not separate charges.
      </p>
    ),
  },
  {
    icon: Building2,
    color: 'text-quaternary',
    bg: 'bg-quaternary/10',
    title: 'Recruiter Access',
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed">
          Every verified recruiter gets <strong className="text-foreground font-bold">3 free unlocks</strong> to
          try the platform. After that, a one-time <strong className="text-foreground font-bold">$10 lifetime pass</strong>{' '}
          gives you unlimited unlocks forever — no subscription, no per-candidate fees.
        </p>
        <ul className="mt-3 space-y-2">
          {[
            '3 free unlocks included for every recruiter',
            '$10 lifetime pass — unlimited unlocks after the free tier',
            'Up to 20 unlocks per day',
            'Requires a verified work email (no Gmail / Yahoo)',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-quaternary" />
              {item}
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    icon: CreditCard,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    title: 'What Is Delivered',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        BidForHire delivers <strong className="text-foreground font-bold">digital services only</strong>.
        For candidates, your profile is published on the public leaderboard. For recruiters,
        you receive digital access to a candidate&apos;s contact details within the platform.
        No physical goods are shipped.
      </p>
    ),
  },
  {
    icon: HelpCircle,
    color: 'text-accent',
    bg: 'bg-accent/10',
    title: 'All Sales Are Final',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        All payments are non-refundable once processed. Please review our{' '}
        <a href="/refund" className="font-semibold text-accent hover:underline">
          Cancellation &amp; Refund Policy
        </a>{' '}
        for full details. For payment issues, contact{' '}
        <a
          href="mailto:support@bidforhire.lol"
          className="font-semibold text-accent hover:underline"
        >
          support@bidforhire.lol
        </a>
        .
      </p>
    ),
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent shadow-pop-sm">
          <Tag className="h-4 w-4" />
          Pricing
        </div>
        <h1 className="font-display text-4xl font-black text-foreground">Simple, Transparent Pricing</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          No subscriptions. Pay for what you use.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className={`rounded-2xl border-2 border-foreground ${s.bg} p-5`}
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-card">
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <h2 className="font-display text-lg font-black text-foreground">{s.title}</h2>
              </div>
              {s.content}
            </div>
          );
        })}
      </div>
    </div>
  );
}