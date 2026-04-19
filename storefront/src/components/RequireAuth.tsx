import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAppSelector } from '@/app/hooks';
import { hasBrowserAuthToken } from '@/features/auth/authPresence';
import { selectAccessToken } from '@/features/auth/authSlice';

export function RequireAuth() {
  const token = useAppSelector(selectAccessToken);
  const location = useLocation();

  if (!token && !hasBrowserAuthToken()) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet />;
}
