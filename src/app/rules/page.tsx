import type { Metadata } from 'next';
import type { LucideIcon } from 'lucide-react';
import {
  BadgeDollarSign,
  Ban,
  Building2,
  CheckCircle2,
  Eye,
  FileCheck2,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Trophy,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Rules — BidForHire',
  description: 'The rules for listing candidates, rankings, and recruiter contact unlocks on BidForHire.',
};

interface SectionDef {
  Icon: LucideIcon;
  title: string;
  iconColor: string;
  cardBg: string;
  shadow: string;
  content: React.ReactNode;
}

const sections: SectionDef[] = [
  {
    Icon: Trophy,
    title: 'The leaderboard',
    iconColor: 'text-amber-600',
    cardBg: 'bg-tertiary/20',
    shadow: 'shadow-pop-amber',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        BidForHire is a public hiring leaderboard. Candidates pay a one-time bid for visibility;
        recruiters pay a one-time fee to unlock contact details. There are no ads, subscriptions,
        revenue shares, or guaranteed hiring outcomes. A candidate&apos;s rank is determined by
        their confirmed bid amount—nothing else.
      </p>
    ),
  },
  {
    Icon: BadgeDollarSign,
    title: 'How ranking works',
    iconColor: 'text-accent',
    cardBg: 'bg-accent/10',
    shadow: 'shadow-pop-violet',
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed">
          A completed payment activates a candidate listing and places it on the all-time board.
          Listings are ordered by confirmed bid amount, highest first. Equal bids are ordered by
          payment time, with the older confirmed listing retaining the higher position.
        </p>
        <ul className="mt-3 space-y-1.5">
          {[
            'New bids must be whole US dollars: $10 minimum and $999,999 maximum.',
            'To take #1, a new bid must be at least $5 above the current #1 bid.',
            'A bid below #1 can still be listed at the position that its amount earns.',
            'A completed payment—not a checkout session or redirect—is what claims a rank.',
            'Listings remain active unless removed under these rules or applicable law.',
          ].map((item) => (
            <RuleItem key={item} color="text-accent" text={item} />
          ))}
        </ul>
      </>
    ),
  },
  {
    Icon: Eye,
    title: 'The boards',
    iconColor: 'text-quaternary',
    cardBg: 'bg-quaternary/10',
    shadow: 'shadow-pop-emerald',
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed">
          The same active listings can be viewed through different time filters. Filters do not
          reset, change, or expire a bid; they only change which recently created listings are
          visible in that view.
        </p>
        <ul className="mt-3 space-y-1.5">
          <RuleItem color="text-quaternary" text="All-time is the main board and includes every active listing." />
          <RuleItem color="text-quaternary" text="This Week includes candidates whose listings were created since the start of the current local week." />
          <RuleItem color="text-quaternary" text="Today includes candidates whose listings were created since the start of the current local day." />
        </ul>
      </>
    ),
  },
  {
    Icon: FileCheck2,
    title: 'What candidates may list',
    iconColor: 'text-secondary',
    cardBg: 'bg-secondary/10',
    shadow: 'shadow-pop-pink',
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed">
          You may list yourself as a real candidate seeking professional work. Your name, role,
          skills, summary, and social or portfolio links must be accurate, current, and yours to
          publish. By submitting a listing, you confirm that you are authorised to provide the
          information and links included in it.
        </p>
        <ul className="mt-3 space-y-1.5">
          {[
            'Do not impersonate another person, submit a false identity, or misrepresent qualifications, work history, availability, or location.',
            'Do not include another person’s private contact details, confidential information, or content you do not have permission to use.',
            'Portfolio and social links must lead to professional, accessible destinations. Links to malware, phishing, adult content, illegal activity, or group-chat/invite services are prohibited.',
            'Do not use affiliate, referral, tracking, or link-shortener URLs. Query parameters may be removed before a link is displayed.',
            'Do not create duplicate, misleading, or spam listings to manipulate rank or visibility.',
          ].map((item) => (
            <RuleItem key={item} color="text-secondary" text={item} />
          ))}
        </ul>
      </>
    ),
  },
  {
    Icon: LockKeyhole,
    title: 'Contact information and unlocks',
    iconColor: 'text-accent',
    cardBg: 'bg-accent/5',
    shadow: 'shadow-pop',
    content: (
      <>
        <p className="text-muted-foreground leading-relaxed">
          Candidate email addresses and phone numbers are never public. A recruiter with an
          approved work-email account may pay $5 to unlock a candidate&apos;s submitted email and,
          when provided, phone number. The unlock is a one-time purchase tied to that recruiter
          account and remains available in its dashboard.
        </p>
        <ul className="mt-3 space-y-1.5">
          <RuleItem color="text-accent" text="Recruiters may unlock up to 20 candidates per day." />
          <RuleItem color="text-accent" text="Unlocked contact details are for legitimate recruitment purposes only." />
          <RuleItem color="text-accent" text="Do not sell, publish, scrape, transfer, or use unlocked details for marketing, spam, or any purpose unrelated to recruiting." />
        </ul>
      </>
    ),
  },
  {
    Icon: Building2,
    title: 'Recruiter eligibility and conduct',
    iconColor: 'text-quaternary',
    cardBg: 'bg-quaternary/10',
    shadow: 'shadow-pop-emerald',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        Recruiter accounts require a genuine work email address. Personal email providers and
        attempts to bypass account or unlock limits are not allowed. Recruiters must comply with
        applicable employment, privacy, anti-discrimination, and anti-spam laws when contacting
        candidates. An unlock does not create an employment relationship, consent to unrelated
        marketing, or any guarantee that a candidate will respond.
      </p>
    ),
  },
  {
    Icon: ShieldCheck,
    title: 'Safety, moderation, and enforcement',
    iconColor: 'text-secondary',
    cardBg: 'bg-secondary/10',
    shadow: 'shadow-pop-pink',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        We may review, reject, edit, suspend, or remove listings and restrict recruiter access
        where we reasonably believe content or conduct is misleading, harmful, unlawful, abusive,
        discriminatory, infringing, fraudulent, or intended to manipulate the service. We may
        also act to protect candidate privacy and platform integrity. Removal or restriction for a
        rule violation does not create a right to a refund.
      </p>
    ),
  },
  {
    Icon: Scale,
    title: 'Payments, refunds, and acceptance',
    iconColor: 'text-amber-600',
    cardBg: 'bg-tertiary/20',
    shadow: 'shadow-pop-amber',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        Prices are in USD and payments are processed by Dodo Payments. Payments are final once a
        listing is activated or contact details are unlocked. If a technical issue prevents the
        purchased action from being delivered, contact support so we can investigate. By paying or
        using BidForHire, you agree to these Rules, the{' '}
        <a href="/terms" className="font-semibold text-foreground underline decoration-accent underline-offset-2">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="font-semibold text-foreground underline decoration-accent underline-offset-2">
          Privacy Policy
        </a>.
      </p>
    ),
  },
  {
    Icon: Ban,
    title: 'No guarantees',
    iconColor: 'text-accent',
    cardBg: 'bg-accent/10',
    shadow: 'shadow-pop-violet',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        Visibility and an unlock do not guarantee interviews, offers, candidate suitability,
        candidate availability, or recruiter responses. Candidates and recruiters remain solely
        responsible for their own communications, decisions, and compliance obligations.
      </p>
    ),
  },
];

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-tertiary/30 px-4 py-1.5 text-sm font-bold text-foreground shadow-pop-sm">
          <Trophy className="h-4 w-4" />
          How BidForHire Works
        </div>
        <h1 className="font-display text-4xl font-black text-foreground">BidForHire Rules</h1>
        <p className="mt-3 text-muted-foreground">
          Clear ranking, responsible recruiting, and protected candidate data.
        </p>
      </div>

      <div className="space-y-5">
        {sections.map(({ Icon, title, iconColor, cardBg, shadow, content }) => (
          <section key={title} className={`rounded-2xl border-2 border-foreground ${cardBg} p-6 ${shadow}`}>
            <div className="mb-3 flex items-center gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-card ${shadow}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
              <h2 className="font-display text-xl font-black text-foreground">{title}</h2>
            </div>
            {content}
          </section>
        ))}
      </div>
    </div>
  );
}

function RuleItem({ color, text }: { color: string; text: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-muted-foreground">
      <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${color}`} />
      <span>{text}</span>
    </li>
  );
}