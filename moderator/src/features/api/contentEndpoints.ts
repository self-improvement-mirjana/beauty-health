import { baseApi } from '@/features/api/baseApi';
import type {
  AdminBlogPostDetail,
  AdminBlogPostSummary,
  AdminBlogPostUpsertBody,
  AdminCmsPageDetail,
  AdminCmsPageSummary,
  AdminCmsPageUpsertBody,
  AdminRetailLocation,
  AdminRetailLocationUpsertBody,
} from '@/features/content/types';

const listTags = [{ type: 'CmsPage' as const, id: 'LIST' }];
const blogListTags = [{ type: 'BlogPost' as const, id: 'LIST' }];
const retailListTags = [{ type: 'RetailLocation' as const, id: 'LIST' }];

const contentApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    listCmsPages: build.query<AdminCmsPageSummary[], void>({
      query: () => '/admin/cms-pages',
      providesTags: listTags,
    }),
    getCmsPage: build.query<AdminCmsPageDetail, number>({
      query: (id) => `/admin/cms-pages/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'CmsPage', id: String(id) }],
    }),
    createCmsPage: build.mutation<AdminCmsPageSummary, AdminCmsPageUpsertBody>({
      query: (body) => ({ url: '/admin/cms-pages', method: 'POST', body }),
      invalidatesTags: listTags,
    }),
    updateCmsPage: build.mutation<AdminCmsPageSummary, { id: number; body: AdminCmsPageUpsertBody }>({
      query: ({ id, body }) => ({ url: `/admin/cms-pages/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'CmsPage', id: 'LIST' },
        { type: 'CmsPage', id: String(id) },
      ],
    }),
    deleteCmsPage: build.mutation<void, number>({
      query: (id) => ({ url: `/admin/cms-pages/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'CmsPage', id: 'LIST' },
        { type: 'CmsPage', id: String(id) },
      ],
    }),

    listRetailLocations: build.query<AdminRetailLocation[], void>({
      query: () => '/admin/retail-locations',
      providesTags: retailListTags,
    }),
    createRetailLocation: build.mutation<AdminRetailLocation, AdminRetailLocationUpsertBody>({
      query: (body) => ({ url: '/admin/retail-locations', method: 'POST', body }),
      invalidatesTags: retailListTags,
    }),
    updateRetailLocation: build.mutation<
      AdminRetailLocation,
      { id: number; body: AdminRetailLocationUpsertBody }
    >({
      query: ({ id, body }) => ({ url: `/admin/retail-locations/${id}`, method: 'PUT', body }),
      invalidatesTags: retailListTags,
    }),
    deleteRetailLocation: build.mutation<void, number>({
      query: (id) => ({ url: `/admin/retail-locations/${id}`, method: 'DELETE' }),
      invalidatesTags: retailListTags,
    }),

    listBlogPosts: build.query<AdminBlogPostSummary[], void>({
      query: () => '/admin/blog-posts',
      providesTags: blogListTags,
    }),
    getBlogPost: build.query<AdminBlogPostDetail, number>({
      query: (id) => `/admin/blog-posts/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'BlogPost', id: String(id) }],
    }),
    createBlogPost: build.mutation<AdminBlogPostSummary, AdminBlogPostUpsertBody>({
      query: (body) => ({ url: '/admin/blog-posts', method: 'POST', body }),
      invalidatesTags: blogListTags,
    }),
    updateBlogPost: build.mutation<AdminBlogPostSummary, { id: number; body: AdminBlogPostUpsertBody }>({
      query: ({ id, body }) => ({ url: `/admin/blog-posts/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'BlogPost', id: 'LIST' },
        { type: 'BlogPost', id: String(id) },
      ],
    }),
    deleteBlogPost: build.mutation<void, number>({
      query: (id) => ({ url: `/admin/blog-posts/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'BlogPost', id: 'LIST' },
        { type: 'BlogPost', id: String(id) },
      ],
    }),
  }),
});

export const {
  useListCmsPagesQuery,
  useGetCmsPageQuery,
  useCreateCmsPageMutation,
  useUpdateCmsPageMutation,
  useDeleteCmsPageMutation,
  useListRetailLocationsQuery,
  useCreateRetailLocationMutation,
  useUpdateRetailLocationMutation,
  useDeleteRetailLocationMutation,
  useListBlogPostsQuery,
  useGetBlogPostQuery,
  useCreateBlogPostMutation,
  useUpdateBlogPostMutation,
  useDeleteBlogPostMutation,
} = contentApi;
