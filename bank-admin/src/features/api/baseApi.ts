import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = import.meta.env.VITE_API_BASE || 'http://localhost:8090';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('bank_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'Clients',
    'Cards',
    'Merchants',
    'Credentials',
    'Transactions',
    'Audit',
    'Dashboard',
    'Hosted',
  ],
  endpoints: () => ({}),
});
