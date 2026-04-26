import { baseApi } from '@/features/api/baseApi';
import type { SpringPage } from '@/features/catalog/types';
import type {
  BuyAgainItemDto,
  CreateOrderBody,
  CreateOrderResponseDto,
  OrderDetailDto,
  PaymentStatusDto,
  UserOrderSummaryDto,
} from '@/features/order/types';

const orderApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    createOrder: build.mutation<CreateOrderResponseDto, CreateOrderBody>({
      query: (body) => ({
        url: '/orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Cart', id: 'LIST' },
        { type: 'CartSummary', id: 'CURRENT' },
        { type: 'Orders', id: 'LIST' },
      ],
    }),
    listMyOrders: build.query<SpringPage<UserOrderSummaryDto>, { page?: number; size?: number } | void>({
      query: (args) => {
        const page = args?.page ?? 0;
        const size = args?.size ?? 20;
        return `/orders?page=${page}&size=${size}&sort=createdAt,desc&sort=id,desc`;
      },
      providesTags: [{ type: 'Orders', id: 'LIST' }],
    }),
    buyAgainItems: build.query<BuyAgainItemDto[], { limit?: number } | void>({
      query: (args) => {
        const limit = args?.limit ?? 50;
        return `/orders/buy-again?limit=${limit}`;
      },
      providesTags: [{ type: 'Orders', id: 'BUY_AGAIN' }],
    }),
    getMyOrder: build.query<OrderDetailDto, number>({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
    }),
    getPaymentStatus: build.query<PaymentStatusDto, number>({
      query: (orderId) => `/orders/${orderId}/payment`,
      providesTags: (_r, _e, id) => [{ type: 'Orders', id: `payment-${id}` }],
    }),
  }),
});

export const { useCreateOrderMutation, useListMyOrdersQuery, useBuyAgainItemsQuery, useGetMyOrderQuery, useGetPaymentStatusQuery } = orderApi;
