import type { Metadata } from 'next';
import { Mail, Clock, MapPin, MessageCircle, AlertCircle } from 'lucide-react';
import { BackToLeaderboard } from '@/components/BackToLeaderboard';

export const metadata: Metadata = { title: 'Contact Us — BidForHire' };

const sections = [
  {
    icon: Mail,
    color: 'text-accent',
    bg: 'bg-accent/10',
    title: 'General Support',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        For questions about your listing, account, payments, or anything else, email us at{' '}
        <a
          href="mailto:support@bidforhire.lol"
          className="font-semibold text-accent hover:underline"
        >
          support@bidforhire.lol
        </a>
        . We respond to all enquiries within 1–2 business days.
      </p>
    ),
  },
  {
    icon: AlertCircle,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    title: 'Payment Issues',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        If you were charged but your listing or unlock did not activate, email{' '}
        <a
          href="mailto:support@bidforhire.lol"
          className="font-semibold text-accent hover:underline"
        >
          support@bidforhire.lol
        </a>{' '}
        with your Razorpay payment ID and we will resolve it within 1 business day.
      </p>
    ),
  },
  {
    icon: MessageCircle,
    color: 'text-quaternary',
    bg: 'bg-quaternary/10',
    title: 'Recruiter Enquiries',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        Interested in bulk access or enterprise pricing? Reach out at{' '}
        <a
          href="mailto:support@bidforhire.lol"
          className="font-semibold text-accent hover:underline"
        >
          support@bidforhire.lol
        </a>{' '}
        and include the name of your company and approximate monthly hiring volume.
      </p>
    ),
  },
  {
    icon: Clock,
    color: 'text-tertiary',
    bg: 'bg-tertiary/20',
    title: 'Response Times',
    content: (
      <ul className="space-y-2">
        {[
          'General support: within 1–2 business days',
          'Payment / billing issues: within 1 business day',
          'Data deletion requests: within 7 business days',
        ].map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-tertiary" />
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    icon: MapPin,
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    title: 'Location',
    content: (
      <p className="text-muted-foreground leading-relaxed">
        BidForHire is operated from <strong className="text-foreground font-bold">Gurgaon, India</strong>.
        Support is available Monday – Friday, 10 AM – 6 PM IST.
      </p>
    ),
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent shadow-pop-sm">
          <Mail className="h-4 w-4" />
          Contact Us
        </div>
        <h1 className="font-display text-4xl font-black text-foreground">Get in Touch</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We&apos;re a small team — email is the fastest way to reach us.
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