'use client';

import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { loadRazorpayCheckout } from '@/lib/razorpay-checkout';

interface BoostBidWidgetProps {
  candidateId: string;
  currentBidCents: number;
  /** Current leaderboard #1 bid */
  topBidCents: number;
  /** This candidate's current rank (if known) */
  currentRank?: number | null;
}

export function BoostBidWidget({
  candidateId,
  currentBidCents,
  topBidCents,
  currentRank,
}: BoostBidWidgetProps) {
  const isLeader = currentBidCents >= topBidCents;
  const currentBidDollars = Math.floor(currentBidCents / 100);
  const topBidDollars = Math.floor(topBidCents / 100);

  const [topUp, setTopUp] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topUpDollars = parseInt(topUp, 10);
  const isValidTopUp = !isNaN(topUpDollars) && topUpDollars >= 1;
  const newTotalDollars = isValidTopUp ? currentBidDollars + topUpDollars : null;

  // Will they overtake the current #1?
  const willClaimTop1 =
    newTotalDollars !== null && newTotalDollars * 100 > topBidCents;

  // How much more (in dollars) they'd need to claim #1 given the current top-up
  const dollarsNeededForTop1 =
    !isLeader && newTotalDollars !== null && !willClaimTop1
      ? topBidDollars + 1 - newTotalDollars
      : null;

  async function handleBoost() {
    setError(null);
    if (!isValidTopUp) {
      setError('Top-up must be at least $1');
      return;
    }

    // The API still expects the new total (newAmountCents); we compute it here.
    const newAmountCents = newTotalDollars! * 100;

    setLoading(true);
    try {
      const res = await fetch('/api/checkout/rebid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, newAmountCents }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        setLoading(false);
        return;
      }

      const ready = await loadRazorpayCheckout();
      if (!ready) {
        setError('Could not load payment gateway — please try again.');
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
        amount: data.amount,
        currency: data.currency,
        name: 'BidForHire',
        description: `Top-up $${topUpDollars} → new bid $${newTotalDollars}`,
        order_id: data.orderId,
        theme: { color: '#6366f1' },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (response) => {
          try {
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              setError(verifyData.error || 'Payment verification failed. Contact support.');
              setLoading(false);
              return;
            }
            window.location.href = `/candidate/${data.candidateId}?boosted=1`;
          } catch {
            setError('Verification failed — if you were charged, contact support.');
            setLoading(false);
          }
        },
      });

      rzp.open();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-2xl border-2 border-foreground bg-card p-5 shadow-pop">
      {/* Header */}
      <div className="mb-1 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-accent" />
        <h2 className="font-bold text-foreground">Boost Your Bid</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        {isLeader
          ? "You're #1! Enter how much you'd like to add."
          : 'Enter a top-up amount — you only pay the difference.'}
      </p>

      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-bold text-muted-foreground">
            $
          </span>
          <input
            type="number"
            min={1}
            step={1}
            value={topUp}
            onChange={(e) => setTopUp(e.target.value)}
            className="w-full rounded-xl border-2 border-foreground bg-background py-2.5 pl-7 pr-3 font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="1"
          />
        </div>
        <button
          onClick={handleBoost}
          disabled={loading || !isValidTopUp}
          className="btn-pop rounded-xl border-2 border-foreground bg-accent px-5 py-2.5 font-display font-bold text-white shadow-pop disabled:opacity-60"
        >
          {loading ? 'Loading…' : 'Boost →'}
        </button>
      </div>

      {error && <p className="mt-2 text-sm font-medium text-red-500">{error}</p>}

      {/* Breakdown — only shown when input is valid */}
      {isValidTopUp && newTotalDollars !== null && (
        <div className="mt-4 rounded-xl border border-foreground/10 bg-background/60 p-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Current bid</span>
            <span className="font-medium text-foreground">${currentBidDollars}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>+ Top-up (you pay)</span>
            <span className="font-medium text-foreground">${topUpDollars}</span>
          </div>

          <div className="my-2 border-t border-foreground/10" />

          <div className="flex justify-between font-bold">
            <span>New total bid</span>
            <span className="text-accent">${newTotalDollars}</span>
          </div>

          <div className="mt-1 flex justify-between">
            <span className="text-muted-foreground">New rank</span>
            {willClaimTop1 ? (
              <span className="font-semibold text-green-600">#1 🎉</span>
            ) : dollarsNeededForTop1 !== null && dollarsNeededForTop1 > 0 ? (
              <span className="text-muted-foreground">
                Below #1{' '}
                <span className="text-xs">(add ${dollarsNeededForTop1} more to claim it)</span>
              </span>
            ) : (
              <span className="text-muted-foreground">
                {currentRank ? `#${currentRank}` : '—'}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer context */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          Current bid:{' '}
          <span className="font-bold text-foreground">${currentBidDollars}</span>
        </span>
        <span>
          Current #1:{' '}
          <span className="font-bold text-foreground">${topBidDollars}</span>
        </span>
        {currentRank && (
          <span>
            Your rank:{' '}
            <span className="font-bold text-foreground">#{currentRank}</span>
          </span>
        )}
      </div>
    </div>
  );
}