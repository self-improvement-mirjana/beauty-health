import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ListingQuickSortChips } from '@/components/ListingQuickSortChips';
import { ListingSortBy } from '@/components/ListingSortBy';
import { useListProductsQuery, useCategoryTreeQuery, useListBrandsQuery } from '@/features/api/catalogEndpoints';
import { normalizeSortKey, type SortKey } from '@/features/catalog/listingSort';
import { ProductListing } from '@/components/ProductListing';
import { ShopListingFilters } from '@/components/ShopListingFilters';
import { useFallbackFromTopRatedOnServerError } from '@/hooks/useFallbackFromTopRatedOnServerError';
import { useListingPagination } from '@/hooks/useListingPagination';
import { parseCategoryFacetSearchParams, setCategoryFacetOnParams } from '@/lib/categoryFacetParams';
import { buildBrandOptions, buildCategoryOptions } from '@/lib/shopListingOptions';

export function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, size, setPage } = useListingPagination();
  const selectedCategorySlug = searchParams.get('category')?.trim() ?? '';
  const selectedBrandSlug = searchParams.get('brand')?.trim() ?? '';
  const featuredOnly =
    searchParams.get('featured') === '1' || searchParams.get('featured')?.toLowerCase() === 'true';
  const ratingMinRaw = searchParams.get('ratingMin');
  const ratingMinParsed = ratingMinRaw == null ? NaN : Number.parseInt(ratingMinRaw, 10);
  const ratingMin =
    Number.isFinite(ratingMinParsed) && ratingMinParsed >= 1 && ratingMinParsed <= 5 ? ratingMinParsed : null;
  const rawSort = searchParams.get('sort')?.trim() ?? '';
  const urlSortKey = normalizeSortKey(rawSort);

  const selectedFacetSlugs = useMemo(
    () => parseCategoryFacetSearchParams(searchParams),
    [searchParams.toString()],
  );

  useEffect(() => {
    if (searchParams.getAll('categoryFacet').length <= 1) {
      return;
    }
    const merged = parseCategoryFacetSearchParams(searchParams);
    const next = new URLSearchParams(searchParams);
    setCategoryFacetOnParams(next, merged);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const { data, isLoading, isError, error, isFetching, refetch } = useListProductsQuery({
    page,
    size,
    categorySlug: selectedCategorySlug || undefined,
    ...(selectedFacetSlugs.length ? { categoryFacet: selectedFacetSlugs } : {}),
    brandSlug: selectedBrandSlug || undefined,
    ...(featuredOnly ? { featured: true } : {}),
    ...(ratingMin != null ? { minRating: ratingMin } : {}),
    ...(rawSort ? { sort: rawSort } : {}),
  }, { refetchOnMountOrArgChange: true });

  useFallbackFromTopRatedOnServerError({
    isError,
    error,
    urlSortKey,
    searchParams,
    setSearchParams,
  });

  const {
    data: tree,
    isLoading: treeLoading,
    isError: treeError,
    error: treeErr,
    refetch: refetchTree,
  } = useCategoryTreeQuery();
  const {
    data: brands,
    isLoading: brandsLoading,
    isError: brandsError,
    error: brandsErr,
    refetch: refetchBrands,
  } = useListBrandsQuery();

  const categoryOptions = useMemo(() => buildCategoryOptions(tree ?? []), [tree]);
  const brandOptions = useMemo(() => buildBrandOptions(brands ?? []), [brands]);

  const toggleFacet = useCallback(
    (slug: string) => {
      const trimmed = slug.trim();
      if (!trimmed) {
        return;
      }
      const merged = parseCategoryFacetSearchParams(searchParams);
      const lower = trimmed.toLowerCase();
      const wasOn = merged.some((s) => s.toLowerCase() === lower);
      const nextSlugs = wasOn ? merged.filter((s) => s.toLowerCase() !== lower) : [...merged, trimmed];
      const p = new URLSearchParams(searchParams);
      setCategoryFacetOnParams(p, nextSlugs);
      p.delete('page');
      setSearchParams(p, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setSort = useCallback(
    (nextKey: SortKey) => {
      const nextParams = new URLSearchParams(searchParams);
      if (nextKey === 'relevance') {
        nextParams.delete('sort');
      } else {
        nextParams.set('sort', nextKey);
      }
      nextParams.delete('page');
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  function updateSearchParam(key: 'category' | 'brand', value: string) {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    nextParams.delete('page');
    setSearchParams(nextParams, { replace: true });
  }

  function updateFeatured(value: boolean) {
    const nextParams = new URLSearchParams(searchParams);
    if (value) {
      nextParams.set('featured', '1');
    } else {
      nextParams.delete('featured');
    }
    nextParams.delete('page');
    setSearchParams(nextParams, { replace: true });
  }

  function clearAllFilters() {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('category');
    nextParams.delete('categoryFacet');
    nextParams.delete('brand');
    nextParams.delete('featured');
    nextParams.delete('ratingMin');
    nextParams.delete('page');
    setSearchParams(nextParams, { replace: true });
  }

  function updateRatingMin(value: number | null) {
    const nextParams = new URLSearchParams(searchParams);
    if (value != null) {
      nextParams.set('ratingMin', String(value));
    } else {
      nextParams.delete('ratingMin');
    }
    nextParams.delete('page');
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <div>
      <h1 className="font-sans text-lg font-semibold leading-snug tracking-tight text-neutral-900 md:text-xl">
        Prodavnica
      </h1>

      {/* Dve kolone od md: leva kolona fiksne širine da se ne „sruši“; minmax(0,1fr) sprečava grid blowout. */}
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[minmax(260px,300px)_minmax(0,1fr)] lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] lg:gap-10">
        <aside className="min-h-0 min-w-0 w-full md:sticky md:top-[calc(var(--site-header-height,5rem)+0.75rem)] md:z-10 md:max-h-[calc(100vh-5.5rem)] md:self-start md:overflow-y-auto md:overflow-x-hidden md:pr-1">
          <ShopListingFilters
            tree={tree}
            categoryOptions={categoryOptions}
            brandOptions={brandOptions}
            selectedCategorySlug={selectedCategorySlug}
            selectedFacetSlugs={selectedFacetSlugs}
            onFacetToggle={toggleFacet}
            selectedBrandSlug={selectedBrandSlug}
            selectedRatingMin={ratingMin}
            onRatingMinChange={updateRatingMin}
            featuredOnly={featuredOnly}
            treeLoading={treeLoading}
            treeError={treeError}
            treeErr={treeErr}
            brandsLoading={brandsLoading}
            brandsError={brandsError}
            brandsErr={brandsErr}
            onRetryTree={() => void refetchTree()}
            onRetryBrands={() => void refetchBrands()}
            onCategoryChange={(slug) => updateSearchParam('category', slug)}
            onBrandChange={(slug) => updateSearchParam('brand', slug)}
            onFeaturedChange={updateFeatured}
            onClearCategory={() => updateSearchParam('category', '')}
            onClearBrand={() => updateSearchParam('brand', '')}
            onClearAll={clearAllFilters}
          />
        </aside>
        <div className="min-w-0">
          {(selectedCategorySlug ||
            selectedFacetSlugs.length > 0 ||
            selectedBrandSlug ||
            featuredOnly ||
            ratingMin != null) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-neutral-600">Aktivni filteri:</span>
              {selectedFacetSlugs.map((fs) => (
                <button
                  key={fs}
                  type="button"
                  onClick={() => toggleFacet(fs)}
                  className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-800 hover:border-neutral-900"
                >
                  kategorija (facet): {fs} ×
                </button>
              ))}
              {ratingMin != null ? (
                <button
                  type="button"
                  onClick={() => updateRatingMin(null)}
                  className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-800 hover:border-neutral-900"
                >
                  ocena: {ratingMin}+ ×
                </button>
              ) : null}
              {featuredOnly ? (
                <button
                  type="button"
                  onClick={() => updateFeatured(false)}
                  className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-800 hover:border-neutral-900"
                >
                  istaknuto ×
                </button>
              ) : null}
              {selectedCategorySlug ? (
                <button
                  type="button"
                  onClick={() => updateSearchParam('category', '')}
                  className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-800 hover:border-neutral-900"
                >
                  kategorija: {selectedCategorySlug} ×
                </button>
              ) : null}
              {selectedBrandSlug ? (
                <button
                  type="button"
                  onClick={() => updateSearchParam('brand', '')}
                  className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-800 hover:border-neutral-900"
                >
                  brend: {selectedBrandSlug} ×
                </button>
              ) : null}
            </div>
          )}
          <ListingQuickSortChips value={urlSortKey} onChange={setSort} className="mb-5" />
          <div className="mb-6 flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-sm text-neutral-500">
              {typeof data?.totalElements === 'number' ? `${data.totalElements} rezultata` : '\u00a0'}
            </p>
            <ListingSortBy value={urlSortKey} onChange={setSort} />
          </div>
          <ProductListing
            data={data}
            isLoading={isLoading}
            isError={isError}
            error={error}
            isFetching={isFetching}
            refetch={refetch}
            page={page}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
