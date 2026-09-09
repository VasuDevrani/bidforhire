import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SignOutButton } from '@/components/SignOutButton';

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

          {/* Signed-in recruiter: show truncated email + sign-out */}
          {isRecruiter && (
            <div className="flex items-center gap-3 border-l-2 border-border pl-4">
              <span
                className="max-w-[120px] truncate text-xs font-medium text-muted-foreground"
                title={recruiterEmail}
              >
                {recruiterEmail}
              </span>
              <SignOutButton />
            </div>
          )}
        </nav>

        {/* CTA — changes based on auth state */}
        {isRecruiter ? (
          <Link
            href="/recruiter/dashboard"
            className="btn-pop flex items-center gap-2 rounded-full border-2 border-foreground
                       bg-accent px-4 py-2 font-display text-sm font-bold text-white shadow-pop"
          >
            My Dashboard
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-accent">
              →
            </span>
          </Link>
        ) : (
          <Link
            href="/submit"
            className="btn-pop flex items-center gap-2 rounded-full border-2 border-foreground
                       bg-accent px-4 py-2 font-display text-sm font-bold text-white shadow-pop"
          >
            List Yourself
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-accent">
              →
            </span>
          </Link>
        )}
      </nav>
    </header>
  );
}