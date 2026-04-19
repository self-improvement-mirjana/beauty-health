import type { OrderStatusCode } from '@/features/orders/types';

const ALL: OrderStatusCode[] = ['NEW', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

const LABELS: Record<OrderStatusCode, string> = {
  NEW: 'Nova',
  CONFIRMED: 'Potvrđena',
  SHIPPED: 'Poslata',
  COMPLETED: 'Završena',
  CANCELLED: 'Otkazana',
};

export function parseOrderStatus(raw: string): OrderStatusCode | null {
  const u = raw.trim().toUpperCase();
  return ALL.includes(u as OrderStatusCode) ? (u as OrderStatusCode) : null;
}

export function orderStatusLabel(raw: string): string {
  const p = parseOrderStatus(raw);
  return p ? LABELS[p] : raw;
}

/**
 * Dozvoljeni sledeći statusi (bez trenutnog), usklađeno sa {@code OrderStatusTransitions} na backendu.
 */
export function allowedNextStatuses(from: OrderStatusCode): OrderStatusCode[] {
  switch (from) {
    case 'NEW':
      return ['CONFIRMED', 'CANCELLED'];
    case 'CONFIRMED':
      return ['SHIPPED', 'CANCELLED'];
    case 'SHIPPED':
      return ['COMPLETED'];
    case 'CANCELLED':
    case 'COMPLETED':
      return [];
    default:
      return [];
  }
}

export function selectableOrderStatuses(current: OrderStatusCode): OrderStatusCode[] {
  const next = allowedNextStatuses(current);
  return [current, ...next];
}
