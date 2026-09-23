import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import NextTopLoader from 'nextjs-toploader';
import { ToastContainer } from '@/components/Toast';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bidforhire.lol';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'BidForHire — Pay-to-Rank Hiring Leaderboard',
    template: '%s | BidForHire',
  },
  description:
    'Candidates bid for visibility. Recruiters pay once to unlock contact info. The open hiring leaderboard.',
  openGraph: {
    title: 'BidForHire — Pay-to-Rank Hiring Leaderboard',
    description:
      'Candidates bid for visibility. Recruiters pay once to unlock contact info. The open hiring leaderboard.',
    url: siteUrl,
    siteName: 'BidForHire',
    images: [
      {
        url: '/og-image.png',
        width: 1024,
        height: 764,
        alt: 'BidForHire — Pay-to-Rank Hiring Leaderboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BidForHire — Pay-to-Rank Hiring Leaderboard',
    description:
      'Candidates bid for visibility. Recruiters pay once to unlock contact info. The open hiring leaderboard.',
    images: ['/og-image.png'],
  },
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-background">
      <body className="flex min-h-full min-h-screen flex-col bg-background font-sans text-foreground">
        <NextTopLoader color="#7c3aed" height={3} showSpinner={false} shadow="0 0 10px #7c3aed,0 0 5px #7c3aed" />
        <Navbar />
        <main className="flex-1">{children}</main>
        <ToastContainer />

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer className="relative mt-auto overflow-hidden border-t-2 border-border bg-foreground px-4 py-12 pb-24 text-white lg:pb-12">
          {/* Big watermark */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
          >
            <span
              className="font-display font-extrabold uppercase tracking-tighter text-white/[0.04]"
              style={{ fontSize: '15vw', whiteSpace: 'nowrap' }}
            >
              BidForHire
            </span>
          </div>

          {/* Decorative circle top-right */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20" />

          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
            <Link href="/" className="font-display text-2xl font-extrabold text-white">
              Bid<span className="text-tertiary">For</span>Hire
            </Link>

            <nav className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm font-medium text-white/60">
              {[
                { href: '/about',   label: 'About'   },
                { href: '/contact', label: 'Contact' },
                { href: '/pricing', label: 'Pricing' },
                { href: '/refund',  label: 'Refund Policy' },
                { href: '/rules',   label: 'Rules'   },
                { href: '/faq',     label: 'FAQ'     },
                { href: '/privacy', label: 'Privacy' },
                { href: '/terms',   label: 'Terms'   },
              ].map(({ href, label }) => (
                <Link key={href} href={href} className="transition-colors hover:text-tertiary">
                  {label}
                </Link>
              ))}
            </nav>

            <p className="text-xs text-white/30">
              © {new Date().getFullYear()} BidForHire. Pay to rank. Stay honest.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}