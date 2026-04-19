import { useAppDispatch } from '@/app/hooks';
import { useLogoutMutation } from '@/features/api/authEndpoints';
import { baseApi } from '@/features/api/baseApi';
import { clearCredentials } from '@/features/auth/authSlice';
import { clearGuestCartToken } from '@/lib/authSession';

export function useLogoutAction() {
  const dispatch = useAppDispatch();
  const [logoutApi] = useLogoutMutation();

  return async function logout() {
    try {
      await logoutApi().unwrap();
    } catch {
      /* 401 ili mreža — ipak očisti klijent */
    }
    dispatch(clearCredentials());
    clearGuestCartToken();
    dispatch(
      baseApi.util.invalidateTags([
        { type: 'Cart', id: 'LIST' },
        { type: 'CartSummary', id: 'CURRENT' },
      ]),
    );
  };
}
