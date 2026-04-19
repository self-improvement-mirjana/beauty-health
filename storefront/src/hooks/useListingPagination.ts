import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useListingPagination() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = useMemo(() => {
    const raw = searchParams.get('page');
    const n = raw == null ? 0 : Number.parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [searchParams]);

  const size = useMemo(() => {
    const raw = searchParams.get('size');
    const n = raw == null ? 20 : Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) {
      return 20;
    }
    return Math.min(100, Math.max(1, n));
  }, [searchParams]);

  const setPage = useCallback(
    (next: number) => {
      const p = Math.max(0, next);
      const nextParams = new URLSearchParams(searchParams);
      if (p === 0) {
        nextParams.delete('page');
      } else {
        nextParams.set('page', String(p));
      }
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  return { page, size, setPage };
}
