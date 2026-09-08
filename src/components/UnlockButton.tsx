'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      const res = await fetch('/api/checkout/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setError("You've already unlocked this candidate.");
        return;
      }
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      window.location.href = data.paymentLink;
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleUnlock}
        disabled={loading}
        className="w-full rounded-lg bg-accent py-3 font-bold text-black transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? 'Creating checkout...'
          : isAuthenticated
          ? 'Unlock Contact — $5'
          : 'Sign In to Unlock — $5'}
      </button>
      {!isAuthenticated && (
        <p className="mt-1.5 text-center text-xs text-muted">
          Requires a free recruiter account
        </p>
      )}
      {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}
    </div>
  );
}