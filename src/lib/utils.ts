/** Format cents as a dollar string: 150 → "$1.50" */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, '')}`;
}

/** Relative time: "2h ago", "just now", etc. */
export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// ─── Email helpers ───────────────────────────────────────────────────────────

const FREE_EMAIL_DOMAINS_CLIENT = [
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
  'aol.com', 'protonmail.com', 'mail.com', 'live.com', 'msn.com',
  'ymail.com', 'googlemail.com', 'me.com', 'yahoo.co.uk', 'hotmail.co.uk',
];

/** Returns true if the email looks like a work email (not a free provider). */
export function isWorkEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return !FREE_EMAIL_DOMAINS_CLIENT.includes(domain);
}

// ─── Slugify ─────────────────────────────────────────────────────────────────

/** Slugify a string: "Front-End Dev" → "front-end-dev" */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Rank badge colour class based on position */
export function rankColor(rank: number): string {
  if (rank === 1) return 'text-accent';
  if (rank === 2) return 'text-accent';
  if (rank === 3) return 'text-accent';
  return 'text-stone-500';
}