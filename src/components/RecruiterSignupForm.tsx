'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { isWorkEmail } from '@/lib/utils';
import { Mail } from 'lucide-react';

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
      <div className="text-center py-4">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-foreground bg-accent/10 shadow-pop-violet">
          <Mail className="h-6 w-6 text-accent" />
        </div>
        <h2 className="mb-2 font-display text-xl font-black text-foreground">Check your inbox</h2>
        <p className="text-sm text-muted-foreground">
          We sent a magic link to{' '}
          <span className="font-semibold text-accent">{email}</span>.
          <br />Click it to access your dashboard.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-bold text-foreground">
          Work Email <span className="text-accent">*</span>
        </label>
        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border-2 border-foreground bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-accent focus:shadow-pop-sm"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">No personal email addresses (Gmail, Yahoo, etc.)</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-bold text-foreground">Company Name</label>
        <input
          type="text"
          placeholder="Acme Corp"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full rounded-xl border-2 border-foreground bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-accent focus:shadow-pop-sm"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full border-2 border-foreground bg-accent py-3 font-bold text-white shadow-pop transition-all hover:shadow-pop-hover hover:-translate-y-0.5 active:shadow-pop-active disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Sending…' : 'Send Magic Link →'}
      </button>
    </form>
  );
}