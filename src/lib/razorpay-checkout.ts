/**
 * Browser-side Razorpay utilities.
 *
 * Dynamically loads checkout.js on first use so it is not bundled into the
 * Next.js client chunk and only fetches from Razorpay CDN when actually needed.
 */

/** Loads the Razorpay Checkout script once; resolves true on success. */
export function loadRazorpayCheckout(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') { resolve(false); return; }
    if (window.Razorpay) { resolve(true); return; }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ── Response returned by the Razorpay checkout handler on success ──────────

export interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// ── Minimal checkout options (only what we use) ────────────────────────────

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void; confirm_close?: boolean };
  handler?: (response: RazorpayHandlerResponse) => void;
  callback_url?: string;
  redirect?: boolean;
}

// ── Global type augmentation ───────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}