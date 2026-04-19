import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthUser } from './types';

const TOKEN_KEY = 'bh_moderator_token';
const USER_KEY = 'bh_moderator_user';

function readPersisted(): { token: string | null; user: AuthUser | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return { token, user: null };
    }
    const user = JSON.parse(raw) as AuthUser;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

const persisted = readPersisted();

type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

const initialState: AuthState = {
  token: persisted.token,
  user: persisted.user,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem(TOKEN_KEY, action.payload.token);
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
    },
    clearCredentials(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
});

export const { setCredentials, setUser, clearCredentials } = authSlice.actions;

type WithAuth = { auth: AuthState };

export const selectAuthToken = (s: WithAuth) => s.auth.token;
export const selectAuthUser = (s: WithAuth) => s.auth.user;
export const selectIsAuthenticated = (s: WithAuth) => !!s.auth.token;
export const selectIsModerator = (s: WithAuth) => !!s.auth.user?.roles?.includes('MODERATOR');
