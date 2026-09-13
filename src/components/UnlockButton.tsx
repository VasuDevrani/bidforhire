'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadRazorpayCheckout } from '@/lib/razorpay-checkout';
import { FREE_UNLOCKS_PER_RECRUITER } from '@/lib/constants';

interface UnlockButtonProps {
  candidateId: string;
  isAuthenticated: boolean;
  /** How many free unlocks this recruiter still has. 0 when unauthenticated or quota exhausted. */
  freeUnlocksRemaining: number;
}

export function UnlockButton({ candidateId, isAuthenticated, freeUnlocksRemaining }: UnlockButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Free unlock (no payment needed) ────────────────────────────────────────
  async function handleFreeUnlock() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/recruiter/unlock-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });
      const data = await res.json();

      if (res.status === 409) {
        // Already unlocked — refresh so the contact info appears
        router.refresh();
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }
      // Unlock created — refresh the server component to reveal contact info
      router.refresh();
    } catch {
      setError('Network error — please try again');
      setLoading(false);
    }
  }

  // ── Paid unlock via Razorpay ────────────────────────────────────────────────
  async function handlePaidUnlock() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });
      const data = await res.json();

      if (res.status === 409) {
        setError("You've already unlocked this candidate.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      const ready = await loadRazorpayCheckout();
      if (!ready) {
        setError('Could not load payment gateway — please check your connection and try again.');
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
        amount: data.amount,
        currency: data.currency,
        name: 'BidForHire',
        description: 'Unlock candidate contact details',
        order_id: data.orderId,
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: () => setLoading(false),
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
              setError(verifyData.error || 'Payment verification failed. Contact support.');
              setLoading(false);
              return;
            }
            // Refresh the current page — server component re-runs getCandidateContactInfo
            // which will now find the Unlock record and reveal contact details inline.
            router.refresh();
          } catch {
            setError('Verification failed — if you were charged, contact support.');
            setLoading(false);
          }
        },
      });

      rzp.open();
    } catch {
      setError('Network error — please try again');
      setLoading(false);
    }
  }

  // ── Unauthenticated visitor ─────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          Sign in with your work email to get {FREE_UNLOCKS_PER_RECRUITER} free unlocks.
        </p>
        <button
          onClick={() => router.push(`/recruiter/signup?callbackUrl=/candidate/${candidateId}`)}
          className="w-full rounded-full border-2 border-foreground bg-accent py-3 font-bold text-white shadow-pop transition-all hover:shadow-pop-hover hover:-translate-y-0.5 active:shadow-pop-active"
        >
          Sign In with Work Email →
        </button>
      </div>
    );
  }

  // ── Authenticated with free credits remaining ───────────────────────────────
  if (freeUnlocksRemaining > 0) {
    return (
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          You have{' '}
          <span className="font-semibold text-foreground">
            {freeUnlocksRemaining} of {FREE_UNLOCKS_PER_RECRUITER}
          </span>{' '}
          free unlocks remaining.
        </p>
        <button
          onClick={handleFreeUnlock}
          disabled={loading}
          className="w-full rounded-full border-2 border-foreground bg-accent py-3 font-bold text-white shadow-pop transition-all hover:shadow-pop-hover hover:-translate-y-0.5 active:shadow-pop-active disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Unlocking…' : 'Unlock Contact Details (Free) →'}
        </button>
        {error && <p className="mt-2 text-center text-sm text-red-500 font-medium">{error}</p>}
      </div>
    );
  }

  // ── Authenticated, free quota exhausted → paid flow ─────────────────────────
  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        You've used your {FREE_UNLOCKS_PER_RECRUITER} free unlocks. Pay $5 to unlock forever.
      </p>
      <button
        onClick={handlePaidUnlock}
        disabled={loading}
        className="w-full rounded-full border-2 border-foreground bg-accent py-3 font-bold text-white shadow-pop transition-all hover:shadow-pop-hover hover:-translate-y-0.5 active:shadow-pop-active disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Opening checkout…' : 'Unlock for $5 →'}
      </button>
      {error && <p className="mt-2 text-center text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
}