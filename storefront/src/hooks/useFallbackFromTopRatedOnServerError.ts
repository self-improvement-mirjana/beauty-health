import { useEffect, useRef } from 'react';

import type { SortKey } from '@/features/catalog/listingSort';
import { isFetchBaseQueryError } from '@/lib/isFetchBaseQueryError';

type Args = {
  isError: boolean;
  error: unknown;
  urlSortKey: SortKey;
  searchParams: URLSearchParams;
  setSearchParams: (next: URLSearchParams, opts?: { replace?: boolean }) => void;
};

/**
 * Ako „Najbolje ocenjeno“ vrati HTTP 5xx na listingu, jednom ukloni sort iz URL-a i vrati relevantnost.
 */
export function useFallbackFromTopRatedOnServerError({
  isError,
  error,
  urlSortKey,
  searchParams,
  setSearchParams,
}: Args) {
  const didFallback = useRef(false);

  useEffect(() => {
    if (urlSortKey !== 'topRated') {
      didFallback.current = false;
    }
  }, [urlSortKey]);

  useEffect(() => {
    if (!isError || urlSortKey !== 'topRated' || didFallback.current) {
      return;
    }
    if (!isFetchBaseQueryError(error)) {
      return;
    }
    const st = error.status;
    if (typeof st !== 'number' || st < 500) {
      return;
    }
    didFallback.current = true;
    const next = new URLSearchParams(searchParams);
    next.delete('sort');
    next.delete('page');
    setSearchParams(next, { replace: true });
  }, [isError, error, urlSortKey, searchParams, setSearchParams]);
}
