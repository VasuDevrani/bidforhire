'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { CATEGORIES, CATEGORY_SLUGS } from '@/lib/constants';

export function CategoryPills() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('category') || 'all';

  function buildHref(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    params.delete('page');
    const qs = params.toString();
    return `${pathname}${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {['All', ...CATEGORIES].map((cat) => {
        const slug = cat === 'All' ? 'all' : CATEGORY_SLUGS[cat] || cat.toLowerCase();
        const active = slug === current;
        return (
          <Link
            key={cat}
            href={buildHref(slug)}
            scroll={false}
            prefetch={true}
            className={`shrink-0 rounded-full border-2 border-foreground
                        px-4 py-1.5 font-display text-sm font-bold
                        transition-all duration-200
                        ${active
                          ? 'bg-accent text-white'
                          : 'bg-white text-foreground hover:bg-tertiary'
                        }`}
          >
            {cat}
          </Link>
        );
      })}
    </div>
  );
}