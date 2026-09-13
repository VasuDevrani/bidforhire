'use client';

import { useState } from 'react';
import { type CompanyInfo, resolveCompanyLogoUrl } from '@/lib/companies';

interface CompanyLogoProps {
  company: CompanyInfo;
  size?: number;
  showNameTooltip?: boolean;
}

/** Initial-letter circle — used when no reliable logo URL is available. */
function InitialCircle({
  company,
  showNameTooltip,
}: {
  company: CompanyInfo;
  showNameTooltip: boolean;
}) {
  return (
    <span
      title={showNameTooltip ? `Ex-${company.name}` : undefined}
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-bold text-muted-foreground select-none"
    >
      {company.name.charAt(0).toUpperCase()}
    </span>
  );
}

export function CompanyLogo({
  company,
  size = 18,
  showNameTooltip = true,
}: CompanyLogoProps) {
  const [hasError, setHasError] = useState(false);
  const logoUrl = resolveCompanyLogoUrl(company);

  // No curated logo → show initial immediately (avoids CDN returning a blank
  // placeholder SVG that looks like a globe and never triggers onError)
  if (!logoUrl || hasError) {
    return <InitialCircle company={company} showNameTooltip={showNameTooltip} />;
  }

  return (
    <span
      title={showNameTooltip ? `Ex-${company.name}` : undefined}
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-white p-0.5 shadow-xs transition-transform hover:scale-110"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoUrl}
        alt={company.name}
        width={size}
        height={size}
        loading="lazy"
        onError={() => setHasError(true)}
        className="h-full w-full rounded-full object-contain"
      />
    </span>
  );
}

export function CompanyLogosGroup({
  companies,
  maxVisible = 3,
}: {
  companies: CompanyInfo[];
  maxVisible?: number;
}) {
  if (!companies || companies.length === 0) return null;
  const visible = companies.slice(0, maxVisible);
  const extra = companies.length - maxVisible;

  return (
    <span className="inline-flex items-center gap-1 align-middle">
      {visible.map((c, i) => (
        <CompanyLogo key={`${c.name}-${i}`} company={c} />
      ))}
      {extra > 0 && (
        <span
          title={`${extra} more companies`}
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-[9px] font-bold text-muted-foreground select-none"
        >
          +{extra}
        </span>
      )}
    </span>
  );
}
