import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAppSelector } from '@/app/hooks';
import { selectAuthToken, selectIsModerator } from '@/features/auth/authSlice';

export function RequireModerator() {
  const token = useAppSelector(selectAuthToken);
  const isModerator = useAppSelector(selectIsModerator);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (!isModerator) {
    return <Navigate to="/forbidden" replace />;
  }
  return <Outlet />;
}
