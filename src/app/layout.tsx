import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

export const metadata: Metadata = {
  title: {
    default: 'BidForHire — Pay-to-Rank Hiring Leaderboard',
    template: '%s | BidForHire',
  },
  description:
    'Candidates bid for visibility. Recruiters pay to unlock contact info. The open hiring leaderboard.',
  openGraph: {
    siteName: 'BidForHire',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-bg text-white">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-border py-8 text-center text-xs text-muted">
          <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-6 gap-y-2 px-4">
            <Link href="/rules" className="hover:text-white">Rules</Link>
            <Link href="/faq" className="hover:text-white">FAQ</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <span className="text-muted/50">·</span>
            <span>© {new Date().getFullYear()} BidForHire</span>
          </div>
        </footer>
      </body>
    </html>
  );
}