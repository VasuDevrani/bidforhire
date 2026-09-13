'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Plus, Building2, Check } from 'lucide-react';
import { type CompanyInfo, POPULAR_COMPANIES } from '@/lib/companies';
import { CompanyLogo } from './CompanyLogo';

interface CompanyComboboxProps {
  value: CompanyInfo[];
  onChange: (companies: CompanyInfo[]) => void;
  max?: number;
}

export function CompanyCombobox({
  value,
  onChange,
  max = 5,
}: CompanyComboboxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedNames = new Set(value.map((c) => c.name.toLowerCase()));

  // Filter suggestions from POPULAR_COMPANIES
  const filtered = query.trim()
    ? POPULAR_COMPANIES.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.domain?.toLowerCase().includes(query.toLowerCase())
      ).filter((c) => !selectedNames.has(c.name.toLowerCase()))
    : POPULAR_COMPANIES.filter((c) => !selectedNames.has(c.name.toLowerCase())).slice(0, 8);

  const exactMatchExists = POPULAR_COMPANIES.some(
    (c) => c.name.toLowerCase() === query.trim().toLowerCase()
  );

  function handleSelect(company: CompanyInfo) {
    if (value.length >= max) return;
    onChange([...value, company]);
    setQuery('');
    setIsOpen(false);
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleAddCustom() {
    const trimmed = query.trim();
    if (!trimmed || value.length >= max || selectedNames.has(trimmed.toLowerCase())) return;

    // Check if user entered a domain like "airbnb.com" or just a name like "Airbnb"
    const isDomain = trimmed.includes('.') && !trimmed.includes(' ');
    const company: CompanyInfo = isDomain
      ? {
          name: trimmed.split('.')[0].charAt(0).toUpperCase() + trimmed.split('.')[0].slice(1),
          domain: trimmed,
        }
      : {
          name: trimmed,
          domain: `${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        };

    onChange([...value, company]);
    setQuery('');
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered.length > 0) {
        handleSelect(filtered[0]);
      } else if (query.trim()) {
        handleAddCustom();
      }
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Selected chips */}
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((comp, idx) => (
            <span
              key={comp.name}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground bg-card py-1 pl-2 pr-2.5 text-xs font-bold text-foreground shadow-pop-sm"
            >
              <CompanyLogo company={comp} size={14} showNameTooltip={false} />
              <span>{comp.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="ml-0.5 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${comp.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input container */}
      {value.length < max && (
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={
              value.length === 0
                ? 'Type or select past companies (e.g. Google, Stripe...)'
                : 'Add another company...'
            }
            className="w-full rounded-xl border-2 border-foreground bg-card px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 shadow-pop focus:outline-none focus:ring-2 focus:ring-accent"
          />

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <div className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border-2 border-foreground bg-card p-1 shadow-pop">
              {filtered.map((comp) => (
                <button
                  key={comp.name}
                  type="button"
                  onClick={() => handleSelect(comp)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-foreground transition-colors hover:bg-accent/10 hover:text-accent"
                >
                  <div className="flex items-center gap-2.5">
                    <CompanyLogo company={comp} size={16} showNameTooltip={false} />
                    <span>{comp.name}</span>
                    {comp.domain && (
                      <span className="text-xs font-normal text-muted-foreground">
                        {comp.domain}
                      </span>
                    )}
                  </div>
                  <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}

              {/* Option to add custom if typed query doesn't match any pre-existing entry */}
              {query.trim() && !exactMatchExists && !selectedNames.has(query.trim().toLowerCase()) && (
                <button
                  type="button"
                  onClick={handleAddCustom}
                  className="flex w-full items-center gap-2 rounded-lg border-t border-border px-3 py-2 text-left text-sm font-semibold text-accent transition-colors hover:bg-accent/10"
                >
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span>
                    Add &ldquo;{query.trim()}&rdquo; as custom company
                  </span>
                </button>
              )}

              {filtered.length === 0 && !query.trim() && (
                <p className="px-3 py-3 text-center text-xs text-muted-foreground">
                  All popular companies already added.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
