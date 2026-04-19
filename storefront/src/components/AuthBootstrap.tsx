import { useEffect, useLayoutEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useGetAuthMeQuery } from '@/features/api/authEndpoints';
import { clearCredentials, selectAccessToken, setCredentials, setUser } from '@/features/auth/authSlice';
import { readAuthSession } from '@/lib/authSession';
import { isFetchBaseQueryError } from '@/lib/isFetchBaseQueryError';

function isUnauthorizedError(error: unknown): boolean {
  if (!isFetchBaseQueryError(error)) {
    return false;
  }
  return Number((error as { status: unknown }).status) === 401;
}

/**
 * Učitava sesiju iz storage-a i osvežava korisnika sa `/auth/me`.
 * Istekao ili nevažeći JWT: `/auth/me` → 401 → brišemo lokalnu sesiju da klijent ne šalje mrtav Bearer i da UI prikaže gosta.
 */
export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const { data, error, isError } = useGetAuthMeQuery(undefined, {
    skip: !accessToken,
    refetchOnMountOrArgChange: true,
  });

  useLayoutEffect(() => {
    if (accessToken) {
      return;
    }
    const restored = readAuthSession();
    if (restored) {
      dispatch(
        setCredentials({
          accessToken: restored.payload.accessToken,
          user: restored.payload.user,
          rememberMe: restored.persistent,
        }),
      );
    }
  }, [accessToken, dispatch]);

  useEffect(() => {
    function syncFromStorage() {
      const restored = readAuthSession();
      if (restored && !accessToken) {
        dispatch(
          setCredentials({
            accessToken: restored.payload.accessToken,
            user: restored.payload.user,
            rememberMe: restored.persistent,
          }),
        );
      }
    }
    function onVisibility() {
      if (document.visibilityState === 'visible') {
        syncFromStorage();
      }
    }
    window.addEventListener('pageshow', syncFromStorage);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pageshow', syncFromStorage);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (data) {
      dispatch(setUser(data));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (!isError || !error || !accessToken) {
      return;
    }
    if (isUnauthorizedError(error)) {
      dispatch(clearCredentials());
      if (import.meta.env.DEV) {
        console.warn('[AuthBootstrap] GET /auth/me → 401. Sesija očišćena; prijavite se ponovo.');
      }
    }
  }, [dispatch, error, isError, accessToken]);

  return null;
}
