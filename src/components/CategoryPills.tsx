'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { CATEGORIES, CATEGORY_SLUGS } from '@/lib/constants';

export function CategoryPills() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('category') || 'all';

  function setCategory(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {['All', ...CATEGORIES].map((cat) => {
        const slug = cat === 'All' ? 'all' : CATEGORY_SLUGS[cat] || cat.toLowerCase();
        const active = slug === current;
        return (
          <button
            key={cat}
            onClick={() => setCategory(slug)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'border-accent bg-accent text-white'
                : 'border-border text-muted hover:border-stone-400 hover:text-stone-900'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}