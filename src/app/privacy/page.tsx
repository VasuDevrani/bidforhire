import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy — BidForHire' };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-black text-white">Privacy Policy</h1>
      <p className="mb-8 text-sm text-muted">Last updated: September 2026</p>

      <div className="space-y-6 text-sm text-muted leading-relaxed">
        <Section title="Information We Collect">
          <p>
            <strong className="text-white">Candidates:</strong> Name, job title, skills, summary,
            social links, email address, and optionally phone number.
          </p>
          <p className="mt-2">
            <strong className="text-white">Recruiters:</strong> Work email address and optional
            company name, stored to enable authentication and unlock history.
          </p>
          <p className="mt-2">
            <strong className="text-white">Usage data:</strong> Anonymised profile view counts
            (hashed IP + date, never stored raw).
          </p>
        </Section>

        <Section title="How We Use Your Data">
          <ul className="list-inside list-disc space-y-1">
            <li>To display your public profile on the leaderboard</li>
            <li>To send you a sign-in magic link (recruiters)</li>
            <li>To process payments via Dodo Payments</li>
            <li>To fulfil contact unlocks — your email/phone is shared only with recruiters who pay</li>
          </ul>
        </Section>

        <Section title="Data Visibility">
          <p>
            Candidate email and phone are <strong className="text-white">never</strong> included
            in public API responses or displayed on public pages. They are only returned to
            authenticated recruiters who have a confirmed paid unlock for your profile.
          </p>
        </Section>

        <Section title="Payments">
          <p>
            Payment processing is handled by Dodo Payments. We do not store card details.
            Payment metadata (amount, type) is stored for audit and idempotency purposes.
          </p>
        </Section>

        <Section title="Data Retention">
          <p>
            Profiles and unlock records are retained indefinitely. If you wish to have your data
            removed, contact us and we will delete your record within 7 business days.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions? Email us at <span className="text-accent">privacy@bidforhire.com</span>
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-2 text-base font-bold text-white">{title}</h2>
      {children}
    </div>
  );
}