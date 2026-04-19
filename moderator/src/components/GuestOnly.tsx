import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAppSelector } from '@/app/hooks';
import { selectAuthToken, selectIsModerator } from '@/features/auth/authSlice';

type Props = { children: ReactNode };

/** Login route: moderators go to app; logged-in customers go to forbidden. */
export function GuestOnly({ children }: Props) {
  const token = useAppSelector(selectAuthToken);
  const isModerator = useAppSelector(selectIsModerator);

  if (token && isModerator) {
    return <Navigate to="/" replace />;
  }
  if (token && !isModerator) {
    return <Navigate to="/forbidden" replace />;
  }
  return <>{children}</>;
}
