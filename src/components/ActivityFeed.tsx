import Link from 'next/link';
import { ArrowUp, Unlock } from 'lucide-react';
import { formatCents, timeAgo } from '@/lib/utils';

type Activity = {
  type: 'bid' | 'unlock';
  candidateId: string;
  candidateName: string;
  candidateRole: string;
  amountCents: number;
  createdAt: Date;
};

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-muted-foreground">
        No live activity yet
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border/60">
      {activities.map((a, i) => (
        <li
          key={i}
          className="flex items-start justify-between gap-2.5 py-2.5 first:pt-0 last:pb-0 text-xs"
        >
          <div className="flex items-start gap-2 min-w-0">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                a.type === 'bid'
                  ? 'bg-accent/15 text-accent'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {a.type === 'bid' ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <Unlock className="h-3 w-3" />
              )}
            </span>

            <div className="min-w-0 flex-1 leading-snug">
              <p className="text-foreground/90">
                {a.type === 'bid' ? (
                  <>
                    <span className="font-bold text-accent">{formatCents(a.amountCents)}</span> bid on{' '}
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-emerald-700">Unlocked</span>{' '}
                  </>
                )}
                <Link
                  href={`/candidate/${a.candidateId}`}
                  className="font-bold text-foreground hover:text-accent hover:underline"
                >
                  {a.candidateName}
                </Link>
              </p>
              <p className="truncate text-[11px] text-muted-foreground">{a.candidateRole}</p>
            </div>
          </div>

          <span className="shrink-0 text-[11px] text-muted-foreground whitespace-nowrap pt-0.5">
            {timeAgo(a.createdAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}