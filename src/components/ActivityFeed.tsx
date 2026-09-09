import Link from 'next/link';
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
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <span className="text-3xl">🌱</span>
        <p className="text-sm text-muted-foreground">No activity yet — be the first!</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {activities.map((a, i) => (
        <li
          key={i}
          className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-2.5"
        >
          {/* Colored icon badge */}
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs
                        ${a.type === 'bid'
                          ? 'bg-accent/10 text-accent'
                          : 'bg-quaternary/20 text-quaternary'
                        }`}
          >
            {a.type === 'bid' ? '↑' : '🔓'}
          </span>

          {/* Description */}
          <div className="min-w-0 flex-1 text-xs font-medium leading-snug">
            {a.type === 'bid' ? (
              <span className="text-foreground/80">
                Someone bid{' '}
                <span className="font-bold text-accent">{formatCents(a.amountCents)}</span>
                {' '}to list{' '}
                <Link
                  href={`/candidate/${a.candidateId}`}
                  className="font-semibold text-foreground hover:text-accent"
                >
                  {a.candidateName}
                </Link>{' '}
                <span className="text-muted-foreground">({a.candidateRole})</span>
              </span>
            ) : (
              <span className="text-foreground/80">
                A recruiter unlocked{' '}
                <Link
                  href={`/candidate/${a.candidateId}`}
                  className="font-semibold text-foreground hover:text-accent"
                >
                  {a.candidateName}
                </Link>{' '}
                <span className="text-muted-foreground">({a.candidateRole})</span>
              </span>
            )}
          </div>

          {/* Time */}
          <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}