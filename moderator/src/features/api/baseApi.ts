import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { AuthResponseDto, AuthUser } from '@/features/auth/types';

function apiRoot(): string {
  const raw = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
  return raw.replace(/\/$/, '');
}

export const baseApi = createApi({
  reducerPath: 'api',
  tagTypes: [
    'Product',
    'Brand',
    'Category',
    'StoreLocation',
    'VariantInventory',
    'Order',
    'CmsPage',
    'BlogPost',
    'RetailLocation',
    'Review',
  ],
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiRoot()}/api/v1`,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  endpoints: (build) => ({
    login: build.mutation<AuthResponseDto, { email: string; password: string }>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    me: build.query<AuthUser, void>({
      query: () => '/auth/me',
    }),
  }),
});

export const { useLoginMutation, useLazyMeQuery } = baseApi;
