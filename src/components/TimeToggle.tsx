'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

const OPTIONS = [
  { label: 'All-time', value: 'all' },
  { label: 'This Week', value: 'week' },
  { label: 'Today', value: 'today' },
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
    <div className="flex overflow-hidden rounded-lg border border-border">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTimeframe(opt.value)}
          className={`px-3 py-1.5 text-sm font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
            current === opt.value
              ? 'bg-bg-card text-stone-900'
              : 'text-muted hover:text-stone-900'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}