import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'FAQ — BidForHire' };

const faqs = [
  {
    q: 'How long does my listing stay up?',
    a: 'Forever. You pay once and your profile stays on the leaderboard indefinitely.',
  },
  {
    q: 'What happens if someone outbids me?',
    a: "Your profile drops in rank but stays active. You're never removed — only re-ordered.",
  },
  {
    q: "Can I update my profile after listing?",
    a: "Not yet — profile editing isn't available. Submit again with updated info to create a new listing.",
  },
  {
    q: 'Is my email or phone visible to everyone?',
    a: 'No. Your contact info is hidden from all public pages and API responses. Only a recruiter who pays $5 can see it.',
  },
  {
    q: 'What emails count as "work emails" for recruiters?',
    a: 'Any email domain that isn\'t a free personal provider (Gmail, Yahoo, Outlook, Hotmail, iCloud, etc.). Your company domain is fine.',
  },
  {
    q: "What does the recruiter's $5 unlock give them?",
    a: 'Your email and phone number (if provided). They get permanent access to this info in their dashboard.',
  },
  {
    q: 'Is there a subscription or monthly fee?',
    a: 'No. Candidates pay once to list. Recruiters pay per unlock. No recurring fees.',
  },
  {
    q: 'Can I get a refund?',
    a: 'All sales are final since listings go live instantly. Contact us if you experience a technical error.',
  },
  {
    q: 'What categories are available?',
    a: 'Engineering, Design, Marketing, Sales, and Ops.',
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-black text-white">Frequently Asked Questions</h1>
      <div className="space-y-5">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border border-border bg-bg-card p-5">
            <h2 className="mb-2 font-semibold text-white">{faq.q}</h2>
            <p className="text-sm text-muted">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}