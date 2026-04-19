import type { MoneyDto } from '@/features/catalog/types';

export type OrderStatusCode = 'NEW' | 'CONFIRMED' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export type AdminOrderSummary = {
  id: number;
  status: string;
  createdAt: string;
  customerUserId: number;
  customerEmail: string;
  total: MoneyDto;
};

export type OrderLineDto = {
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
  lines: OrderLineDto[];
};

export type AdminOrderDetail = {
  customerUserId: number;
  customerEmail: string;
  order: OrderDetailDto;
};
