import type { ReactNode } from 'react';

import { PLP_QUICK_SORT_CHIPS, type SortKey } from '@/features/catalog/listingSort';

type Props = {
  value: SortKey;
  onChange: (key: SortKey) => void;
  /** Podrazumevano PLP_QUICK_SORT_CHIPS. */
  chips?: { value: SortKey; label: string }[];
  className?: string;
};

function ChipIcon({ sortKey }: { sortKey: SortKey }): ReactNode {
  const common = 'h-4 w-4 shrink-0';
  switch (sortKey) {
    case 'relevance':
      return (
        <svg className={common} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          <path d="M2.5 8h2.5l1.5-4 2.5 8 1.5-4h2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'new':
      return (
        <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <path d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.93L8 10.9l-3.52 1.85.67-3.93-2.85-2.78 3.94-.57L8 1.5z" />
        </svg>
      );
    case 'bestselling':
      return (
        <svg className={common} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
          <path d="M8 2v3M5 5h6l-1 8H6L5 5z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 5h8" strokeLinecap="round" />
        </svg>
      );
    case 'topRated':
      return (
        <svg className={common} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
          <path d="M8 1.2 9.8 5.5l4.7.7-3.4 3.3.8 4.7L8 12.6 4.1 14.2l.8-4.7-3.4-3.3 4.7-.7L8 1.2z" />
        </svg>
      );
    case 'price-asc':
      return (
        <svg className={common} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M8 3v10M4.5 10.5 8 14l3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'price-desc':
      return (
        <svg className={common} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          <path d="M8 13V3M4.5 5.5 8 2l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

export function ListingQuickSortChips({ value, onChange, chips = PLP_QUICK_SORT_CHIPS, className = '' }: Props) {
  return (
    <div
      className={['flex flex-wrap gap-2', className].filter(Boolean).join(' ')}
      role="group"
      aria-label="Brzi izbor sortiranja"
    >
      {chips.map((c) => {
        const active = value === c.value;
        return (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            aria-pressed={active}
            className={[
              'inline-flex min-h-[2.5rem] items-center gap-2 rounded-md border px-3 py-2 text-left text-[13px] font-normal leading-snug transition-colors sm:min-h-0 sm:px-3.5 sm:py-2.5',
              active
                ? 'border-neutral-800 bg-neutral-50 text-neutral-900'
                : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400',
            ].join(' ')}
          >
            <span className="min-w-0 flex-1">{c.label}</span>
            <span className={`shrink-0 ${active ? 'text-neutral-700' : 'text-neutral-400'}`} aria-hidden>
              <ChipIcon sortKey={c.value} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
