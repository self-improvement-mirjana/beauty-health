import { baseApi } from '@/features/api/baseApi';
import type { AdminOrderDetail, AdminOrderSummary } from '@/features/orders/types';
import type { SpringPage } from '@/features/catalog/types';

export type AdminOrderListParams = {
  page?: number;
  size?: number;
  status?: string;
  from?: string;
  to?: string;
};

const orderApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    listAdminOrders: build.query<SpringPage<AdminOrderSummary>, AdminOrderListParams>({
      query: (p) => ({
        url: '/admin/orders',
        params: {
          page: p.page ?? 0,
          size: p.size ?? 20,
          ...(p.status?.trim() ? { status: p.status.trim().toUpperCase() } : {}),
          ...(p.from?.trim() ? { from: p.from.trim() } : {}),
          ...(p.to?.trim() ? { to: p.to.trim() } : {}),
        },
      }),
      providesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    getAdminOrder: build.query<AdminOrderDetail, number>({
      query: (id) => `/admin/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Order', id: String(id) }],
    }),
    patchAdminOrderStatus: build.mutation<void, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/orders/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id: String(id) },
      ],
    }),
  }),
});

export const {
  useListAdminOrdersQuery,
  useGetAdminOrderQuery,
  usePatchAdminOrderStatusMutation,
} = orderApi;
