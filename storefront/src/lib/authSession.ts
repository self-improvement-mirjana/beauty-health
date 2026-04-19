import type { UserDto } from '@/features/auth/types';

export const GUEST_CART_STORAGE_KEY = 'beautyhealth_guest_cart_token';
const AUTH_SESSION_KEY = 'beautyhealth_auth_session';

/** Čim se promeni JWT u session/localStorage, header i ostali delovi mogu da se osveže (isti tab). */
export const AUTH_SESSION_CHANGED_EVENT = 'beautyhealth-auth-session-changed';

export type AuthSessionPayload = {
  accessToken: string;
  user: UserDto;
};

export type RestoredAuthSession = {
  payload: AuthSessionPayload;
  persistent: boolean;
};

function notifyAuthSessionChanged() {
  try {
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export function subscribeAuthSessionChanged(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(AUTH_SESSION_CHANGED_EVENT, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, onStoreChange);
  };
}

/** Za useSyncExternalStore — vraća trenutni token ili prazan string. */
export function getBrowserAuthTokenSnapshot(): string {
  return readAuthAccessToken() ?? '';
}

function safeGetSession(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeGetLocal(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function normalizeUser(raw: Partial<UserDto> | undefined): UserDto | null {
  if (!raw || typeof raw.email !== 'string' || !raw.email.trim()) {
    return null;
  }
  return {
    id: typeof raw.id === 'number' ? raw.id : 0,
    email: raw.email.trim().toLowerCase(),
    fullName: typeof raw.fullName === 'string' && raw.fullName.trim() ? raw.fullName.trim() : 'Korisnik',
    roles: Array.isArray(raw.roles) ? raw.roles : [],
  };
}

function placeholderUser(): UserDto {
  return { id: 0, email: 'nalog@beauty-health.local', fullName: 'Nalog', roles: [] };
}

function sanitizeJwt(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') {
    return null;
  }
  const t = raw.trim();
  return t.length > 0 ? t : null;
}

function tryParseStrict(raw: string | null): AuthSessionPayload | null {
  if (!raw) {
    return null;
  }
  try {
    const v = JSON.parse(raw) as { accessToken?: unknown; user?: Partial<UserDto> };
    const accessToken = sanitizeJwt(typeof v.accessToken === 'string' ? v.accessToken : null);
    if (!accessToken) {
      return null;
    }
    const user = normalizeUser(v.user);
    if (!user) {
      return null;
    }
    return { accessToken, user };
  } catch {
    return null;
  }
}

function tryAccessTokenOnly(raw: string | null): string | null {
  if (!raw) {
    return null;
  }
  try {
    const v = JSON.parse(raw) as { accessToken?: unknown };
    return sanitizeJwt(typeof v.accessToken === 'string' ? v.accessToken : null);
  } catch {
    /* ignore */
  }
  return null;
}

export function readAuthSession(): RestoredAuthSession | null {
  const rawSession = safeGetSession(AUTH_SESSION_KEY);
  const rawLocal = safeGetLocal(AUTH_SESSION_KEY);

  const strictS = tryParseStrict(rawSession);
  if (strictS) {
    return { payload: strictS, persistent: false };
  }
  const strictL = tryParseStrict(rawLocal);
  if (strictL) {
    return { payload: strictL, persistent: true };
  }

  const tokS = tryAccessTokenOnly(rawSession);
  if (tokS) {
    return { payload: { accessToken: tokS, user: placeholderUser() }, persistent: false };
  }
  const tokL = tryAccessTokenOnly(rawLocal);
  if (tokL) {
    return { payload: { accessToken: tokL, user: placeholderUser() }, persistent: true };
  }
  return null;
}

export function writeAuthSession(payload: AuthSessionPayload, options?: { persistent?: boolean }) {
  const persistent = options?.persistent === true;
  try {
    if (persistent) {
      try {
        sessionStorage.removeItem(AUTH_SESSION_KEY);
      } catch {
        /* ignore */
      }
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(payload));
    } else {
      try {
        localStorage.removeItem(AUTH_SESSION_KEY);
      } catch {
        /* ignore */
      }
      sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(payload));
    }
    notifyAuthSessionChanged();
  } catch {
    /* ignore */
  }
}

export function clearAuthSession() {
  try {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    /* ignore */
  }
  notifyAuthSessionChanged();
}

export function readGuestCartToken(): string | null {
  return safeGetSession(GUEST_CART_STORAGE_KEY);
}

export function setGuestCartToken(token: string) {
  try {
    sessionStorage.setItem(GUEST_CART_STORAGE_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearGuestCartToken() {
  try {
    sessionStorage.removeItem(GUEST_CART_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function readAuthAccessToken(): string | null {
  return readAuthSession()?.payload.accessToken ?? null;
}

/** Posle odjave: ukloni JWT i gost korpu (stari gost token posle merge-a može bacati 404). */
export function clearClientAuthAndGuestCart() {
  clearAuthSession();
  clearGuestCartToken();
}
