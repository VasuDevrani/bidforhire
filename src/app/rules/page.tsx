import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'How It Works — BidForHire' };

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-black text-white">How BidForHire Works</h1>

      <div className="space-y-8 text-sm text-muted">
        <Section title="For Candidates">
          <p>
            BidForHire is a pay-to-rank hiring leaderboard. You pay a one-time bid to be listed.
            The higher your bid, the higher your rank — and the more visibility you get from
            recruiters.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1">
            <li>Minimum bid is $1</li>
            <li>Your listing goes live immediately after payment</li>
            <li>You stay listed indefinitely — no subscription</li>
            <li>Your email and phone are never shown publicly</li>
            <li>Only recruiters who pay $5 can see your contact info</li>
          </ul>
        </Section>

        <Section title="For Recruiters">
          <p>
            Browse ranked candidates filtered by category. When you find someone interesting,
            pay $5 to unlock their email and phone number. You get permanent access to their
            contact info.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1">
            <li>Free account with a work email address</li>
            <li>$5 per unlock — one-time, permanent access</li>
            <li>Up to 20 unlocks per day</li>
            <li>All unlocked contacts saved in your dashboard</li>
          </ul>
        </Section>

        <Section title="Ranking">
          <p>
            Candidates are ranked by their current bid in descending order. Ties are broken by
            listing date (older = higher). Ranks are updated in real-time when new bids are
            confirmed.
          </p>
        </Section>

        <Section title="Timeframe Filters">
          <p>
            Use the toggle on the main board to filter by <strong className="text-white">All-time</strong>,{' '}
            <strong className="text-white">This Week</strong>, or{' '}
            <strong className="text-white">Today</strong>. This filters by when candidates joined,
            not when they last bid.
          </p>
        </Section>

        <Section title="Refunds">
          <p>
            All sales are final. Since your listing goes live immediately upon payment, we cannot
            offer refunds. If you experience a technical issue, contact us and we&apos;ll
            investigate.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-base font-bold text-white">{title}</h2>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}