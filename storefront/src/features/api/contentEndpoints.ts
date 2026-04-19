import { baseApi } from '@/features/api/baseApi';
import type { CmsPageDto, RetailLocationDto } from '@/features/content/types';

const contentApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    listRetailLocations: build.query<RetailLocationDto[], void>({
      query: () => '/locations',
    }),
    getCmsPage: build.query<CmsPageDto, string>({
      query: (slug) => `/pages/${encodeURIComponent(slug)}`,
    }),
  }),
});

export const { useListRetailLocationsQuery, useGetCmsPageQuery } = contentApi;
