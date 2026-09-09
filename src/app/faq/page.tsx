import type { Metadata } from 'next';
import {
  Infinity,
  TrendingDown,
  PenLine,
  Lock,
  AtSign,
  Unlock,
  Ban,
  RefreshCcw,
  LayoutGrid,
} from 'lucide-react';

export const metadata: Metadata = { title: 'FAQ — BidForHire' };

const SHADOW_VARIANTS = [
  { shadow: 'shadow-pop-violet', iconBg: 'bg-accent/10',     iconColor: 'text-accent'     },
  { shadow: 'shadow-pop-pink',   iconBg: 'bg-secondary/10',  iconColor: 'text-secondary'  },
  { shadow: 'shadow-pop-amber',  iconBg: 'bg-tertiary/20',   iconColor: 'text-amber-600'  },
  { shadow: 'shadow-pop-emerald',iconBg: 'bg-quaternary/10', iconColor: 'text-quaternary' },
];

const faqs = [
  {
    Icon: Infinity,
    q: 'How long does my listing stay up?',
    a: 'Forever. You pay once and your profile stays on the leaderboard indefinitely.',
  },
  {
    Icon: TrendingDown,
    q: 'What happens if someone outbids me?',
    a: "Your profile drops in rank but stays active. You're never removed — only re-ordered.",
  },
  {
    Icon: PenLine,
    q: 'Can I update my profile after listing?',
    a: "Not yet — profile editing isn't available. Submit again with updated info to create a new listing.",
  },
  {
    Icon: Lock,
    q: 'Is my email or phone visible to everyone?',
    a: 'No. Your contact info is hidden from all public pages and API responses. Only a recruiter who pays $5 can see it.',
  },
  {
    Icon: AtSign,
    q: 'What emails count as "work emails" for recruiters?',
    a: "Any email domain that isn't a free personal provider (Gmail, Yahoo, Outlook, Hotmail, iCloud, etc.). Your company domain is fine.",
  },
  {
    Icon: Unlock,
    q: "What does the recruiter's $5 unlock give them?",
    a: 'Your email and phone number (if provided). They get permanent access to this info in their dashboard.',
  },
  {
    Icon: Ban,
    q: 'Is there a subscription or monthly fee?',
    a: 'No. Candidates pay once to list. Recruiters pay per unlock. No recurring fees.',
  },
  {
    Icon: RefreshCcw,
    q: 'Can I get a refund?',
    a: 'All sales are final since listings go live instantly. Contact us if you experience a technical error.',
  },
  {
    Icon: LayoutGrid,
    q: 'What categories are available?',
    a: 'Engineering, Design, Marketing, Sales, and Ops.',
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent shadow-pop-sm">
          <Lock className="h-4 w-4" />
          FAQ
        </div>
        <h1 className="font-display text-4xl font-black text-foreground">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-muted-foreground">Everything you need to know about BidForHire.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => {
          const { shadow, iconBg, iconColor } = SHADOW_VARIANTS[i % SHADOW_VARIANTS.length];
          const Icon = faq.Icon;
          return (
            <div
              key={i}
              className={`rounded-2xl border-2 border-foreground bg-card p-5 transition-all hover:-translate-y-0.5 ${shadow}`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-foreground ${iconBg}`}>
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <div>
                  <h2 className="font-bold text-foreground">{faq.q}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}