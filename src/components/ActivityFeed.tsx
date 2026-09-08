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
      <p className="py-4 text-center text-sm text-muted">No activity yet — be the first!</p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {activities.map((a, i) => (
        <li key={i} className="flex items-center gap-3 py-2.5">
          {/* Icon */}
          <span
            className={`text-lg ${a.type === 'bid' ? 'text-accent' : 'text-emerald-500'}`}
          >
            {a.type === 'bid' ? '⬆' : '🔓'}
          </span>

          {/* Description */}
          <div className="min-w-0 flex-1 text-sm">
            {a.type === 'bid' ? (
              <span className="text-stone-800">
                Someone bid{' '}
                <span className="font-semibold text-accent">{formatCents(a.amountCents)}</span> to
                list{' '}
                <Link href={`/candidate/${a.candidateId}`} className="font-medium text-stone-900 hover:text-accent">
                  {a.candidateName}
                </Link>{' '}
                <span className="text-muted">({a.candidateRole})</span>
              </span>
            ) : (
              <span className="text-stone-800">
                A recruiter unlocked{' '}
                <Link href={`/candidate/${a.candidateId}`} className="font-medium text-stone-900 hover:text-accent">
                  {a.candidateName}
                </Link>{' '}
                <span className="text-muted">({a.candidateRole})</span>
              </span>
            )}
          </div>

          {/* Time */}
          <span className="shrink-0 text-xs text-muted">{timeAgo(a.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}