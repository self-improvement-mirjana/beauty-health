import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthSessionPayload } from '@/lib/authSession';
import { clearAuthSession, writeAuthSession } from '@/lib/authSession';
import type { UserDto } from '@/features/auth/types';

export type SetCredentialsPayload = AuthSessionPayload & { rememberMe?: boolean };

export type AuthState = {
  accessToken: string | null;
  user: UserDto | null;
  /** Kada je true, sesija je u localStorage i ostaje posle zatvaranja taba. */
  persistSession: boolean;
};

export const authInitialState: AuthState = {
  accessToken: null,
  user: null,
  persistSession: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: {
    setCredentials(state, action: PayloadAction<SetCredentialsPayload>) {
      const { rememberMe, ...payload } = action.payload;
      const persistent = rememberMe === true;
      const accessToken = payload.accessToken.trim();
      state.accessToken = accessToken.length > 0 ? accessToken : null;
      state.user = payload.user;
      state.persistSession = persistent;
      if (state.accessToken) {
        writeAuthSession({ accessToken: state.accessToken, user: payload.user }, { persistent });
      }
    },
    setUser(state, action: PayloadAction<UserDto>) {
      state.user = action.payload;
      if (state.accessToken) {
        writeAuthSession(
          { accessToken: state.accessToken, user: action.payload },
          { persistent: state.persistSession },
        );
      }
    },
    clearCredentials(state) {
      state.accessToken = null;
      state.user = null;
      state.persistSession = false;
      clearAuthSession();
    },
  },
});

export const { setCredentials, setUser, clearCredentials } = authSlice.actions;

export function selectAccessToken(state: { auth: AuthState }) {
  return state.auth.accessToken;
}

export function selectAuthUser(state: { auth: AuthState }) {
  return state.auth.user;
}

export function selectIsAuthenticated(state: { auth: AuthState }) {
  return state.auth.accessToken != null;
}
