import type { Metadata } from 'next';
import {
  FileText,
  UserCheck,
  Building2,
  Unlock,
  Ban,
  CreditCard,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Terms of Service — BidForHire' };

const sections = [
  {
    icon: FileText,
    color: 'text-accent',
    bg: 'bg-accent/10',
    shadow: 'shadow-pop-violet',
    title: '1. Acceptance',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        By using BidForHire you agree to these terms. If you do not agree, do not use the service.
      </p>
    ),
  },
  {
    icon: UserCheck,
    color: 'text-quaternary',
    bg: 'bg-quaternary/10',
    shadow: 'shadow-pop-emerald',
    title: '2. Candidate Listings',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        By submitting a listing you confirm that the information you provide is accurate and
        that you are the person described. You grant BidForHire a licence to display your
        public profile information. Listings are non-refundable once payment is confirmed.
      </p>
    ),
  },
  {
    icon: Building2,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    shadow: 'shadow-pop-pink',
    title: '3. Recruiter Accounts',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        Recruiter accounts require a verified work email. You may not use personal email
        addresses (Gmail, Yahoo, etc.). You are responsible for keeping your magic link
        confidential.
      </p>
    ),
  },
  {
    icon: Unlock,
    color: 'text-amber-600',
    bg: 'bg-tertiary/20',
    shadow: 'shadow-pop-amber',
    title: '4. Contact Unlocks',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        Paying to unlock a candidate&apos;s contact details grants you personal access to
        that information. You may not redistribute, sell, or share unlocked contact details
        with third parties.
      </p>
    ),
  },
  {
    icon: Ban,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    shadow: 'shadow-pop-pink',
    title: '5. Prohibited Conduct',
    content: (
      <ul className="space-y-2">
        {[
          'Submitting false or misleading profile information',
          'Using automated tools to scrape the leaderboard',
          'Sharing unlocked contact information with third parties',
          'Creating multiple accounts to circumvent rate limits',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Ban className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: CreditCard,
    color: 'text-accent',
    bg: 'bg-accent/10',
    shadow: 'shadow-pop-violet',
    title: '6. Payments',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        All prices are in USD. Payments are processed by Dodo Payments. All sales are final.
        No refunds are issued once a listing is live or a contact is unlocked.
      </p>
    ),
  },
  {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-tertiary/20',
    shadow: 'shadow-pop-amber',
    title: '7. Limitation of Liability',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        BidForHire is provided &quot;as is&quot;. We make no guarantees about hiring
        outcomes. Our liability is limited to the amount you paid for the specific transaction
        in dispute.
      </p>
    ),
  },
  {
    icon: RefreshCw,
    color: 'text-quaternary',
    bg: 'bg-quaternary/10',
    shadow: 'shadow-pop-emerald',
    title: '8. Changes',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        We may update these terms at any time. Continued use of the service constitutes
        acceptance.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent shadow-pop-sm">
          <FileText className="h-4 w-4" />
          Terms of Service
        </div>
        <h1 className="font-display text-4xl font-black text-foreground">Terms of Service</h1>
        <p className="mt-3 text-sm text-muted-foreground">Last updated: September 2026</p>
      </div>

      <div className="space-y-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className={`rounded-2xl border-2 border-foreground ${s.bg} p-5 ${s.shadow}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-card ${s.shadow}`}>
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