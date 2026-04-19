import { useEffect, useState, type ReactNode } from 'react';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { baseApi } from '@/features/api/baseApi';
import { clearCredentials, selectAuthToken, selectAuthUser, setUser } from '@/features/auth/authSlice';

type Props = { children: ReactNode };

/**
 * If only a token survived in storage, hydrate `user` from `GET /auth/me`.
 */
export function BootstrapAuth({ children }: Props) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectAuthToken);
  const user = useAppSelector(selectAuthUser);
  const [ready, setReady] = useState(!token || !!user);

  useEffect(() => {
    if (!token || user) {
      setReady(true);
      return;
    }
    let cancelled = false;
    dispatch(baseApi.endpoints.me.initiate(undefined, { forceRefetch: true }))
      .unwrap()
      .then((u) => {
        if (!cancelled) {
          dispatch(setUser(u));
        }
      })
      .catch(() => {
        if (!cancelled) {
          dispatch(clearCredentials());
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [dispatch, token, user]);

  if (!ready) {
    return (
      <div className="flex min-h-full items-center justify-center bg-slate-950 text-slate-400">
        Učitavanje…
      </div>
    );
  }
  return <>{children}</>;
}
