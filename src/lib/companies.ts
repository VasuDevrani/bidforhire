export interface CompanyInfo {
  name: string;
  domain?: string;
  logo?: string;
}

export const POPULAR_COMPANIES: CompanyInfo[] = [
  // Big Tech
  { name: 'Google', domain: 'google.com', logo: 'https://cdn.simpleicons.org/google' },
  { name: 'Apple', domain: 'apple.com', logo: 'https://cdn.simpleicons.org/apple' },
  { name: 'Microsoft', domain: 'microsoft.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg' },
  { name: 'Amazon', domain: 'amazon.com', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
  { name: 'Meta', domain: 'meta.com', logo: 'https://cdn.simpleicons.org/meta' },
  { name: 'Netflix', domain: 'netflix.com', logo: 'https://cdn.simpleicons.org/netflix' },
  { name: 'NVIDIA', domain: 'nvidia.com', logo: 'https://cdn.simpleicons.org/nvidia' },
  { name: 'Adobe', domain: 'adobe.com', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/adobe.svg' },
  { name: 'Oracle', domain: 'oracle.com', logo: 'https://cdn.simpleicons.org/oracle' },
  { name: 'Salesforce', domain: 'salesforce.com', logo: 'https://cdn.simpleicons.org/salesforce' },
  { name: 'Cisco', domain: 'cisco.com', logo: 'https://cdn.simpleicons.org/cisco' },
  { name: 'Intel', domain: 'intel.com', logo: 'https://cdn.simpleicons.org/intel' },
  { name: 'AMD', domain: 'amd.com', logo: 'https://cdn.simpleicons.org/amd' },
  { name: 'SAP', domain: 'sap.com', logo: 'https://cdn.simpleicons.org/sap' },
  { name: 'Accenture', domain: 'accenture.com', logo: 'https://cdn.simpleicons.org/accenture' },

  // AI / Developer / Cloud
  { name: 'OpenAI', domain: 'openai.com', logo: 'https://cdn.simpleicons.org/openai' },
  { name: 'Anthropic', domain: 'anthropic.com', logo: 'https://cdn.simpleicons.org/anthropic' },
  { name: 'Vercel', domain: 'vercel.com', logo: 'https://cdn.simpleicons.org/vercel' },
  { name: 'GitHub', domain: 'github.com', logo: 'https://cdn.simpleicons.org/github' },
  { name: 'GitLab', domain: 'gitlab.com', logo: 'https://cdn.simpleicons.org/gitlab' },
  { name: 'Docker', domain: 'docker.com', logo: 'https://cdn.simpleicons.org/docker' },
  { name: 'AWS', domain: 'aws.amazon.com', logo: 'https://cdn.simpleicons.org/amazonaws' },
  { name: 'Cloudflare', domain: 'cloudflare.com', logo: 'https://cdn.simpleicons.org/cloudflare' },
  { name: 'MongoDB', domain: 'mongodb.com', logo: 'https://cdn.simpleicons.org/mongodb' },
  { name: 'Redis', domain: 'redis.io', logo: 'https://cdn.simpleicons.org/redis' },
  { name: 'Databricks', domain: 'databricks.com', logo: 'https://cdn.simpleicons.org/databricks' },
  { name: 'Snowflake', domain: 'snowflake.com', logo: 'https://cdn.simpleicons.org/snowflake' },
  { name: 'Datadog', domain: 'datadoghq.com', logo: 'https://cdn.simpleicons.org/datadog' },
  { name: 'Supabase', domain: 'supabase.com', logo: 'https://cdn.simpleicons.org/supabase' },
  { name: 'Firebase', domain: 'firebase.google.com', logo: 'https://cdn.simpleicons.org/firebase' },
  { name: 'DigitalOcean', domain: 'digitalocean.com', logo: 'https://cdn.simpleicons.org/digitalocean' },
  { name: 'Heroku', domain: 'heroku.com', logo: 'https://cdn.simpleicons.org/heroku' },

  // SaaS / Productivity
  { name: 'Stripe', domain: 'stripe.com', logo: 'https://cdn.simpleicons.org/stripe' },
  { name: 'Figma', domain: 'figma.com', logo: 'https://cdn.simpleicons.org/figma' },
  { name: 'Notion', domain: 'notion.so', logo: 'https://cdn.simpleicons.org/notion' },
  { name: 'Linear', domain: 'linear.app', logo: 'https://cdn.simpleicons.org/linear' },
  { name: 'Slack', domain: 'slack.com', logo: 'https://cdn.simpleicons.org/slack' },
  { name: 'Atlassian', domain: 'atlassian.com', logo: 'https://cdn.simpleicons.org/atlassian' },
  { name: 'Jira', domain: 'atlassian.com/software/jira', logo: 'https://cdn.simpleicons.org/jira' },
  { name: 'Asana', domain: 'asana.com', logo: 'https://cdn.simpleicons.org/asana' },
  { name: 'ClickUp', domain: 'clickup.com', logo: 'https://cdn.simpleicons.org/clickup' },
  { name: 'Airtable', domain: 'airtable.com', logo: 'https://cdn.simpleicons.org/airtable' },
  { name: 'Miro', domain: 'miro.com', logo: 'https://cdn.simpleicons.org/miro' },
  { name: 'Loom', domain: 'loom.com', logo: 'https://cdn.simpleicons.org/loom' },
  { name: 'Intercom', domain: 'intercom.com', logo: 'https://cdn.simpleicons.org/intercom' },
  { name: 'Zendesk', domain: 'zendesk.com', logo: 'https://cdn.simpleicons.org/zendesk' },
  { name: 'HubSpot', domain: 'hubspot.com', logo: 'https://cdn.simpleicons.org/hubspot' },
  { name: 'Zoom', domain: 'zoom.us', logo: 'https://cdn.simpleicons.org/zoom' },
  { name: 'Dropbox', domain: 'dropbox.com', logo: 'https://cdn.simpleicons.org/dropbox' },

  // Consumer / Internet
  { name: 'Uber', domain: 'uber.com', logo: 'https://cdn.simpleicons.org/uber' },
  { name: 'Airbnb', domain: 'airbnb.com', logo: 'https://cdn.simpleicons.org/airbnb' },
  { name: 'Spotify', domain: 'spotify.com', logo: 'https://cdn.simpleicons.org/spotify' },
  { name: 'Shopify', domain: 'shopify.com', logo: 'https://cdn.simpleicons.org/shopify' },
  { name: 'Pinterest', domain: 'pinterest.com', logo: 'https://cdn.simpleicons.org/pinterest' },
  { name: 'Reddit', domain: 'reddit.com', logo: 'https://cdn.simpleicons.org/reddit' },
  { name: 'Discord', domain: 'discord.com', logo: 'https://cdn.simpleicons.org/discord' },
  { name: 'TikTok', domain: 'tiktok.com', logo: 'https://cdn.simpleicons.org/tiktok' },
  { name: 'X', domain: 'x.com', logo: 'https://cdn.simpleicons.org/x' },
  { name: 'LinkedIn', domain: 'linkedin.com', logo: 'https://cdn.simpleicons.org/linkedin' },
  { name: 'Lyft', domain: 'lyft.com', logo: 'https://cdn.simpleicons.org/lyft' },
  { name: 'DoorDash', domain: 'doordash.com', logo: 'https://cdn.simpleicons.org/doordash' },
  { name: 'Coinbase', domain: 'coinbase.com', logo: 'https://cdn.simpleicons.org/coinbase' },
  { name: 'PayPal', domain: 'paypal.com', logo: 'https://cdn.simpleicons.org/paypal' },

  // India — Fintech
  { name: 'Razorpay', domain: 'razorpay.com', logo: 'https://cdn.simpleicons.org/razorpay' },
  { name: 'PhonePe', domain: 'phonepe.com', logo: 'https://cdn.simpleicons.org/phonepe' },
  { name: 'Paytm', domain: 'paytm.com', logo: 'https://cdn.simpleicons.org/paytm' },
  { name: 'CRED', domain: 'cred.club', logo: 'https://cdn.simpleicons.org/cred' },
  { name: 'Zerodha', domain: 'zerodha.com', logo: 'https://cdn.simpleicons.org/zerodha' },
  { name: 'Groww', domain: 'groww.in', logo: 'https://cdn.simpleicons.org/groww' },
  { name: 'BharatPe', domain: 'bharatpe.com', logo: 'https://cdn.simpleicons.org/bharatpe' },
  { name: 'MobiKwik', domain: 'mobikwik.com', logo: 'https://cdn.simpleicons.org/mobikwik' },
  { name: 'Pine Labs', domain: 'pinelabs.com', logo: 'https://cdn.simpleicons.org/pinelabs' },
  { name: 'Policybazaar', domain: 'policybazaar.com', logo: 'https://cdn.simpleicons.org/policybazaar' },
  { name: 'Slice', domain: 'sliceit.com', logo: 'https://cdn.simpleicons.org/slice' },

  // India — Consumer / E-commerce
  { name: 'Flipkart', domain: 'flipkart.com', logo: 'https://cdn.simpleicons.org/flipkart' },
  { name: 'Meesho', domain: 'meesho.com', logo: 'https://cdn.simpleicons.org/meesho' },
  { name: 'Myntra', domain: 'myntra.com', logo: 'https://cdn.simpleicons.org/myntra' },
  { name: 'Nykaa', domain: 'nykaa.com', logo: 'https://cdn.simpleicons.org/nykaa' },
  { name: 'Swiggy', domain: 'swiggy.com', logo: 'https://cdn.simpleicons.org/swiggy' },
  { name: 'Zomato', domain: 'zomato.com', logo: 'https://cdn.simpleicons.org/zomato' },
  { name: 'Blinkit', domain: 'blinkit.com', logo: 'https://cdn.simpleicons.org/blinkit' },
  { name: 'Zepto', domain: 'zepto.com', logo: 'https://cdn.simpleicons.org/zepto' },
  { name: 'Ola', domain: 'olacabs.com', logo: 'https://cdn.simpleicons.org/ola' },
  { name: 'Urban Company', domain: 'urbancompany.com', logo: 'https://cdn.simpleicons.org/urbancompany' },
  { name: 'Lenskart', domain: 'lenskart.com', logo: 'https://cdn.simpleicons.org/lenskart' },
  { name: 'BookMyShow', domain: 'bookmyshow.com', logo: 'https://cdn.simpleicons.org/bookmyshow' },
  { name: 'OYO', domain: 'oyorooms.com', logo: 'https://cdn.simpleicons.org/oyo' },

  // India — SaaS / Developer
  { name: 'Postman', domain: 'postman.com', logo: 'https://cdn.simpleicons.org/postman' },
  { name: 'Freshworks', domain: 'freshworks.com', logo: 'https://cdn.simpleicons.org/freshworks' },
  { name: 'Zoho', domain: 'zoho.com', logo: 'https://cdn.simpleicons.org/zoho' },
  { name: 'BrowserStack', domain: 'browserstack.com', logo: 'https://cdn.simpleicons.org/browserstack' },
  { name: 'Chargebee', domain: 'chargebee.com', logo: 'https://cdn.simpleicons.org/chargebee' },
  { name: 'Razorpay', domain: 'razorpay.com', logo: 'https://cdn.simpleicons.org/razorpay' },
  { name: 'CleverTap', domain: 'clevertap.com', logo: 'https://cdn.simpleicons.org/clevertap' },
  { name: 'MoEngage', domain: 'moengage.com', logo: 'https://cdn.simpleicons.org/moengage' },
  { name: 'Whatfix', domain: 'whatfix.com', logo: 'https://cdn.simpleicons.org/whatfix' },
  { name: 'Gupshup', domain: 'gupshup.io', logo: 'https://cdn.simpleicons.org/gupshup' },
  { name: 'InMobi', domain: 'inmobi.com', logo: 'https://cdn.simpleicons.org/inmobi' },

  // India — Logistics / Mobility
  { name: 'Delhivery', domain: 'delhivery.com', logo: 'https://cdn.simpleicons.org/delhivery' },
  { name: 'Porter', domain: 'porter.in', logo: 'https://cdn.simpleicons.org/porter' },
  { name: 'Rapido', domain: 'rapido.bike', logo: 'https://cdn.simpleicons.org/rapido' },

  // India — Health / Education
  { name: 'Tata 1mg', domain: '1mg.com', logo: 'https://cdn.simpleicons.org/1mg' },
  { name: 'Practo', domain: 'practo.com', logo: 'https://cdn.simpleicons.org/practo' },
  { name: 'PharmEasy', domain: 'pharmeasy.in', logo: 'https://cdn.simpleicons.org/pharmeasy' },
  { name: 'Unacademy', domain: 'unacademy.com', logo: 'https://cdn.simpleicons.org/unacademy' },
  { name: 'upGrad', domain: 'upgrad.com', logo: 'https://cdn.simpleicons.org/upgrad' },
  { name: 'Physics Wallah', domain: 'pw.live', logo: 'https://cdn.simpleicons.org/physicswallah' },

  // Indian IT / Enterprise
  { name: 'TCS', domain: 'tcs.com', logo: 'https://cdn.simpleicons.org/tcs' },
  { name: 'Infosys', domain: 'infosys.com', logo: 'https://cdn.simpleicons.org/infosys' },
  { name: 'Wipro', domain: 'wipro.com', logo: 'https://cdn.simpleicons.org/wipro' },
  { name: 'HCLTech', domain: 'hcltech.com', logo: 'https://cdn.simpleicons.org/hcl' },
  { name: 'Tech Mahindra', domain: 'techmahindra.com', logo: 'https://cdn.simpleicons.org/techmahindra' },
]

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
