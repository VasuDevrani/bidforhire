'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface NavbarCtaProps {
  isRecruiter: boolean;
}

export function NavbarCta({ isRecruiter }: NavbarCtaProps) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  // On the homepage we hide the navbar button while the hero "List Yourself"
  // button is visible in the viewport. Once it scrolls away, we reveal it.
  // Initial state = true (hero button assumed visible on page load).
  const [heroCtaInView, setHeroCtaInView] = useState(true);

  useEffect(() => {
    if (!isHome) return;

    const el = document.getElementById('hero-list-yourself');
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroCtaInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isHome]);

  if (isRecruiter) {
    return (
      <Link
        href="/recruiter/dashboard"
        className="btn-pop flex items-center gap-2 rounded-full border-2 border-foreground
                   bg-accent px-4 py-2 font-display text-sm font-bold text-white shadow-pop"
      >
        My Dashboard
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-accent">
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    );
  }

  // On homepage: hide while the hero CTA is still in view
  if (isHome && heroCtaInView) return null;

  return (
    <Link
      href="/submit"
      className="btn-pop flex items-center gap-2 rounded-full border-2 border-foreground
                 bg-accent px-4 py-2 font-display text-sm font-bold text-white shadow-pop"
    >
      List Yourself
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-accent">
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}