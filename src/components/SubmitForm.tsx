'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/constants';

const SOCIAL_FIELDS = [
  { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
  { key: 'github', label: 'GitHub URL', placeholder: 'https://github.com/...' },
  { key: 'x', label: 'X / Twitter URL', placeholder: 'https://x.com/...' },
  { key: 'portfolio', label: 'Portfolio URL', placeholder: 'https://...' },
];

interface SubmitFormProps {
  initialMinBid?: number; // in dollars
}

export function SubmitForm({ initialMinBid = 1 }: SubmitFormProps) {

  const [form, setForm] = useState({
    name: '',
    role: '',
    category: '',
    skills: '',
    summary: '',
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    x: '',
    portfolio: '',
    bidDollars: String(Math.max(initialMinBid, 1)),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const bidDollars = parseInt(form.bidDollars, 10);
    if (!bidDollars || bidDollars < 1) {
      setError('Minimum bid is $1');
      return;
    }

    const skills = form.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (skills.length === 0) {
      setError('Please enter at least one skill');
      return;
    }

    const socialLinks: Record<string, string> = {};
    for (const { key } of SOCIAL_FIELDS) {
      const val = form[key as keyof typeof form];
      if (val) socialLinks[key] = val;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          category: form.category,
          skills,
          summary: form.summary,
          socialLinks,
          email: form.email,
          phone: form.phone || undefined,
          amountCents: bidDollars * 100,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      // Redirect to Dodo hosted checkout
      window.location.href = data.paymentLink;
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Name */}
      <Field label="Full Name *">
        <input
          type="text"
          required
          placeholder="Alex Johnson"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className={inputClass}
        />
      </Field>

      {/* Role */}
      <Field label="Job Title / Role *">
        <input
          type="text"
          required
          placeholder="Senior Frontend Engineer"
          value={form.role}
          onChange={(e) => set('role', e.target.value)}
          className={inputClass}
        />
      </Field>

      {/* Category */}
      <Field label="Category *">
        <select
          required
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          className={inputClass}
        >
          <option value="">Select a category...</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      {/* Skills */}
      <Field label="Skills *" hint="Comma-separated, e.g. React, TypeScript, Node.js">
        <input
          type="text"
          required
          placeholder="React, TypeScript, GraphQL"
          value={form.skills}
          onChange={(e) => set('skills', e.target.value)}
          className={inputClass}
        />
      </Field>

      {/* Summary */}
      <Field label="One-liner Summary *" hint={`${form.summary.length}/200 characters`}>
        <textarea
          required
          maxLength={200}
          rows={3}
          placeholder="I build fast, accessible UIs and have shipped to millions of users..."
          value={form.summary}
          onChange={(e) => set('summary', e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </Field>

      {/* Social links */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-white">Social / Portfolio Links</label>
        {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="mb-1 block text-xs text-muted">{label}</label>
            <input
              type="url"
              placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={(e) => set(key, e.target.value)}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      {/* Email */}
      <Field label="Email Address *" hint="Never shown publicly — only revealed on paid unlock">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          className={inputClass}
        />
      </Field>

      {/* Phone */}
      <Field label="Phone Number" hint="Optional — included in recruiter unlock">
        <input
          type="tel"
          placeholder="+1 555 000 0000"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          className={inputClass}
        />
      </Field>

      {/* Bid amount */}
      <Field
        label="Your Bid (USD) *"
        hint={`Min $1 · Higher bid = higher rank · Pay once, listed forever`}
      >
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-muted">$</span>
          <input
            type="number"
            required
            min={Math.max(initialMinBid, 1)}
            step="1"
            value={form.bidDollars}
            onChange={(e) => set('bidDollars', e.target.value)}
            className={`${inputClass} pl-7`}
          />
        </div>
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-accent py-3 font-bold text-black transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Creating checkout...' : `Pay $${form.bidDollars || '—'} & Get Listed`}
      </button>

      <p className="text-center text-xs text-muted">
        Your listing goes live immediately after payment confirms.
      </p>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-white">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-white placeholder-muted/60 outline-none transition-colors focus:border-accent';