import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

/** RTK Query u novijim verzijama ne izvozi `isFetchBaseQueryError` iz `@reduxjs/toolkit/query`. */
export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
  if (typeof error !== 'object' || error === null || !('status' in error)) {
    return false;
  }
  const s = (error as { status: unknown }).status;
  return (
    typeof s === 'number' ||
    s === 'FETCH_ERROR' ||
    s === 'PARSING_ERROR' ||
    s === 'TIMEOUT_ERROR' ||
    s === 'CUSTOM_ERROR'
  );
}
