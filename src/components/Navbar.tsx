import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex justify-center px-4 py-3 pointer-events-none">
      <nav
        className="pointer-events-auto flex w-full max-w-3xl items-center justify-between
                   rounded-full border-2 border-foreground bg-white/95 px-5 py-2.5
                   shadow-pop backdrop-blur-sm"
      >
        {/* Logo mark */}
        <Link href="/" className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full
                       border-2 border-foreground bg-accent font-display
                       text-sm font-extrabold text-white shadow-pop-sm"
          >
            B
          </span>
          <span className="font-display text-base font-extrabold tracking-tight text-foreground">
            Bid<span className="text-accent">For</span>Hire
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-6 text-sm font-semibold sm:flex">
          <Link
            href="/recruiter/signup"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Hire
          </Link>
          <Link
            href="/recruiter/dashboard"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/faq"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            FAQ
          </Link>
        </nav>

        {/* CTA — Candy Button */}
        <Link
          href="/submit"
          className="btn-pop flex items-center gap-2 rounded-full border-2 border-foreground
                     bg-accent px-4 py-2 font-display text-sm font-bold text-white shadow-pop"
        >
          List Yourself
          {/* Arrow in white circle */}
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-accent">
            →
          </span>
        </Link>
      </nav>
    </header>
  );
}