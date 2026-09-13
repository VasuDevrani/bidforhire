/**
 * Multi-currency utilities for Razorpay checkout.
 *
 * Strategy:
 *  - All prices, bids, and DB amounts are stored in **USD cents** (e.g. 500 = $5.00).
 *  - At checkout time, the USD amount is converted to the user's local currency using
 *    live exchange rates so Razorpay presents a familiar price.
 *  - The Razorpay order `notes.usdCents` always carries the canonical USD-cent value
 *    so the verify/webhook handlers write a consistent figure to the database regardless
 *    of which currency the customer actually paid in.
 *
 * Exchange rates are fetched from exchangerate-api.com (free, no key required) and
 * cached in process memory for 6 hours to stay well within the free-tier limit.
 */

// ── Decimal places ────────────────────────────────────────────────────────────

/** ISO 4217 currencies with no decimal subunit (whole-number amounts only). */
const ZERO_DECIMAL = new Set([
  'BIF', 'CLP', 'DJF', 'GNF', 'ISK', 'JPY', 'KMF', 'KRW',
  'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF',
]);

/** ISO 4217 currencies with three decimal places. */
const THREE_DECIMAL = new Set(['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND']);

/**
 * Returns the number of smallest-unit increments per one major unit.
 * e.g. USD → 100 (cents), JPY → 1, KWD → 1000
 */
export function currencyMultiplier(currency: string): number {
  if (ZERO_DECIMAL.has(currency)) return 1;
  if (THREE_DECIMAL.has(currency)) return 1000;
  return 100;
}

// ── Country → currency map ────────────────────────────────────────────────────

/** Subset of ISO 3166-1 alpha-2 → ISO 4217 mappings for common markets. */
const COUNTRY_CURRENCY: Record<string, string> = {
  // South/Southeast Asia
  IN: 'INR', PK: 'PKR', BD: 'BDT', LK: 'LKR', NP: 'NPR',
  SG: 'SGD', MY: 'MYR', ID: 'IDR', TH: 'THB', PH: 'PHP', VN: 'VND',
  // East Asia
  JP: 'JPY', CN: 'CNY', HK: 'HKD', TW: 'TWD', KR: 'KRW',
  // Oceania
  AU: 'AUD', NZ: 'NZD',
  // Americas
  US: 'USD', CA: 'CAD', BR: 'BRL', MX: 'MXN', AR: 'ARS', CL: 'CLP', CO: 'COP',
  // Europe
  GB: 'GBP', CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN',
  CZ: 'CZK', HU: 'HUF', RO: 'RON', TR: 'TRY', RU: 'RUB', UA: 'UAH',
  // Eurozone (representative sample)
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', BE: 'EUR',
  AT: 'EUR', PT: 'EUR', IE: 'EUR', FI: 'EUR', GR: 'EUR', SK: 'EUR',
  // Middle East / Africa
  AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR',
  EG: 'EGP', NG: 'NGN', KE: 'KES', ZA: 'ZAR', GH: 'GHS',
  IL: 'ILS',
};

/**
 * Detects the user's country from request headers.
 *
 * Priority:
 *  1. `CHECKOUT_COUNTRY_OVERRIDE` env var — lets you test any country locally
 *     (e.g. CHECKOUT_COUNTRY_OVERRIDE=US in .env to see the international card-only flow)
 *  2. `x-vercel-ip-country` header — set automatically by Vercel in production
 *  3. Defaults to "IN" so local development shows all Indian payment methods
 *     (UPI, Netbanking, Wallets, Cards) rather than just Cards.
 */
export function getCountryCode(headers: Headers): string {
  if (process.env.CHECKOUT_COUNTRY_OVERRIDE) {
    return process.env.CHECKOUT_COUNTRY_OVERRIDE.toUpperCase();
  }
  return (headers.get('x-vercel-ip-country') ?? 'IN').toUpperCase();
}

/** Returns the ISO 4217 currency for a country code; defaults to `'USD'`. */
export function getCurrencyForCountry(countryCode: string): string {
  return COUNTRY_CURRENCY[countryCode] ?? 'USD';
}

// ── Exchange rate cache ───────────────────────────────────────────────────────

type RateCache = { rates: Record<string, number>; fetchedAt: number };
const _rateCache: RateCache | null = null;
// Use a mutable container so the module-level reference can be updated.
const cache: { v: RateCache | null } = { v: null };
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Fetches USD exchange rates from exchangerate-api.com (free tier, no API key).
 * In-process cache is reused for up to 6 hours.
 */
async function fetchUsdRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (cache.v && now - cache.v.fetchedAt < CACHE_TTL_MS) return cache.v.rates;

  const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
    // Next.js data-cache revalidation as a secondary cache layer
    next: { revalidate: 21600 },
  });
  if (!res.ok) throw new Error(`Exchange rate API responded ${res.status}`);

  const data = (await res.json()) as { rates: Record<string, number> };
  cache.v = { rates: data.rates, fetchedAt: now };
  return data.rates;
}

// ── Main conversion ───────────────────────────────────────────────────────────

/**
 * Converts a USD-cent amount to the smallest unit of `targetCurrency`.
 *
 * @param usdCents      - Amount in USD cents (e.g. 500 = $5.00)
 * @param targetCurrency - ISO 4217 code to convert into
 * @returns `{ amount, currency }` ready to pass directly to `razorpay.orders.create`
 *
 * Falls back to `{ amount: usdCents, currency: 'USD' }` if the exchange rate
 * feed is unavailable or doesn't list the requested currency.
 */
export async function usdCentsToRazorpay(
  usdCents: number,
  targetCurrency: string,
): Promise<{ amount: number; currency: string }> {
  if (targetCurrency === 'USD') {
    return { amount: usdCents, currency: 'USD' };
  }

  let rates: Record<string, number>;
  try {
    rates = await fetchUsdRates();
  } catch (err) {
    console.warn('[currency] Exchange rate fetch failed, falling back to USD:', err);
    return { amount: usdCents, currency: 'USD' };
  }

  const rate = rates[targetCurrency];
  if (!rate) {
    console.warn(`[currency] No rate for "${targetCurrency}", falling back to USD`);
    return { amount: usdCents, currency: 'USD' };
  }

  const usdMajor = usdCents / 100;
  const targetMajor = usdMajor * rate;
  const targetSmallest = Math.round(targetMajor * currencyMultiplier(targetCurrency));

  return { amount: targetSmallest, currency: targetCurrency };
}