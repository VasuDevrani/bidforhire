import type { Metadata } from 'next';
import { RefreshCw, XCircle, CheckCircle, CreditCard, Mail, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = { title: 'Cancellation & Refund Policy — BidForHire' };

const sections = [
  {
    icon: AlertTriangle,
    color: 'text-tertiary',
    bg: 'bg-tertiary/20',
    title: 'General Policy',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        All purchases on BidForHire are for <strong className="text-foreground font-bold">digital services</strong>{' '}
        delivered immediately upon payment confirmation. Because the service is rendered at the
        point of purchase, <strong className="text-foreground font-bold">all sales are final</strong> and
        no refunds are issued in ordinary circumstances.
      </p>
    ),
  },
  {
    icon: XCircle,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    title: 'Non-Refundable Items',
    content: (
      <ul className="space-y-2">
        {[
          'Candidate listing bids — once your profile is live on the leaderboard',
          'Bid boost payments — once the boost has been applied to your rank',
          'Per-candidate contact unlocks — once the contact details have been revealed',
          'Lifetime recruiter pass — once the pass has been activated on your account',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: CheckCircle,
    color: 'text-quaternary',
    bg: 'bg-quaternary/10',
    title: 'Exceptions — When a Refund May Be Issued',
    content: (
      <ul className="space-y-2">
        {[
          'You were charged but your listing, boost, or unlock never activated due to a technical error on our end.',
          'A duplicate charge occurred for the same transaction.',
          'Payment was taken but the service was not available due to downtime on our platform.',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-quaternary" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: RefreshCw,
    color: 'text-accent',
    bg: 'bg-accent/10',
    title: 'Cancellation',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        There are no recurring subscriptions on BidForHire — every purchase is a one-time
        transaction. Candidate listings can be removed from the leaderboard at any time by
        contacting support, but the bid amount is not refunded upon removal.
      </p>
    ),
  },
  {
    icon: CreditCard,
    color: 'text-tertiary',
    bg: 'bg-tertiary/20',
    title: 'Payment Processing',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        Payments are processed by{' '}
        <strong className="text-foreground font-bold">Razorpay</strong>. If you believe you
        have been charged incorrectly, you can also raise a dispute directly with Razorpay
        via your bank or card issuer.
      </p>
    ),
  },
  {
    icon: Mail,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    title: 'How to Request a Refund',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        Email{' '}
        <a
          href="mailto:support@bidforhire.lol"
          className="font-semibold text-accent hover:underline"
        >
          support@bidforhire.lol
        </a>{' '}
        with your <strong className="text-foreground font-bold">Razorpay payment ID</strong>,
        the email address used, and a brief description of the issue. We will respond within
        1 business day and, where applicable, process an approved refund within 5–7 business days.
      </p>
    ),
  },
];

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent shadow-pop-sm">
          <RefreshCw className="h-4 w-4" />
          Refund Policy
        </div>
        <h1 className="font-display text-4xl font-black text-foreground">
          Cancellation &amp; Refund Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: September 2026</p>
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