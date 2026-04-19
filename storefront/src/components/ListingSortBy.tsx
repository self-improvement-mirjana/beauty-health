import { SORT_OPTIONS, type SortKey } from '@/features/catalog/listingSort';

type Props = {
  value: SortKey;
  onChange: (key: SortKey) => void;
  /** Podrazumevano SORT_OPTIONS (npr. lista želja koristi WISHLIST_SORT_OPTIONS). */
  options?: { value: SortKey; label: string }[];
};

export function ListingSortBy({ value, onChange, options }: Props) {
  const opts = options ?? SORT_OPTIONS;
  const label = opts.find((o) => o.value === value)?.label ?? opts[0]!.label;
  return (
    <div className="relative inline-flex flex-wrap items-baseline gap-x-1.5 text-sm">
      <span className="text-neutral-600">Sortiraj po:</span>
      <span className="relative inline-flex min-h-[1.35rem] min-w-[11rem] items-baseline">
        <span className="pointer-events-none flex items-baseline gap-1 font-semibold text-neutral-900" aria-hidden>
          {label}
          <svg className="mt-0.5 h-3 w-3 shrink-0 text-neutral-800" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
            <path d="M6 8.25 1.76 4h8.48L6 8.25z" />
          </svg>
        </span>
        <select
          className="absolute inset-0 cursor-pointer opacity-0"
          value={value}
          onChange={(e) => onChange(e.target.value as SortKey)}
          aria-label="Sortiraj proizvode"
        >
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </span>
    </div>
  );
}
