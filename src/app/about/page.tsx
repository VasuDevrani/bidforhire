import type { Metadata } from 'next';
import { Info, Target, Users, Zap, ShieldCheck, Globe } from 'lucide-react';
import { BackToLeaderboard } from '@/components/BackToLeaderboard';

export const metadata: Metadata = { title: 'About Us — BidForHire' };

const sections = [
  {
    icon: Target,
    color: 'text-accent',
    bg: 'bg-accent/10',
    title: 'Our Mission',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        BidForHire is a pay-to-rank hiring leaderboard that flips the traditional job board
        model. Instead of recruiters blasting candidates with cold messages, candidates bid
        for visibility and serious recruiters pay once to unlock contact details - creating a
        market where attention is earned, not spammed.
      </p>
    ),
  },
  {
    icon: Zap,
    color: 'text-tertiary',
    bg: 'bg-tertiary/20',
    title: 'How It Works',
    content: (
      <ul className="space-y-2">
        {[
          'Candidates submit a profile and place a minimum $1 bid to appear on the leaderboard.',
          'Higher bids rank higher - the leaderboard is sorted by bid amount in real time.',
          'Recruiters with verified work emails pay a one-time fee to unlock a candidate\'s contact info.',
          'All transactions are final and processed securely through Razorpay.',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Zap className="mt-0.5 h-4 w-4 shrink-0 text-tertiary" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: Users,
    color: 'text-quaternary',
    bg: 'bg-quaternary/10',
    title: 'Who We Serve',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        <strong className="text-foreground font-bold">Candidates</strong> - developers,
        designers, PMs, and other professionals actively or passively open to new
        opportunities who want their profile seen by the right people.
        <br />
        <br />
        <strong className="text-foreground font-bold">Recruiters</strong> - talent
        acquisition professionals and hiring managers at companies who want a high-signal
        pipeline of candidates who have already signalled intent.
      </p>
    ),
  },
  {
    icon: ShieldCheck,
    color: 'text-quaternary',
    bg: 'bg-quaternary/10',
    title: 'Our Values',
    content: (
      <ul className="space-y-2">
        {[
          'Transparency - every bid and rank is public.',
          'Honesty - no fake profiles; listings are manually reviewed.',
          'Privacy - contact details are gated and only shared with paying recruiters.',
          'Simplicity - no subscriptions, no dashboards, no noise.',
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
    icon: Globe,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    title: 'About the Company',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        BidForHire is an independent product built and operated by a small team. The service
        is available globally. For any enquiries, reach us at{' '}
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

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent shadow-pop-sm">
          <Info className="h-4 w-4" />
          About Us
        </div>
        <h1 className="font-display text-4xl font-black text-foreground">About BidForHire</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The open hiring leaderboard where candidates bid for visibility.
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

      <BackToLeaderboard />
    </div>
  );
}