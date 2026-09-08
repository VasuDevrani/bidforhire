import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service — BidForHire' };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-black text-white">Terms of Service</h1>
      <p className="mb-8 text-sm text-muted">Last updated: September 2026</p>

      <div className="space-y-6 text-sm text-muted leading-relaxed">
        <Section title="1. Acceptance">
          <p>
            By using BidForHire you agree to these terms. If you do not agree, do not use the
            service.
          </p>
        </Section>

        <Section title="2. Candidate Listings">
          <p>
            By submitting a listing you confirm that the information you provide is accurate and
            that you are the person described. You grant BidForHire a licence to display your
            public profile information. Listings are non-refundable once payment is confirmed.
          </p>
        </Section>

        <Section title="3. Recruiter Accounts">
          <p>
            Recruiter accounts require a verified work email. You may not use personal email
            addresses (Gmail, Yahoo, etc.). You are responsible for keeping your magic link
            confidential.
          </p>
        </Section>

        <Section title="4. Contact Unlocks">
          <p>
            Paying to unlock a candidate&apos;s contact details grants you personal access to
            that information. You may not redistribute, sell, or share unlocked contact details
            with third parties.
          </p>
        </Section>

        <Section title="5. Prohibited Conduct">
          <ul className="list-inside list-disc space-y-1">
            <li>Submitting false or misleading profile information</li>
            <li>Using automated tools to scrape the leaderboard</li>
            <li>Sharing unlocked contact information with third parties</li>
            <li>Creating multiple accounts to circumvent rate limits</li>
          </ul>
        </Section>

        <Section title="6. Payments">
          <p>
            All prices are in USD. Payments are processed by Dodo Payments. All sales are final.
            No refunds are issued once a listing is live or a contact is unlocked.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            BidForHire is provided &quot;as is&quot;. We make no guarantees about hiring
            outcomes. Our liability is limited to the amount you paid for the specific transaction
            in dispute.
          </p>
        </Section>

        <Section title="8. Changes">
          <p>
            We may update these terms at any time. Continued use of the service constitutes
            acceptance.
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