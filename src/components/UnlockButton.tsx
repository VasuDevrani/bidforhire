'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Infinity } from 'lucide-react';
import { loadRazorpayCheckout } from '@/lib/razorpay-checkout';
import { FREE_UNLOCKS_PER_RECRUITER } from '@/lib/constants';
import { toast } from '@/components/Toast';

interface UnlockButtonProps {
  candidateId: string;
  isAuthenticated: boolean;
  /** How many free unlocks this recruiter still has. 0 when unauthenticated or quota exhausted. */
  freeUnlocksRemaining: number;
  /** True if the recruiter has already paid the $10 lifetime access fee. */
  hasLifetimeAccess: boolean;
}

export function UnlockButton({
  candidateId,
  isAuthenticated,
  freeUnlocksRemaining,
  hasLifetimeAccess,
}: UnlockButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;

    let pollCount = 0;
    const interval = setInterval(async () => {
      pollCount++;
      try {
        const res = await fetch(`/api/checkout/status?flow=unlock&candidateId=${candidateId}`);
        const data = await res.json();
        if (data.completed) {
          clearInterval(interval);
          router.refresh();
        }
      } catch {}
      if (pollCount > 20) clearInterval(interval);
    }, 2000);

    const onVisible = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const res = await fetch(`/api/checkout/status?flow=unlock&candidateId=${candidateId}`);
          const data = await res.json();
          if (data.completed) {
            clearInterval(interval);
            router.refresh();
          }
        } catch {}
      }
    };

    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [loading, candidateId, router]);

  // ── Free unlock (no payment) ─────────────────────────────────────────────
  async function handleFreeUnlock() {
    setLoading(true);
    try {
      const res = await fetch('/api/recruiter/unlock-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });
      const data = await res.json();

      if (res.status === 409) {
        router.refresh();
        return;
      }
      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      toast.error('Network error - please try again');
      setLoading(false);
    }
  }

  // ── Lifetime-access unlock (no payment, rate-limited) ────────────────────
  async function handleLifetimeUnlock() {
    setLoading(true);
    try {
      const res = await fetch('/api/recruiter/unlock-lifetime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });
      const data = await res.json();

      if (res.status === 409) {
        // Already unlocked — just refresh to reveal contact info
        router.refresh();
        return;
      }
      if (res.status === 429) {
        toast.error('Daily limit reached (20 unlocks/day). Try again tomorrow.');
        setLoading(false);
        return;
      }
      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      toast.error('Network error - please try again');
      setLoading(false);
    }
  }

  // ── $10 lifetime-access checkout via Razorpay ────────────────────────────
  async function handleLifetimeCheckout() {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });
      const data = await res.json();

      if (res.status === 409) {
        // Already has lifetime access — refresh to show contact info
        router.refresh();
        return;
      }
      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      const ready = await loadRazorpayCheckout();
      if (!ready) {
        toast.error('Could not load payment gateway - please check your connection and try again.');
        setLoading(false);
        return;
      }

      const callbackUrl = `${window.location.origin}/api/checkout/callback?flow=unlock&candidateId=${candidateId}`;

      const rzp = new window.Razorpay({
        key: data.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
        amount: data.amount,
        currency: data.currency,
        name: 'BidForHire',
        description: 'Lifetime access - unlock any candidate, forever',
        order_id: data.orderId,
        callback_url: callbackUrl,
        redirect: true,
        theme: { color: '#6366f1' },
        modal: {
          ondismiss: async () => {
            try {
              const res = await fetch(`/api/checkout/status?flow=unlock&candidateId=${candidateId}`);
              const statusData = await res.json();
              if (statusData.completed) {
                router.refresh();
                return;
              }
            } catch {}
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
            router.refresh();
          } catch {
            toast.error('Verification failed - if you were charged, contact support.');
            setLoading(false);
          }
        },
      });

      rzp.open();
    } catch {
      toast.error('Network error - please try again');
      setLoading(false);
    }
  }

  // ── Unauthenticated visitor ──────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div>
        <p className="mb-4 text-sm text-muted-foreground">
          Sign in with your work email to get {FREE_UNLOCKS_PER_RECRUITER} free unlocks.
        </p>
        <button
          onClick={() => router.push(`/recruiter/signup?callbackUrl=/candidate/${candidateId}`)}
          className="btn-pop flex w-full items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-accent py-3 px-4 font-display text-base font-bold text-white shadow-pop transition-all hover:bg-accent/90"
        >
          Sign In with Work Email <ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      </div>
    );
  }

  // ── Lifetime member — no payment needed ─────────────────────────────────
  if (hasLifetimeAccess) {
    return (
      <div>
        <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <Infinity className="h-4 w-4 text-accent shrink-0" />
          Lifetime access · up to 20 unlocks/day
        </p>
        <button
          onClick={handleLifetimeUnlock}
          disabled={loading}
          className="btn-pop flex w-full items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-accent py-3 px-4 font-display text-base font-bold text-white shadow-pop transition-all disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Unlocking…' : (
            <span className="flex items-center gap-2">
              Unlock Contact Details <ArrowRight className="h-4 w-4 shrink-0" />
            </span>
          )}
        </button>
      </div>
    );
  }

  // ── Free credits remaining ───────────────────────────────────────────────
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
          className="btn-pop flex w-full items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-accent py-3 px-4 font-display text-base font-bold text-white shadow-pop transition-all disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Unlocking…' : (
            <span className="flex items-center gap-2">
              Unlock Contact Details (Free) <ArrowRight className="h-4 w-4 shrink-0" />
            </span>
          )}
        </button>
      </div>
    );
  }

  // ── Free quota exhausted — prompt lifetime access purchase ───────────────
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-foreground">
        You&apos;ve used all {FREE_UNLOCKS_PER_RECRUITER} free unlocks.
      </p>
      <p className="mb-4 text-sm text-muted-foreground">
        Get <span className="font-semibold text-foreground">lifetime access</span> for a one-time
        fee of <span className="font-semibold text-accent">$10</span> - then unlock any candidate
        for free (up to 20/day), forever.
      </p>
      <button
        onClick={handleLifetimeCheckout}
        disabled={loading}
        className="btn-pop flex w-full items-center justify-center gap-2 rounded-xl border-2 border-foreground bg-accent py-3 px-4 font-display text-base font-bold text-white shadow-pop transition-all disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Opening checkout…' : (
          <span className="flex items-center gap-2">
            Get Lifetime Access - $10 <ArrowRight className="h-4 w-4 shrink-0" />
          </span>
        )}
      </button>
    </div>
  );
}