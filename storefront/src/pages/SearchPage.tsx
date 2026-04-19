import { useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { ListingQuickSortChips } from '@/components/ListingQuickSortChips';
import { ListingSortBy } from '@/components/ListingSortBy';
import { ProductListing } from '@/components/ProductListing';
import { useSearchProductsQuery } from '@/features/api/catalogEndpoints';
import { normalizeSortKey, type SortKey } from '@/features/catalog/listingSort';
import { useFallbackFromTopRatedOnServerError } from '@/hooks/useFallbackFromTopRatedOnServerError';
import { useListingPagination } from '@/hooks/useListingPagination';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q')?.trim() ?? '';
  const rawSort = searchParams.get('sort')?.trim() ?? '';
  const urlSortKey = normalizeSortKey(rawSort);
  const { page, size, setPage } = useListingPagination();

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

  const { data, isLoading, isError, error, isFetching, refetch } = useSearchProductsQuery(
    { q, page, size, ...(rawSort ? { sort: rawSort } : {}) },
    { skip: !q },
  );

  useFallbackFromTopRatedOnServerError({
    isError,
    error,
    urlSortKey,
    searchParams,
    setSearchParams,
  });

  if (!q) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Pretraga</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Unesite pojam u polje „Products search” u zaglavlju. Prazan upit ne šalje se na backend (B05 vraća 400).
        </p>
        <p className="mt-4">
          <Link to="/shop" className="text-sm text-neutral-900 underline underline-offset-2 hover:text-neutral-600">
            Idi u prodavnicu
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Pretraga</h1>
      <p className="mt-1 text-sm text-neutral-600">
        Upit: <span className="font-mono text-neutral-900">{q}</span> (B05)
      </p>
      <ListingQuickSortChips value={urlSortKey} onChange={setSort} className="mt-5" />
      <div className="mt-5 flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-baseline sm:justify-between">
        <p className="text-sm text-neutral-500">
          {typeof data?.totalElements === 'number' ? `${data.totalElements} rezultata` : '\u00a0'}
        </p>
        <ListingSortBy value={urlSortKey} onChange={setSort} />
      </div>
      <div className="mt-8">
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
  );
}
