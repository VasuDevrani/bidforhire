import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function BackToLeaderboard() {
  return (
    <div className="mt-10 flex justify-center">
      <Link
        href="/"
        className="btn-pop flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-5 py-2.5 font-display text-sm font-bold text-foreground shadow-pop-sm transition-colors hover:bg-tertiary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to leaderboard
      </Link>
    </div>
  );
}