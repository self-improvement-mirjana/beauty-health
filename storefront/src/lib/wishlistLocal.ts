const STORAGE_KEY = 'beautyhealth_wishlist_v1';
export const WISHLIST_CHANGED_EVENT = 'beautyhealth-wishlist';

export type WishlistItem = {
  slug: string;
  title?: string;
  brandName?: string;
  primaryImageUrl?: string;
  priceLabel?: string;
  primaryVariantId?: number | null;
  inStock?: boolean;
  variantLabel?: string;
};

function dispatchChanged() {
  window.dispatchEvent(new Event(WISHLIST_CHANGED_EVENT));
}

function parseStored(raw: string | null): WishlistItem[] {
  if (!raw) {
    return [];
  }
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v) || v.length === 0) {
      return [];
    }
    if (typeof v[0] === 'string') {
      return (v as string[])
        .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
        .map((slug) => ({ slug }));
    }
    const out: WishlistItem[] = [];
    for (const x of v) {
      if (typeof x !== 'object' || x === null || typeof (x as WishlistItem).slug !== 'string') {
        continue;
      }
      const o = x as Record<string, unknown>;
      out.push({
        slug: o.slug as string,
        title: typeof o.title === 'string' ? o.title : undefined,
        brandName: typeof o.brandName === 'string' ? o.brandName : undefined,
        primaryImageUrl: typeof o.primaryImageUrl === 'string' ? o.primaryImageUrl : undefined,
        priceLabel: typeof o.priceLabel === 'string' ? o.priceLabel : undefined,
        primaryVariantId: typeof o.primaryVariantId === 'number' ? o.primaryVariantId : undefined,
        inStock: typeof o.inStock === 'boolean' ? o.inStock : undefined,
        variantLabel: typeof o.variantLabel === 'string' ? o.variantLabel : undefined,
      });
    }
    return out;
  } catch {
    return [];
  }
}

export function readWishlistItems(): WishlistItem[] {
  try {
    return parseStored(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

export function readWishlistSlugs(): string[] {
  return readWishlistItems().map((i) => i.slug);
}

function writeItems(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
  dispatchChanged();
}

function stripMeta(m?: Partial<Omit<WishlistItem, 'slug'>>): Partial<Omit<WishlistItem, 'slug'>> {
  if (!m) {
    return {};
  }
  const o: Partial<Omit<WishlistItem, 'slug'>> = {};
  if (m.title !== undefined) {
    o.title = m.title;
  }
  if (m.brandName !== undefined) {
    o.brandName = m.brandName;
  }
  if (m.primaryImageUrl !== undefined) {
    o.primaryImageUrl = m.primaryImageUrl;
  }
  if (m.priceLabel !== undefined) {
    o.priceLabel = m.priceLabel;
  }
  if (m.primaryVariantId !== undefined) {
    o.primaryVariantId = m.primaryVariantId;
  }
  if (m.inStock !== undefined) {
    o.inStock = m.inStock;
  }
  if (m.variantLabel !== undefined) {
    o.variantLabel = m.variantLabel;
  }
  return o;
}

export function wishlistContains(slug: string): boolean {
  const s = slug.trim();
  if (!s) {
    return false;
  }
  return readWishlistItems().some((i) => i.slug === s);
}

/**
 * Dodaje / uklanja slug. Pri dodavanju opciono upisuje metapodatke (Sephora-style panel).
 * Vraća true ako je stavka sada na listi.
 */
export function toggleWishlistSlug(slug: string, meta?: Partial<Omit<WishlistItem, 'slug'>>): boolean {
  const s = slug.trim();
  if (!s) {
    return false;
  }
  const cur = readWishlistItems();
  const idx = cur.findIndex((i) => i.slug === s);
  if (idx >= 0) {
    cur.splice(idx, 1);
    writeItems(cur);
    return false;
  }
  const extra = stripMeta(meta);
  const item: WishlistItem = { slug: s, ...extra };
  const next = [item, ...cur.filter((i) => i.slug !== s)].slice(0, 200);
  writeItems(next);
  return true;
}

export function removeWishlistSlug(slug: string) {
  const cur = readWishlistItems().filter((i) => i.slug !== slug);
  writeItems(cur);
}

/** Dopuna polja za postojeću stavku (npr. slika učitana sa API-ja). */
export function mergeWishlistItemMeta(slug: string, meta: Partial<Omit<WishlistItem, 'slug'>>) {
  const s = slug.trim();
  if (!s) {
    return;
  }
  const extra = stripMeta(meta);
  if (Object.keys(extra).length === 0) {
    return;
  }
  const items = readWishlistItems();
  const i = items.findIndex((x) => x.slug === s);
  if (i < 0) {
    return;
  }
  items[i] = { ...items[i], ...extra };
  writeItems(items);
}
