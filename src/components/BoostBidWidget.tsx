'use client';

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface BoostBidWidgetProps {
  candidateId: string;
  currentBidCents: number;
  /** Current leaderboard #1 bid (to show minimum required) */
  topBidCents: number;
}

export function BoostBidWidget({ candidateId, currentBidCents, topBidCents }: BoostBidWidgetProps) {
  const isLeader = currentBidCents >= topBidCents;
  // Min new bid: must beat own current bid AND beat #1 by $1 (if not already #1)
  const minNewDollars = isLeader
    ? Math.floor(currentBidCents / 100) + 1
    : Math.max(
        Math.floor(currentBidCents / 100) + 1,
        Math.floor(topBidCents / 100) + 1
      );

  const [amount, setAmount] = useState<string>(String(minNewDollars));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBoost() {
    setError(null);
    const dollars = parseInt(amount, 10);
    if (isNaN(dollars) || dollars < minNewDollars) {
      setError(`Minimum bid is $${minNewDollars}`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout/rebid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, newAmountCents: dollars * 100 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }
      // Redirect to Dodo payment page
      window.location.href = data.paymentLink;
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border-2 border-foreground bg-card p-5 shadow-pop">
      <div className="mb-1 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-accent" />
        <h2 className="font-bold text-foreground">Boost Your Bid</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        {isLeader
          ? "You're #1! Increase your bid to stay ahead."
          : `Outbid the leader to claim #1. Minimum $${minNewDollars}.`}
      </p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-bold text-muted-foreground">
            $
          </span>
          <input
            type="number"
            min={minNewDollars}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border-2 border-foreground bg-background py-2.5 pl-7 pr-3 font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder={String(minNewDollars)}
          />
        </div>
        <button
          onClick={handleBoost}
          disabled={loading}
          className="btn-pop rounded-xl border-2 border-foreground bg-accent px-5 py-2.5 font-display font-bold text-white shadow-pop disabled:opacity-60"
        >
          {loading ? 'Loading…' : 'Boost →'}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm font-medium text-red-500">{error}</p>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Your current bid: <span className="font-bold text-foreground">${currentBidCents / 100}</span>
        {' · '}Current #1: <span className="font-bold text-foreground">${topBidCents / 100}</span>
      </p>
    </div>
  );
}