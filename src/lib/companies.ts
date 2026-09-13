export interface CompanyInfo {
  name: string;
  domain?: string;
  logo?: string;
}

export const POPULAR_COMPANIES: CompanyInfo[] = [
  { name: 'Google', domain: 'google.com', logo: 'https://cdn.simpleicons.org/google' },
  { name: 'Stripe', domain: 'stripe.com', logo: 'https://cdn.simpleicons.org/stripe' },
  { name: 'Meta', domain: 'meta.com', logo: 'https://cdn.simpleicons.org/meta' },
  { name: 'Apple', domain: 'apple.com', logo: 'https://cdn.simpleicons.org/apple' },
  { name: 'Amazon', domain: 'amazon.com', logo: 'https://cdn.simpleicons.org/amazon' },
  { name: 'Microsoft', domain: 'microsoft.com', logo: 'https://cdn.simpleicons.org/microsoft' },
  { name: 'Netflix', domain: 'netflix.com', logo: 'https://cdn.simpleicons.org/netflix' },
  { name: 'Uber', domain: 'uber.com', logo: 'https://cdn.simpleicons.org/uber' },
  { name: 'Airbnb', domain: 'airbnb.com', logo: 'https://cdn.simpleicons.org/airbnb' },
  { name: 'Figma', domain: 'figma.com', logo: 'https://cdn.simpleicons.org/figma' },
  { name: 'OpenAI', domain: 'openai.com', logo: 'https://cdn.simpleicons.org/openai' },
  { name: 'Vercel', domain: 'vercel.com', logo: 'https://cdn.simpleicons.org/vercel' },
  { name: 'Spotify', domain: 'spotify.com', logo: 'https://cdn.simpleicons.org/spotify' },
  { name: 'Shopify', domain: 'shopify.com', logo: 'https://cdn.simpleicons.org/shopify' },
  { name: 'Notion', domain: 'notion.so', logo: 'https://cdn.simpleicons.org/notion' },
  { name: 'Linear', domain: 'linear.app', logo: 'https://cdn.simpleicons.org/linear' },
  { name: 'Coinbase', domain: 'coinbase.com', logo: 'https://cdn.simpleicons.org/coinbase' },
  { name: 'Discord', domain: 'discord.com', logo: 'https://cdn.simpleicons.org/discord' },
  { name: 'GitHub', domain: 'github.com', logo: 'https://cdn.simpleicons.org/github' },
  { name: 'Twitter / X', domain: 'x.com', logo: 'https://cdn.simpleicons.org/x' },
  { name: 'Razorpay', domain: 'razorpay.com', logo: 'https://cdn.simpleicons.org/razorpay' },
  { name: 'CRED', domain: 'cred.club', logo: 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAV&fallback_opts=TYPE,SIZE,URL&url=https://cred.club&size=64' },
  { name: 'Swiggy', domain: 'swiggy.com', logo: 'https://cdn.simpleicons.org/swiggy' },
  { name: 'Zomato', domain: 'zomato.com', logo: 'https://cdn.simpleicons.org/zomato' },
  { name: 'Postman', domain: 'postman.com', logo: 'https://cdn.simpleicons.org/postman' },
  { name: 'Flipkart', domain: 'flipkart.com', logo: 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAV&fallback_opts=TYPE,SIZE,URL&url=https://flipkart.com&size=64' },
  { name: 'Zerodha', domain: 'zerodha.com', logo: 'https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAV&fallback_opts=TYPE,SIZE,URL&url=https://zerodha.com&size=64' },
  { name: 'DoorDash', domain: 'doordash.com', logo: 'https://cdn.simpleicons.org/doordash' },
  { name: 'Pinterest', domain: 'pinterest.com', logo: 'https://cdn.simpleicons.org/pinterest' },
  { name: 'Lyft', domain: 'lyft.com', logo: 'https://cdn.simpleicons.org/lyft' },
  { name: 'Datadog', domain: 'datadoghq.com', logo: 'https://cdn.simpleicons.org/datadog' },
  { name: 'Snowflake', domain: 'snowflake.com', logo: 'https://cdn.simpleicons.org/snowflake' },
];

/**
 * Returns a logo URL for a company, or null if no reliable source is known.
 * Returning null lets the caller render an initial-letter fallback immediately
 * (avoiding broken-image states from CDNs that return placeholder SVGs instead
 * of 404s for unknown slugs).
 */
export function resolveCompanyLogoUrl(company: CompanyInfo): string | null {
  // Explicit logo URL wins
  if (company.logo) return company.logo;

  // Match against the popular companies catalog (domain first, then name) to
  // get the curated simpleicons / gstatic URL
  const popular = POPULAR_COMPANIES.find(
    (p) =>
      (company.domain && p.domain === company.domain) ||
      p.name.toLowerCase() === company.name.toLowerCase(),
  );
  if (popular?.logo) return popular.logo;

  // No reliable source — caller should show initial-letter fallback
  return null;
}
