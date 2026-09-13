import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SignOutButton } from '@/components/SignOutButton';
import { NavbarCta } from '@/components/NavbarCta';

export async function Navbar() {
  const session = await getServerSession(authOptions);
  const isRecruiter = !!session?.user;
  const recruiterEmail = session?.user?.email ?? '';

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
          {/* "Hire" only shown when NOT logged in — no need to re-enter as recruiter */}
          {!isRecruiter && (
            <Link
              href="/recruiter/signup"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Hire
            </Link>
          )}
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

          {/* Signed-in recruiter: sign-out only */}
          {isRecruiter && (
            <div className="flex items-center gap-3 border-l-2 border-border pl-4">
              <SignOutButton />
            </div>
          )}
        </nav>

        {/* CTA — route-aware client component (hides "List Yourself" on homepage) */}
        <NavbarCta isRecruiter={isRecruiter} />
      </nav>
    </header>
  );
}