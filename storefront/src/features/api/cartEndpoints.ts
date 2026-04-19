import { baseApi } from '@/features/api/baseApi';
import type { AddCartItemBody, CartResponseDto, CartSummaryDto, PatchCartItemBody } from '@/features/cart/types';
import { clearGuestCartToken } from '@/lib/authSession';

const cartApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getCart: build.query<CartResponseDto, void>({
      query: () => '/cart',
      providesTags: [{ type: 'Cart', id: 'LIST' }],
    }),
    getCartSummary: build.query<CartSummaryDto, void>({
      query: () => '/cart/summary',
      providesTags: [{ type: 'CartSummary', id: 'CURRENT' }],
    }),
    addCartItem: build.mutation<CartResponseDto, AddCartItemBody>({
      query: (body) => ({
        url: '/cart/items',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Cart', id: 'LIST' },
        { type: 'CartSummary', id: 'CURRENT' },
      ],
    }),
    patchCartItem: build.mutation<CartResponseDto, { itemId: number; body: PatchCartItemBody }>({
      query: ({ itemId, body }) => ({
        url: `/cart/items/${itemId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [
        { type: 'Cart', id: 'LIST' },
        { type: 'CartSummary', id: 'CURRENT' },
      ],
    }),
    deleteCartItem: build.mutation<CartResponseDto, number>({
      query: (itemId) => ({
        url: `/cart/items/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Cart', id: 'LIST' },
        { type: 'CartSummary', id: 'CURRENT' },
      ],
    }),
    mergeCart: build.mutation<CartResponseDto, { guestCartToken: string }>({
      query: (body) => ({
        url: '/cart/merge',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'Cart', id: 'LIST' },
        { type: 'CartSummary', id: 'CURRENT' },
      ],
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          clearGuestCartToken();
        } catch {
          /* ne briši gost token ako merge nije uspeo */
        }
      },
    }),
  }),
});

export const {
  useGetCartQuery,
  useGetCartSummaryQuery,
  useAddCartItemMutation,
  usePatchCartItemMutation,
  useDeleteCartItemMutation,
  useMergeCartMutation,
} = cartApi;
