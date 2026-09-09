export const MIN_BID_CENTS = 100; // $1 — minimum to list
export const MAX_BID_CENTS = 99_999_900; // $999,999 hard cap
export const MIN_OUTBID_INCREASE_CENTS = 100; // must beat current #1 by at least $1
export const UNLOCK_PRICE_CENTS = Number(process.env.UNLOCK_PRICE_CENTS) || 500; // $5
export const MAX_UNLOCKS_PER_DAY = 20;

export const CATEGORIES = ['Engineering', 'Design', 'Marketing', 'Sales', 'Ops'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_SLUGS: Record<string, string> = {
  Engineering: 'engineering',
  Design: 'design',
  Marketing: 'marketing',
  Sales: 'sales',
  Ops: 'ops',
};

export const SLUG_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUGS).map(([k, v]) => [v, k])
);

export const FREE_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'mail.com',
  'live.com',
  'msn.com',
  'ymail.com',
  'googlemail.com',
  'me.com',
  'yahoo.co.uk',
  'hotmail.co.uk',
];