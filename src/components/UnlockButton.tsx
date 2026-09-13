'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadRazorpayCheckout } from '@/lib/razorpay-checkout';

interface UnlockButtonProps {
  candidateId: string;
  isAuthenticated: boolean;
}

export function UnlockButton({ candidateId, isAuthenticated }: UnlockButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleUnlock() {
    if (!isAuthenticated) {
      router.push(`/recruiter/signup?callbackUrl=/candidate/${candidateId}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: create a Razorpay order server-side
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

      // Step 2: load Razorpay checkout.js and open the modal
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
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response) => {
          // Step 3: verify the payment server-side
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
            // Redirect to recruiter dashboard showing the unlocked candidate
            router.push(`/recruiter/dashboard?unlocked=${data.candidateId}`);
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

  return (
    <div>
      <button
        onClick={handleUnlock}
        disabled={loading}
        className="w-full rounded-full border-2 border-foreground bg-accent py-3 font-bold text-white shadow-pop transition-all hover:shadow-pop-hover hover:-translate-y-0.5 active:shadow-pop-active disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? 'Opening checkout…'
          : isAuthenticated
          ? 'Unlock Contact — $5 →'
          : 'Sign In to Unlock — $5 →'}
      </button>
      {!isAuthenticated && (
        <p className="mt-1.5 text-center text-xs text-muted-foreground">
          Requires a free recruiter account
        </p>
      )}
      {error && <p className="mt-2 text-center text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
}