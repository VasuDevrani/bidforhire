'use client';

import { useState, useEffect, useRef } from 'react';
import { TrendingUp, ArrowRight, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { loadRazorpayCheckout } from '@/lib/razorpay-checkout';
import { toast } from '@/components/Toast';

interface BoostBidWidgetProps {
  candidateId: string;
  candidateName?: string;
  currentBidCents: number;
  /** Current leaderboard #1 bid */
  topBidCents: number;
  /** This candidate's current rank (if known) */
  currentRank?: number | null;
  /** Allow collapsing in dense layouts */
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function BoostBidWidget({
  candidateId,
  candidateName,
  currentBidCents,
  topBidCents,
  currentRank,
  collapsible = false,
  defaultOpen = true,
}: BoostBidWidgetProps) {
  const isLeader = currentBidCents >= topBidCents;
  const currentBidDollars = Math.floor(currentBidCents / 100);
  const topBidDollars = Math.floor(topBidCents / 100);

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [topUp, setTopUp] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const targetBidRef = useRef<number>(0);

  const topUpDollars = parseInt(topUp, 10);
  const isValidTopUp = !isNaN(topUpDollars) && topUpDollars >= 1;
  const newTotalDollars = isValidTopUp ? currentBidDollars + topUpDollars : null;

  async function checkPaymentStatus(targetBid: number): Promise<boolean> {
    if (!targetBid) return false;
    try {
      const res = await fetch(
        `/api/checkout/status?flow=boost&candidateId=${candidateId}&minBid=${targetBid}`
      );
      if (!res.ok) return false;
      const json = await res.json();
      return !!json.completed;
    } catch {
      return false;
    }
  }

  // Poll in background and listen for visibility changes when user switches back from UPI/Paytm apps
  useEffect(() => {
    if (!loading) return;

    let pollCount = 0;
    const interval = setInterval(async () => {
      pollCount++;
      const done = await checkPaymentStatus(targetBidRef.current);
      if (done) {
        clearInterval(interval);
        window.location.href = `/candidate/${candidateId}?boosted=1`;
      }
      if (pollCount > 20) {
        clearInterval(interval);
      }
    }, 2000);

    const onVisible = async () => {
      if (document.visibilityState === 'visible') {
        const done = await checkPaymentStatus(targetBidRef.current);
        if (done) {
          clearInterval(interval);
          window.location.href = `/candidate/${candidateId}?boosted=1`;
        }
      }
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [loading, candidateId]);

  // Will they overtake the current #1?
  const willClaimTop1 =
    newTotalDollars !== null && newTotalDollars * 100 > topBidCents;

  // How much more (in dollars) they'd need to claim #1 given the current top-up
  const dollarsNeededForTop1 =
    !isLeader && newTotalDollars !== null && !willClaimTop1
      ? topBidDollars + 1 - newTotalDollars
      : null;

  const dollarsToOvertakeFromCurrent = !isLeader ? topBidDollars + 1 - currentBidDollars : 0;

  async function handleBoost() {
    if (!isValidTopUp) {
      toast.error('Top-up must be at least $1');
      return;
    }

    // The API still expects the new total (newAmountCents); we compute it here.
    const newAmountCents = newTotalDollars! * 100;
    targetBidRef.current = newAmountCents;

    setLoading(true);
    try {
      const res = await fetch('/api/checkout/rebid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, newAmountCents }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Something went wrong');
        setLoading(false);
        return;
      }

      const ready = await loadRazorpayCheckout();
      if (!ready) {
        toast.error('Could not load payment gateway - please try again.');
        setLoading(false);
        return;
      }

      const callbackUrl = `${window.location.origin}/api/checkout/callback?flow=boost&candidateId=${candidateId}`;

      const rzp = new window.Razorpay({
        key: data.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
        amount: data.amount,
        currency: data.currency,
        name: 'BidForHire',
        description: `Top-up $${topUpDollars} → new bid $${newTotalDollars}`,
        order_id: data.orderId,
        callback_url: callbackUrl,
        redirect: true,
        theme: { color: '#6366f1' },
        modal: {
          confirm_close: false,
          handleback: true,
          ondismiss: async () => {
            // Check if webhook already completed the payment while user was in Paytm
            const done = await checkPaymentStatus(newAmountCents);
            if (done) {
              window.location.href = `/candidate/${candidateId}?boosted=1`;
              return;
            }
            setLoading(false);
          },
        },
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
              toast.error(verifyData.error || 'Payment verification failed. Contact support.');
              setLoading(false);
              return;
            }
            window.location.href = `/candidate/${data.candidateId}?boosted=1`;
          } catch {
            toast.error('Verification failed - if you were charged, contact support.');
            setLoading(false);
          }
        },
      });

      rzp.on('payment.failed', (response: any) => {
        setLoading(false);
        toast.error(response?.error?.description || 'Payment was cancelled or failed.');
      });

      rzp.open();
    } catch {
      toast.error('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border-2 border-foreground bg-card p-5">
      {/* Header */}
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-foreground bg-accent/20 text-accent">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-foreground">
                {candidateName ? `Are you ${candidateName}?` : 'Boost Your Bid'}
              </h2>
              <p className="text-xs text-muted-foreground">Top-up to climb the leaderboard</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-accent">
            <span>{isOpen ? 'Close' : 'Boost'}</span>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>
      ) : (
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-foreground bg-accent/20 text-accent">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h2 className="font-display text-base font-bold text-foreground">Boost Your Bid</h2>
          </div>
          {isLeader && (
            <span className="rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
              Rank #1 👑
            </span>
          )}
        </div>
      )}

      {/* Body */}
      {isOpen && (
        <div className={collapsible ? 'mt-4 border-t border-border pt-4' : 'mt-2'}>
          <p className="mb-3 text-xs text-muted-foreground">
            {isLeader
              ? "You're currently holding #1! Add more to lock in your top spot."
              : 'Enter a top-up amount - you only pay the incremental difference.'}
          </p>

          {/* Quick preset buttons */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {[1, 5, 10].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setTopUp(String(amt))}
                className={`rounded-lg border-2 px-2.5 py-1 text-xs font-bold transition-all ${
                  topUpDollars === amt
                    ? 'border-foreground bg-foreground text-background shadow-xs'
                    : 'border-foreground/30 bg-background hover:border-foreground text-foreground'
                }`}
              >
                +${amt}
              </button>
            ))}
            {!isLeader && dollarsToOvertakeFromCurrent > 0 && (
              <button
                type="button"
                onClick={() => setTopUp(String(dollarsToOvertakeFromCurrent))}
                className={`flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-xs font-bold transition-all ${
                  topUpDollars === dollarsToOvertakeFromCurrent
                    ? 'border-accent bg-accent text-white shadow-xs'
                    : 'border-accent/40 bg-accent/10 hover:border-accent text-accent'
                }`}
              >
                <Zap className="h-3 w-3" />
                Claim #1 (+${dollarsToOvertakeFromCurrent})
              </button>
            )}
          </div>

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
                className="w-full rounded-xl border-2 border-foreground bg-background py-2 pl-7 pr-3 font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                placeholder="1"
              />
            </div>
            <button
              onClick={handleBoost}
              disabled={loading || !isValidTopUp}
              className="btn-pop rounded-xl border-2 border-foreground bg-accent px-4 py-2 font-display text-sm font-bold text-white shadow-pop disabled:opacity-60"
            >
              {loading ? 'Loading…' : <span className="flex items-center gap-1.5">Boost <ArrowRight className="h-3.5 w-3.5 shrink-0" /></span>}
            </button>
          </div>

          {/* Breakdown — only shown when input is valid */}
          {isValidTopUp && newTotalDollars !== null && (
            <div className="mt-3 rounded-xl border-2 border-foreground/10 bg-background/80 p-3 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Current bid</span>
                <span className="font-semibold text-foreground">${currentBidDollars}</span>
              </div>
              <div className="mt-1 flex justify-between text-muted-foreground">
                <span>+ Top-up (you pay now)</span>
                <span className="font-semibold text-foreground">${topUpDollars}</span>
              </div>

              <div className="my-2 border-t border-foreground/10" />

              <div className="flex justify-between font-bold text-sm">
                <span>New total bid</span>
                <span className="text-accent">${newTotalDollars}</span>
              </div>

              <div className="mt-1 flex justify-between">
                {willClaimTop1 ? (
                  <span className="font-bold text-green-600">#1 🎉 (Top Position)</span>
                ) : dollarsNeededForTop1 !== null && dollarsNeededForTop1 > 0 ? (
                  <span className="text-muted-foreground">
                    Below #1{' '}
                    <span className="text-[11px] font-medium text-accent ml-auto">
                      (add ${dollarsNeededForTop1} more to claim #1)
                    </span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {currentRank ? `#${currentRank}` : '-'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer context */}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span>
              #1 Bid: <strong className="text-foreground">${topBidDollars}</strong>
            </span>
            {currentRank && (
              <>
                <span>·</span>
                <span>
                  Your Rank: <strong className="text-foreground">#{currentRank}</strong>
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}