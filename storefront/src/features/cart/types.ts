import type { MoneyDto } from '@/features/catalog/types';

export type CartItemDto = {
  id: number;
  variantId: number;
  productSlug: string;
  productName: string;
  variantLabel: string;
  sku: string;
  quantity: number;
  unitPrice: MoneyDto;
  lineTotal: MoneyDto;
};

export type CartResponseDto = {
  items: CartItemDto[];
  lineCount: number;
  totalQuantity: number;
  empty: boolean;
  subtotal: MoneyDto;
};

export type CartSummaryDto = {
  lineCount: number;
  totalQuantity: number;
  empty: boolean;
  subtotal: MoneyDto;
};

export type AddCartItemBody = {
  variantId: number;
  quantity: number;
};

export type PatchCartItemBody = {
  quantity: number;
};
