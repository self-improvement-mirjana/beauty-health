import { baseApi } from '@/features/api/baseApi';
import type { SpringPage } from '@/features/catalog/types';
import type { AdminReviewRow, AdminUserSupport } from '@/features/support/types';

export type AdminReviewListParams = {
  page?: number;
  size?: number;
  slug?: string;
  /** `undefined` = svi; inače filter po odobrenju */
  approved?: boolean;
};

const supportApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    listAdminReviews: build.query<SpringPage<AdminReviewRow>, AdminReviewListParams>({
      query: (p) => ({
        url: '/admin/reviews',
        params: {
          page: p.page ?? 0,
          size: p.size ?? 20,
          ...(p.slug?.trim() ? { slug: p.slug.trim() } : {}),
          ...(p.approved !== undefined ? { approved: p.approved } : {}),
        },
      }),
      providesTags: [{ type: 'Review', id: 'LIST' }],
    }),
    patchReviewApproval: build.mutation<AdminReviewRow, { id: number; approved: boolean }>({
      query: ({ id, approved }) => ({
        url: `/admin/reviews/${id}/approval`,
        method: 'PATCH',
        body: { approved },
      }),
      invalidatesTags: [{ type: 'Review', id: 'LIST' }],
    }),
    getAdminUserByEmail: build.query<AdminUserSupport, string>({
      query: (email) => ({
        url: '/admin/users',
        params: { email: email.trim() },
      }),
    }),
    getAdminUserById: build.query<AdminUserSupport, number>({
      query: (id) => `/admin/users/${id}`,
    }),
  }),
});

export const {
  useListAdminReviewsQuery,
  usePatchReviewApprovalMutation,
  useLazyGetAdminUserByEmailQuery,
  useLazyGetAdminUserByIdQuery,
} = supportApi;
