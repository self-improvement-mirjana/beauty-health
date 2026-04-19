import { baseApi } from '@/features/api/baseApi';
import type { CatalogPingResponse } from '@/features/system/types';

const systemApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getCatalogPing: build.query<CatalogPingResponse, void>({
      query: () => '/catalog/ping',
    }),
  }),
});

export const { useGetCatalogPingQuery } = systemApi;
