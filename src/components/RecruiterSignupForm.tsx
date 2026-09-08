'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { isWorkEmail } from '@/lib/utils';

interface RecruiterSignupFormProps {
  callbackUrl?: string;
}

export function RecruiterSignupForm({ callbackUrl = '/recruiter/dashboard' }: RecruiterSignupFormProps) {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!isWorkEmail(email)) {
      setError('Please use a work email address (no Gmail, Yahoo, etc.)');
      return;
    }

    setLoading(true);
    try {
      // Persist company name via a setup API before sending magic link
      if (companyName) {
        await fetch('/api/recruiter/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, companyName }),
        });
      }

      const result = await signIn('email', {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError('Failed to send magic link. Check your email configuration.');
      } else {
        setSent(true);
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="mb-3 text-4xl">📧</div>
        <h2 className="mb-2 text-lg font-bold text-white">Check your inbox</h2>
        <p className="text-sm text-muted">
          We sent a magic link to <span className="text-white">{email}</span>.
          Click it to access your dashboard.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-white">Work Email *</label>
        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-white placeholder-muted/60 outline-none transition-colors focus:border-accent"
        />
        <p className="mt-1 text-xs text-muted">No personal email addresses (Gmail, Yahoo, etc.)</p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-white">Company Name</label>
        <input
          type="text"
          placeholder="Acme Corp"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-white placeholder-muted/60 outline-none transition-colors focus:border-accent"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-accent py-3 font-bold text-black transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Sending...' : 'Send Magic Link'}
      </button>
    </form>
  );
}