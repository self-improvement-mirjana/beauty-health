import type { MoneyDto } from '@/features/catalog/types';

export type CreateOrderBody = {
  recipientName: string;
  recipientPhone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postalCode: string;
  countryCode: string;
  paymentMethod?: string;
};

export type CreateOrderResponseDto = {
  orderId: number;
  status: string;
  total: MoneyDto;
  deliverySummaryText: string;
  paymentRedirectUrl?: string;
};

export type PaymentStatusDto = {
  orderId: number;
  orderStatus: string;
  paymentProvider: string;
  paymentStatus: string;
  externalStatus: string | null;
  paymentRef: string | null;
};

export type UserOrderSummaryDto = {
  id: number;
  status: string;
  total: MoneyDto;
  createdAt: string;
  lineCount: number;
};

export type BuyAgainItemDto = {
  variantId: number;
  productSlug: string;
  productName: string;
  lastOrderedAt: string;
  totalQuantityOrdered: number;
};

export type OrderLineDetailDto = {
  id: number;
  variantId: number;
  productSlug: string;
  productName: string;
  quantity: number;
  unitPrice: MoneyDto;
  lineTotal: MoneyDto;
};

export type OrderDetailDto = {
  id: number;
  createdAt: string;
  status: string;
  total: MoneyDto;
  deliverySummaryText: string;
  recipientName: string;
  recipientPhone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  postalCode: string;
  countryCode: string;
  paymentProvider: string;
  paymentStatus: string;
  lines: OrderLineDetailDto[];
};
