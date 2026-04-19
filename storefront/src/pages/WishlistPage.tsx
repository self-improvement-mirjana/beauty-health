import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { ErrorState } from '@/components/ErrorState';
import { ListingSortBy } from '@/components/ListingSortBy';
import { ProductCard } from '@/components/ProductCard';
import { ProductGridSkeleton } from '@/components/ProductGridSkeleton';
import type { ProductCardDto } from '@/features/catalog/types';
import { useWishlistProductCardsQuery } from '@/features/api/catalogEndpoints';
import { normalizeSortKey, WISHLIST_SORT_OPTIONS, type SortKey } from '@/features/catalog/listingSort';
import { readWishlistItems, type WishlistItem, WISHLIST_CHANGED_EVENT } from '@/lib/wishlistLocal';

export function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(() => readWishlistItems());
  const [searchParams, setSearchParams] = useSearchParams();
  const [saleOnly, setSaleOnly] = useState(false);

  const rawSort = searchParams.get('sort')?.trim() ?? '';
  const urlSortKey: SortKey = rawSort ? normalizeSortKey(rawSort) : 'wishlist';

  useEffect(() => {
    function sync() {
      setItems(readWishlistItems());
    }
    window.addEventListener(WISHLIST_CHANGED_EVENT, sync);
    return () => window.removeEventListener(WISHLIST_CHANGED_EVENT, sync);
  }, []);

  const slugs = useMemo(() => items.map((i) => i.slug), [items]);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useWishlistProductCardsQuery(
    {
      slugs,
      ...(rawSort ? { sort: rawSort } : {}),
    },
    { skip: slugs.length === 0 },
  );

  /** Nikad ne prikazuj više od slug-ova iz localStorage (zaštita od pogrešnog RTK keša / API odgovora). */
  const cardsFromWishlist = useMemo(() => {
    const raw = data?.content ?? [];
    const allow = new Set(slugs);
    const only = raw.filter((p) => allow.has(p.slug));
    const bySlug = new Map(only.map((p) => [p.slug, p] as const));
    if (urlSortKey === 'wishlist') {
      return slugs.map((s) => bySlug.get(s)).filter((p): p is ProductCardDto => p != null);
    }
    return only;
  }, [data?.content, slugs, urlSortKey]);

  const setSort = useCallback(
    (nextKey: SortKey) => {
      const nextParams = new URLSearchParams(searchParams);
      if (nextKey === 'wishlist') {
        nextParams.delete('sort');
      } else {
        nextParams.set('sort', nextKey);
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const visible = saleOnly ? cardsFromWishlist.filter((p) => p.moneySale != null) : cardsFromWishlist;
  const missingCount =
    slugs.length > 0 && data ? Math.max(0, slugs.length - cardsFromWishlist.length) : 0;

  return (
    <div className="min-h-[60vh] bg-white">
      <nav className="mb-6 text-xs text-neutral-600" aria-label="Putanja">
        <Link to="/" className="hover:text-neutral-900 hover:underline">
          Početna
        </Link>
        <span className="mx-1.5 text-neutral-400">/</span>
        <span className="text-neutral-900">Lista želja</span>
      </nav>

      <header className="mb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">Lista želja</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          Sačuvano u ovom pregledaču.{' '}
          <Link to="/shop" className="font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600">
            Nastavi kupovinu
          </Link>
        </p>
      </header>

      {items.length === 0 ? (
        <p className="mt-10 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-600">
          Lista je prazna. Sačuvajte proizvode klikom na srce na kartici ili stranici proizvoda.
        </p>
      ) : (
        <>
          <div className="mb-6 flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSaleOnly((v) => !v)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  saleOnly
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900'
                }`}
              >
                Akcija
              </button>
            </div>
            <p className="order-first text-sm text-neutral-500 sm:order-none">
              {isLoading
                ? '\u00a0'
                : `${visible.length} od ${cardsFromWishlist.length} prikazanih${missingCount ? ` · ${missingCount} nije u katalogu` : ''}`}
            </p>
            <ListingSortBy value={urlSortKey} onChange={setSort} options={WISHLIST_SORT_OPTIONS} />
          </div>

          {isLoading ? <ProductGridSkeleton /> : null}
          {isError ? (
            <ErrorState error={error} onRetry={() => void refetch()} />
          ) : null}
          {!isLoading && !isError && visible.length === 0 ? (
            <p className="text-sm text-neutral-500">
              {saleOnly
                ? 'Nema proizvoda na akciji u ovoj listi. Isključite filter „Akcija”.'
                : 'Nema proizvoda za prikaz.'}
            </p>
          ) : null}
          {!isLoading && !isError && visible.length > 0 ? (
            <div className={isFetching ? 'opacity-70 transition-opacity' : ''}>
              <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
                {visible.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
