import { configureStore } from '@reduxjs/toolkit';

import '@/features/api/authEndpoints';
import '@/features/api/cartEndpoints';
import '@/features/api/catalogEndpoints';
import '@/features/api/contentEndpoints';
import '@/features/api/orderEndpoints';
import '@/features/api/preferencesEndpoints';
import '@/features/api/systemEndpoints';
import { baseApi } from '@/features/api/baseApi';
import { authSlice, type AuthState } from '@/features/auth/authSlice';
import { readAuthSession } from '@/lib/authSession';

function buildAuthPreload(): AuthState | undefined {
  const restored = readAuthSession();
  if (!restored) {
    return undefined;
  }
  const t = restored.payload.accessToken.trim();
  if (!t) {
    return undefined;
  }
  return {
    accessToken: t,
    user: restored.payload.user,
    persistSession: restored.persistent,
  };
}

const authPreload = buildAuthPreload();

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [authSlice.name]: authSlice.reducer,
  },
  preloadedState: authPreload ? { auth: authPreload } : undefined,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
