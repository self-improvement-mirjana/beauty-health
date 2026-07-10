import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query';

import { readAuthAccessToken, readGuestCartToken, setGuestCartToken } from '@/lib/authSession';

const GUEST_CART_HEADER = 'X-Guest-Cart-Token';

/**
 * U dev modu bez VITE_API_URL zahtevi idu na isti origin (`/api/v1/...`), a Vite ih prosleđuje na backend (vite.config proxy).
 * Tako se izbegava CORS i slučaj kada je u .env pogrešan host (localhost vs 127.0.0.1).
 */
function apiRoot(): string {
  const explicit = import.meta.env.VITE_API_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }
  if (import.meta.env.DEV) {
    return '';
  }
  return 'http://localhost:8080';
}

function persistGuestCartTokenFromResponse(response: Response | undefined) {
  if (!response) {
    return;
  }
  const token = response.headers.get(GUEST_CART_HEADER);
  if (token) {
    setGuestCartToken(token);
  }
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiRoot() ? `${apiRoot()}/api/v1` : '/api/v1',
  prepareHeaders: (headers) => {
    const guest = readGuestCartToken();
    if (guest) {
      headers.set(GUEST_CART_HEADER, guest);
    }
    const jwt = readAuthAccessToken();
    if (jwt) {
      headers.set('Authorization', `Bearer ${jwt}`);
    }
    return headers;
  },
});

const baseQueryWithGuestCart: BaseQueryFn<string | FetchArgs, unknown, unknown> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  persistGuestCartTokenFromResponse(result.meta?.response);
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  tagTypes: [
    'Cart',
    'CartSummary',
    'Reviews',
    'Product',
    'ProductList',
    'Orders',
    'AuthSession',
    'PreferenceTaxonomy',
    'UserPreferences',
    'UserPreferencesOverview',
  ],
  baseQuery: baseQueryWithGuestCart,
  endpoints: () => ({}),
});
