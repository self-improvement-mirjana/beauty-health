import { configureStore } from '@reduxjs/toolkit';

import '@/features/api/analyticsEndpoints';
import '@/features/api/catalogEndpoints';
import '@/features/api/contentEndpoints';
import '@/features/api/orderEndpoints';
import '@/features/api/supportEndpoints';
import { baseApi } from '@/features/api/baseApi';
import { authSlice } from '@/features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
