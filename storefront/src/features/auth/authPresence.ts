import type { UserDto } from '@/features/auth/types';
import { readAuthAccessToken, readAuthSession } from '@/lib/authSession';

/**
 * Isti izvor kao `Authorization` u `baseApi` — ako ovde postoji token, korisnik je prijavljen
 * čak i kada Redux još nije usklađen posle učitavanja stranice.
 */
export function hasBrowserAuthToken(): boolean {
  return readAuthAccessToken() != null;
}

export function browserAuthUserSnapshot(): UserDto | null {
  return readAuthSession()?.payload.user ?? null;
}

export function isLoggedInForUi(reduxAccessToken: string | null | undefined): boolean {
  return Boolean(reduxAccessToken || hasBrowserAuthToken());
}

export function menuAuthUser(reduxUser: UserDto | null | undefined): UserDto | null {
  return reduxUser ?? browserAuthUserSnapshot();
}
