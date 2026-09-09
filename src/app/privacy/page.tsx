import type { Metadata } from 'next';
import {
  ShieldCheck,
  Database,
  Eye,
  CreditCard,
  Clock,
  Mail,
} from 'lucide-react';

export const metadata: Metadata = { title: 'Privacy Policy — BidForHire' };

const sections = [
  {
    icon: Database,
    color: 'text-accent',
    bg: 'bg-accent/10',
    shadow: 'shadow-pop-violet',
    title: 'Information We Collect',
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed">
          <strong className="text-foreground font-bold">Candidates:</strong> Name, job title, skills, summary,
          social links, email address, and optionally phone number.
        </p>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          <strong className="text-foreground font-bold">Recruiters:</strong> Work email address and optional
          company name, stored to enable authentication and unlock history.
        </p>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          <strong className="text-foreground font-bold">Usage data:</strong> Anonymised profile view counts
          (hashed IP + date, never stored raw).
        </p>
      </>
    ),
  },
  {
    icon: ShieldCheck,
    color: 'text-quaternary',
    bg: 'bg-quaternary/10',
    shadow: 'shadow-pop-emerald',
    title: 'How We Use Your Data',
    content: (
      <ul className="space-y-2">
        {[
          'To display your public profile on the leaderboard',
          'To send you a sign-in magic link (recruiters)',
          'To process payments via Dodo Payments',
          'To fulfil contact unlocks — your email/phone is shared only with recruiters who pay',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-quaternary" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: Eye,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    shadow: 'shadow-pop-pink',
    title: 'Data Visibility',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        Candidate email and phone are{' '}
        <strong className="text-foreground font-bold">never</strong> included in public API
        responses or displayed on public pages. They are only returned to authenticated
        recruiters who have a confirmed paid unlock for your profile.
      </p>
    ),
  },
  {
    icon: CreditCard,
    color: 'text-amber-600',
    bg: 'bg-tertiary/20',
    shadow: 'shadow-pop-amber',
    title: 'Payments',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        Payment processing is handled by Dodo Payments. We do not store card details.
        Payment metadata (amount, type) is stored for audit and idempotency purposes.
      </p>
    ),
  },
  {
    icon: Clock,
    color: 'text-accent',
    bg: 'bg-accent/5',
    shadow: 'shadow-pop',
    title: 'Data Retention',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        Profiles and unlock records are retained indefinitely. If you wish to have your data
        removed, contact us and we will delete your record within 7 business days.
      </p>
    ),
  },
  {
    icon: Mail,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    shadow: 'shadow-pop-pink',
    title: 'Contact',
    content: (
      <p className="text-muted-foreground">
        Questions? Email us at{' '}
        <a href="mailto:privacy@bidforhire.com" className="font-semibold text-accent hover:underline">
          privacy@bidforhire.com
        </a>
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent shadow-pop-sm">
          <ShieldCheck className="h-4 w-4" />
          Privacy Policy
        </div>
        <h1 className="font-display text-4xl font-black text-foreground">Your Data, Explained</h1>
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