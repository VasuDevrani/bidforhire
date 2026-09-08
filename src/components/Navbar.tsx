import Link from 'next/link';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-stone-900">
            Bid<span className="text-accent">ForHire</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/recruiter/signup" className="text-muted transition-colors hover:text-stone-900">
            Hire
          </Link>
          <Link href="/recruiter/dashboard" className="text-muted transition-colors hover:text-stone-900">
            Dashboard
          </Link>
          <Link href="/faq" className="text-muted transition-colors hover:text-stone-900">
            FAQ
          </Link>
          <Link
            href="/submit"
            className="rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            List Yourself
          </Link>
        </nav>
      </div>
    </header>
  );
}