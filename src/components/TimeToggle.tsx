'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const OPTIONS = [
  { label: 'All time', value: 'all' },
  { label: 'This Week', value: 'week' },
  { label: 'Today',     value: 'today' },
] as const;

export function TimeToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get('timeframe') || 'all';

  function setTimeframe(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('timeframe');
    } else {
      params.set('timeframe', value);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex overflow-hidden rounded-full border-2 border-foreground bg-white shadow-pop-sm">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTimeframe(opt.value)}
          className={`px-3 py-1.5 font-display text-sm font-bold transition-colors duration-150
                      first:rounded-l-full last:rounded-r-full
                      ${current === opt.value
                        ? 'bg-tertiary text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}