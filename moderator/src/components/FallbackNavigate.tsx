import { Navigate } from 'react-router-dom';

import { useAppSelector } from '@/app/hooks';
import { selectAuthToken, selectIsModerator } from '@/features/auth/authSlice';

/** Unknown paths: send moderators home, others to login or forbidden. */
export function FallbackNavigate() {
  const token = useAppSelector(selectAuthToken);
  const isModerator = useAppSelector(selectIsModerator);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (!isModerator) {
    return <Navigate to="/forbidden" replace />;
  }
  return <Navigate to="/" replace />;
}
