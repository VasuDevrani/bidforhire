'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { loadRazorpayCheckout } from '@/lib/razorpay-checkout';
import { CompanyCombobox } from './CompanyCombobox';
import { type CompanyInfo } from '@/lib/companies';
import { toast } from '@/components/Toast';

const SOCIAL_FIELDS = [
  { key: 'linkedin', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...' },
  { key: 'github', label: 'GitHub URL', placeholder: 'https://github.com/...' },
  { key: 'x', label: 'X / Twitter URL', placeholder: 'https://x.com/...' },
  { key: 'portfolio', label: 'Portfolio URL', placeholder: 'https://...' },
];

interface SubmitFormProps {
  initialMinBid?: number; // in dollars
  initialError?: string;
}

export function SubmitForm({ initialMinBid = 1, initialError }: SubmitFormProps) {
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
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
  const [pendingCandidateId, setPendingCandidateId] = useState<string | null>(null);

  useEffect(() => {
    if (initialError) {
      toast.error(initialError);
    }
  }, [initialError]);

  useEffect(() => {
    if (!loading || !pendingCandidateId) return;

    let pollCount = 0;
    const interval = setInterval(async () => {
      pollCount++;
      try {
        const res = await fetch(`/api/checkout/status?flow=submit&candidateId=${pendingCandidateId}`);
        const data = await res.json();
        if (data.completed) {
          clearInterval(interval);
          window.location.href = `/submit/success?candidateId=${pendingCandidateId}`;
        }
      } catch {}
      if (pollCount > 20) clearInterval(interval);
    }, 2000);

    const onVisible = async () => {
      if (document.visibilityState === 'visible') {
        try {
          const res = await fetch(`/api/checkout/status?flow=submit&candidateId=${pendingCandidateId}`);
          const data = await res.json();
          if (data.completed) {
            clearInterval(interval);
            window.location.href = `/submit/success?candidateId=${pendingCandidateId}`;
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
  }, [loading, pendingCandidateId]);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const bidDollars = parseInt(form.bidDollars, 10);
    if (!bidDollars || bidDollars < 1 || bidDollars > 999_999) {
      toast.error('Bid must be between $1 and $999,999');
      return;
    }

    const skills = form.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (skills.length === 0) {
      toast.error('Please enter at least one skill');
      return;
    }

    const socialLinks: Record<string, string> = {};
    for (const { key } of SOCIAL_FIELDS) {
      const val = form[key as keyof typeof form];
      if (val) socialLinks[key] = val;
    }

    setLoading(true);
    try {
      // Step 1: create a Razorpay order server-side
      const res = await fetch('/api/checkout/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          role: form.role,
          category: form.category,
          skills,
          previousCompanies: companies,
          summary: form.summary,
          socialLinks,
          email: form.email,
          phone: form.phone || undefined,
          amountCents: bidDollars * 100,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      setPendingCandidateId(data.candidateId);

      // Step 2: load Razorpay checkout.js and open the modal
      const ready = await loadRazorpayCheckout();
      if (!ready) {
        toast.error('Could not load payment gateway - please check your connection and try again.');
        setLoading(false);
        return;
      }

      const callbackUrl = `${window.location.origin}/api/checkout/callback?flow=submit&candidateId=${data.candidateId}`;

      const rzp = new window.Razorpay({
        key: data.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? '',
        amount: data.amount,
        currency: data.currency,
        name: 'BidForHire',
        description: `Bid $${bidDollars} - get listed`,
        order_id: data.orderId,
        callback_url: callbackUrl,
        redirect: true,
        prefill: { name: form.name, email: form.email },
        theme: { color: '#6366f1' },
        modal: {
          confirm_close: false,
          handleback: true,
          ondismiss: async () => {
            if (data.candidateId) {
              try {
                const res = await fetch(
                  `/api/checkout/status?flow=submit&candidateId=${data.candidateId}`
                );
                const statusData = await res.json();
                if (statusData.completed) {
                  window.location.href = `/submit/success?candidateId=${data.candidateId}`;
                  return;
                }
              } catch {}
            }
            setLoading(false);
            toast.error("Payment was cancelled. Your draft has been saved - try again whenever you're ready.");
          },
        },
        handler: async (response) => {
          // Step 3: verify the payment server-side and activate the listing (fallback if modal completes in-place)
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
            // Redirect to success page
            window.location.href = `/submit/success?candidateId=${data.candidateId}`;
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
      // Note: setLoading(false) is handled inside handler/ondismiss
    } catch {
      toast.error('Network error - please try again');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

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

      {/* Previous Companies */}
      <Field label="Previous Companies" hint="Pick or type past companies (e.g. Stripe, Google). Logos will be automatically added.">
        <CompanyCombobox value={companies} onChange={setCompanies} />
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
        <label className="block text-sm font-bold text-foreground">Social / Portfolio Links</label>
        {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</label>
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
      <Field label="Email Address *" hint="Never shown publicly - only revealed on paid unlock">
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
      <Field label="Phone Number" hint="Optional - included in recruiter unlock">
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
        hint="Whole dollars only · $1 minimum · Higher bid = higher rank"
      >
        <div className="relative">
          <span className="absolute inset-y-0 left-4 flex items-center font-bold text-muted-foreground">$</span>
          <input
            type="number"
            required
            min={Math.max(initialMinBid, 1)}
            max={999_999}
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
        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-foreground bg-accent py-3 font-bold text-white shadow-pop transition-all hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-y-0 active:shadow-pop-active disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Opening checkout…' : <span className="flex items-center justify-center gap-2">Pay ${form.bidDollars || '-'} &amp; Get Listed <ArrowRight className="h-4 w-4 shrink-0" /></span>}
      </button>

      <p className="text-center text-xs text-muted-foreground">
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
      <label className="mb-1.5 block text-sm font-bold text-foreground">{label}</label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border-2 border-foreground bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 outline-none transition-all focus:border-accent focus:shadow-pop-sm';