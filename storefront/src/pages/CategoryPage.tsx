import { useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { ErrorState } from '@/components/ErrorState';
import { ListingQuickSortChips } from '@/components/ListingQuickSortChips';
import { ListingSortBy } from '@/components/ListingSortBy';
import { ProductListing } from '@/components/ProductListing';
import { ShopListingFilters } from '@/components/ShopListingFilters';
import {
  useCategoryChildProductCountsQuery,
  useCategoryTreeQuery,
  useListBrandsQuery,
  useListProductsQuery,
} from '@/features/api/catalogEndpoints';
import type { CategoryTreeNodeDto } from '@/features/catalog/types';
import { normalizeSortKey, type SortKey } from '@/features/catalog/listingSort';
import { useFallbackFromTopRatedOnServerError } from '@/hooks/useFallbackFromTopRatedOnServerError';
import { useListingPagination } from '@/hooks/useListingPagination';
import { formatCategoryCount } from '@/lib/formatCategoryCount';
import { findCategoryBySlug, getCategoryPath } from '@/lib/categoryTree';
import { parseCategoryFacetSearchParams, setCategoryFacetOnParams } from '@/lib/categoryFacetParams';
import { buildBrandOptions, buildCategoryOptions } from '@/lib/shopListingOptions';

/** Isti query (brend, featured, ocena, sort) pri navigaciji između kategorija. */
function listingHrefForCategoryPath(slug: string, searchParams: URLSearchParams, urlSortKey: SortKey): string {
  const path = `/category/${encodeURIComponent(slug)}`;
  const p = new URLSearchParams(searchParams);
  p.delete('page');
  if (urlSortKey === 'relevance') {
    p.delete('sort');
  } else {
    p.set('sort', urlSortKey);
  }
  const q = p.toString();
  return q ? `${path}?${q}` : path;
}

/**
 * Jedan red u sidebaru: batch brojevi (jedan HTTP) kad nema filtera brenda; inače /products?size=1 po redu;
 * ako batch ruta ne postoji, fallback na isti listing upit.
 */
function CategorySidebarChildLink({
  child,
  currentCategorySlug,
  brandSlug,
  searchParams,
  urlSortKey,
  useProductTotalFallback,
  batchCount,
  featuredOnly,
  ratingMin,
  categoryFacet,
}: {
  child: CategoryTreeNodeDto;
  currentCategorySlug: string;
  brandSlug: string;
  searchParams: URLSearchParams;
  urlSortKey: SortKey;
  useProductTotalFallback: boolean;
  /** Samo kad je useProductTotalFallback false; undefined = još učitavanje batch-a */
  batchCount?: number;
  featuredOnly: boolean;
  ratingMin: number | null;
  categoryFacet: string[];
}) {
  const active = child.slug.toLowerCase() === currentCategorySlug.toLowerCase();
  const { data, isFetching, isLoading } = useListProductsQuery(
    {
      page: 0,
      size: 1,
      categorySlug: child.slug,
      ...(categoryFacet.length ? { categoryFacet } : {}),
      brandSlug: brandSlug || undefined,
      ...(featuredOnly ? { featured: true } : {}),
      ...(ratingMin != null ? { minRating: ratingMin } : {}),
    },
    { skip: !child.slug || !useProductTotalFallback },
  );

  let countParen: string;
  if (useProductTotalFallback) {
    const total = data?.totalElements;
    countParen =
      isLoading || isFetching ? '(…)' : `(${formatCategoryCount(typeof total === 'number' ? total : 0)})`;
  } else if (batchCount === undefined) {
    countParen = '(…)';
  } else {
    countParen = `(${formatCategoryCount(batchCount)})`;
  }

  return (
    <li>
      <Link
        to={listingHrefForCategoryPath(child.slug, searchParams, urlSortKey)}
        className={[
          'group flex items-baseline justify-between gap-3 py-2 pr-1 text-sm no-underline transition-colors',
          'rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/15',
          active ? 'font-semibold text-neutral-900' : 'font-normal text-neutral-800 hover:text-neutral-900',
        ].join(' ')}
      >
        <span
          className={[
            'min-w-0 decoration-neutral-900 decoration-1 underline-offset-[5px]',
            'group-hover:underline group-focus-visible:underline',
          ].join(' ')}
        >
          {child.name}
        </span>
        <span
          className={`shrink-0 tabular-nums tracking-tight ${active ? 'text-neutral-600' : 'text-neutral-500'}`}
        >
          {countParen}
        </span>
      </Link>
    </li>
  );
}

export function CategoryPage() {
  const { slug: slugParam } = useParams();
  const slug = slugParam ?? '';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const brandSlug = searchParams.get('brand')?.trim() ?? '';
  const featuredOnly =
    searchParams.get('featured') === '1' || searchParams.get('featured')?.toLowerCase() === 'true';
  const ratingMinRaw = searchParams.get('ratingMin');
  const ratingMinParsed = ratingMinRaw == null ? NaN : Number.parseInt(ratingMinRaw, 10);
  const ratingMin =
    Number.isFinite(ratingMinParsed) && ratingMinParsed >= 1 && ratingMinParsed <= 5 ? ratingMinParsed : null;
  const rawSort = searchParams.get('sort')?.trim() ?? '';
  const urlSortKey = normalizeSortKey(rawSort);
  const { page, size, setPage } = useListingPagination();

  const selectedFacetSlugs = useMemo(
    () => parseCategoryFacetSearchParams(searchParams),
    [searchParams.toString()],
  );

  /** Stari bookmarkovi sa više `categoryFacet=` — spoji u jedan parametar da URL i zahtev budu isti kao šta API očekuje. */
  useEffect(() => {
    if (searchParams.getAll('categoryFacet').length <= 1) {
      return;
    }
    const merged = parseCategoryFacetSearchParams(searchParams);
    const next = new URLSearchParams(searchParams);
    setCategoryFacetOnParams(next, merged);
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

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

  const { data, isLoading, isError, error, isFetching, refetch } = useListProductsQuery(
    {
      page,
      size,
      categorySlug: slug || undefined,
      ...(selectedFacetSlugs.length ? { categoryFacet: selectedFacetSlugs } : {}),
      brandSlug: brandSlug || undefined,
      ...(featuredOnly ? { featured: true } : {}),
      ...(ratingMin != null ? { minRating: ratingMin } : {}),
      ...(rawSort ? { sort: rawSort } : {}),
    },
    { skip: !slug, refetchOnMountOrArgChange: true },
  );

  useFallbackFromTopRatedOnServerError({
    isError,
    error,
    urlSortKey,
    searchParams,
    setSearchParams,
  });

  const path = useMemo(() => (tree && slug ? getCategoryPath(tree, slug) : []), [tree, slug]);
  const categoryNode = useMemo(() => (tree && slug ? findCategoryBySlug(tree, slug) : null), [tree, slug]);
  const childCategories = categoryNode?.children ?? [];
  const skipChildCounts = !slug || childCategories.length === 0;
  /** Batch ne primenjuje facet filtere — tada brojimo preko listinga. */
  const skipBatchChildCounts =
    skipChildCounts || !!brandSlug || featuredOnly || ratingMin != null || selectedFacetSlugs.length > 0;
  const {
    data: childProductCounts,
    isError: childCountsError,
    isLoading: childCountsLoading,
    isFetching: childCountsFetching,
  } = useCategoryChildProductCountsQuery(slug, { skip: skipBatchChildCounts });
  const countBySlug = useMemo(() => {
    const m = new Map<string, number>();
    if (!childProductCounts) {
      return m;
    }
    for (const row of childProductCounts) {
      m.set(row.slug.trim().toLowerCase(), row.productCount);
    }
    return m;
  }, [childProductCounts]);
  const useFallbackSidebarCounts = !skipChildCounts && (!!brandSlug || childCountsError);

  const categoryOptions = useMemo(() => buildCategoryOptions(tree ?? []), [tree]);
  const brandOptions = useMemo(() => buildBrandOptions(brands ?? []), [brands]);

  const shopListingParams = useMemo(() => {
    const p = new URLSearchParams(searchParams);
    p.delete('page');
    return p;
  }, [searchParams]);

  const onBrandChange = useCallback(
    (next: string) => {
      const nextParams = new URLSearchParams(searchParams);
      if (next) {
        nextParams.set('brand', next);
      } else {
        nextParams.delete('brand');
      }
      nextParams.delete('page');
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const onCategoryChange = useCallback(
    (nextSlug: string) => {
      const p = new URLSearchParams(searchParams);
      p.delete('page');
      const trimmed = nextSlug.trim();
      if (!trimmed) {
        navigate(`/shop?${p.toString()}`);
        return;
      }
      navigate(`/category/${encodeURIComponent(trimmed)}?${p.toString()}`);
    },
    [navigate, searchParams],
  );

  const onClearCategory = useCallback(() => {
    const p = new URLSearchParams(searchParams);
    p.delete('page');
    navigate(`/shop?${p.toString()}`);
  }, [navigate, searchParams]);

  const updateFeatured = useCallback(
    (value: boolean) => {
      const nextParams = new URLSearchParams(searchParams);
      if (value) {
        nextParams.set('featured', '1');
      } else {
        nextParams.delete('featured');
      }
      nextParams.delete('page');
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const updateRatingMin = useCallback(
    (value: number | null) => {
      const nextParams = new URLSearchParams(searchParams);
      if (value != null) {
        nextParams.set('ratingMin', String(value));
      } else {
        nextParams.delete('ratingMin');
      }
      nextParams.delete('page');
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const clearAllFilters = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('brand');
    nextParams.delete('categoryFacet');
    nextParams.delete('featured');
    nextParams.delete('ratingMin');
    nextParams.delete('page');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const toggleFacet = useCallback(
    (facetSlug: string) => {
      const trimmed = facetSlug.trim();
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

  if (!slug) {
    return <p className="text-sm text-red-700">Nedostaje slug u URL-u.</p>;
  }

  const parent = path.length > 1 ? path[path.length - 2]! : null;
  const unknownCategory = Boolean(tree && !treeLoading && !categoryNode);

  return (
    <div className="min-h-[60vh] bg-white">
      <nav className="mb-6 text-xs text-neutral-600" aria-label="Putanja">
        <Link to="/" className="hover:text-neutral-900 hover:underline">
          Početna
        </Link>
        <span className="mx-1.5 text-neutral-400">/</span>
        <Link
          to={shopListingParams.toString() ? `/shop?${shopListingParams.toString()}` : '/shop'}
          className="hover:text-neutral-900 hover:underline"
        >
          Prodavnica
        </Link>
        {path.map((node) => (
          <span key={node.id}>
            <span className="mx-1.5 text-neutral-400">/</span>
            {node.slug.toLowerCase() === slug.toLowerCase() ? (
              <span className="text-neutral-900">{node.name}</span>
            ) : (
              <Link
                to={listingHrefForCategoryPath(node.slug, searchParams, urlSortKey)}
                className="hover:text-neutral-900 hover:underline"
              >
                {node.name}
              </Link>
            )}
          </span>
        ))}
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(260px,300px)_minmax(0,1fr)] lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)] lg:gap-10">
        <aside className="min-h-0 min-w-0 w-full md:sticky md:top-[calc(var(--site-header-height,5rem)+0.75rem)] md:z-10 md:max-h-[calc(100vh-5.5rem)] md:self-start md:overflow-y-auto md:overflow-x-hidden md:pr-1">
          <div className="space-y-6 pb-2">
            <div className="border-b border-neutral-200 pb-6">
              <h1 className="font-sans text-lg font-semibold leading-snug tracking-tight text-neutral-900 md:text-xl">
                {categoryNode?.name ?? slug}
              </h1>
            </div>

            {childCategories.length > 0 ? (
              <nav className="border-b border-neutral-200 pb-6" aria-label="Podkategorije">
                <ul className="flex flex-col">
                  {childCategories.map((c: CategoryTreeNodeDto) => (
                    <CategorySidebarChildLink
                      key={c.id}
                      child={c}
                      currentCategorySlug={slug}
                      brandSlug={brandSlug}
                      searchParams={searchParams}
                      urlSortKey={urlSortKey}
                      useProductTotalFallback={useFallbackSidebarCounts}
                      featuredOnly={featuredOnly}
                      ratingMin={ratingMin}
                      categoryFacet={selectedFacetSlugs}
                      batchCount={
                        useFallbackSidebarCounts
                          ? undefined
                          : childCountsLoading || childCountsFetching
                            ? undefined
                            : (countBySlug.get(c.slug.trim().toLowerCase()) ?? 0)
                      }
                    />
                  ))}
                </ul>
              </nav>
            ) : null}

            <ShopListingFilters
              tree={tree}
              categoryOptions={categoryOptions}
              brandOptions={brandOptions}
              selectedCategorySlug={slug}
              selectedFacetSlugs={selectedFacetSlugs}
              onFacetToggle={toggleFacet}
              selectedBrandSlug={brandSlug}
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
              onCategoryChange={onCategoryChange}
              onBrandChange={onBrandChange}
              onFeaturedChange={updateFeatured}
              onClearCategory={onClearCategory}
              onClearBrand={() => onBrandChange('')}
              onClearAll={clearAllFilters}
              countCategoryForActiveFilters={false}
              showCategoryResetButton={false}
            />

            {parent ? (
              <div className="border-b border-neutral-200 pb-6">
                <Link
                  to={listingHrefForCategoryPath(parent.slug, searchParams, urlSortKey)}
                  className="text-sm text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline"
                >
                  ← {parent.name}
                </Link>
              </div>
            ) : null}

            <div className="border-t border-neutral-200 pt-6">
              <Link
                to={shopListingParams.toString() ? `/shop?${shopListingParams.toString()}` : '/shop'}
                className="text-sm text-neutral-700 underline underline-offset-2 hover:text-neutral-900"
              >
                Sve kategorije (prodavnica)
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0 bg-white">
          {(brandSlug || featuredOnly || ratingMin != null || selectedFacetSlugs.length > 0) && (
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
              {brandSlug ? (
                <button
                  type="button"
                  onClick={() => onBrandChange('')}
                  className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs text-neutral-800 hover:border-neutral-900"
                >
                  brend: {brandSlug} ×
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

          {treeLoading && !categoryNode ? (
            <p className="mb-6 text-sm text-neutral-500">Učitavanje kategorije…</p>
          ) : null}
          {treeError ? (
            <div className="mb-6">
              <ErrorState error={treeErr} onRetry={() => void refetchTree()} />
            </div>
          ) : null}
          {unknownCategory ? (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              Kategorija „{slug}” nije pronađena u stablu kataloga. Proizvodi ispod i dalje mogu biti dostupni ako ih
              backend vraća.
            </div>
          ) : null}

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
