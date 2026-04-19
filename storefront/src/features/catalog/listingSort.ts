/** Ključevi u URL-u (?sort=…), red kao na Sephora PLP-u. */
export type SortKey =
  | 'relevance'
  | 'wishlist'
  | 'bestselling'
  | 'topRated'
  | 'price-asc'
  | 'price-desc'
  | 'new';

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'relevance', label: 'Relevantnost' },
  { value: 'bestselling', label: 'Najprodavaniji' },
  { value: 'topRated', label: 'Najbolje ocenjeno' },
  { value: 'price-asc', label: 'Cena: najniža prvo' },
  { value: 'price-desc', label: 'Cena: najviša prvo' },
  { value: 'new', label: 'Novo' },
];

/**
 * Brzi izbor na PLP (Sephora stil). Usklađeno sa bekendom:
 * relevantnost (podrazumevano), novo → createdAt, najprodavaniji → featured,
 * najbolje ocenjeno → ratingAvg, cena → COALESCE(sale, regular).
 */
export const PLP_QUICK_SORT_CHIPS: { value: SortKey; label: string }[] = [
  { value: 'relevance', label: 'Relevantnost' },
  { value: 'new', label: 'Novo' },
  { value: 'bestselling', label: 'Najprodavaniji' },
  { value: 'topRated', label: 'Najbolje ocenjeno' },
  { value: 'price-asc', label: 'Najjeftinije prvo' },
  { value: 'price-desc', label: 'Najskuplje prvo' },
];

/** Lista želja: prvo „nedavno dodato“ (red kao u pregledaču), zatim iste opcije kao PLP. */
export const WISHLIST_SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'wishlist', label: 'Nedavno dodato' },
  ...SORT_OPTIONS.filter((o) => o.value !== 'relevance'),
];

const SORT_KEYS = new Set<string>([...SORT_OPTIONS.map((o) => o.value), 'wishlist']);

const LEGACY_SORT: Record<string, SortKey> = {
  'id,desc': 'new',
  'id,asc': 'relevance',
  'price,asc': 'price-asc',
  'price,desc': 'price-desc',
};

/**
 * Vrednost iz ?sort=… (npr. price-desc) ili već Spring „property,direction“ (npr. name,asc)
 * u format koji backend očekuje na /products i /products/search.
 */
export function toApiSortParam(sort: string | undefined): string | undefined {
  const t = sort?.trim();
  if (!t) {
    return undefined;
  }
  if (t.includes(',')) {
    const legacy = LEGACY_SORT[t];
    if (legacy !== undefined) {
      return sortKeyToApiSort(legacy);
    }
    return t;
  }
  return sortKeyToApiSort(normalizeSortKey(t));
}

export function normalizeSortKey(raw: string): SortKey {
  const t = raw.trim();
  if (!t) {
    return 'relevance';
  }
  if (SORT_KEYS.has(t)) {
    return t as SortKey;
  }
  return LEGACY_SORT[t] ?? 'relevance';
}

export function sortKeyToApiSort(key: SortKey): string | undefined {
  switch (key) {
    case 'relevance':
    case 'wishlist':
      return undefined;
    case 'bestselling':
      return 'featured,desc';
    case 'topRated':
      return 'ratingAvg,desc';
    case 'price-asc':
      return 'price,asc';
    case 'price-desc':
      return 'price,desc';
    case 'new':
      return 'createdAt,desc';
    default:
      return undefined;
  }
}
