import { describe, expect, it } from 'vitest';

import { allowedNextStatuses, parseOrderStatus } from '@/lib/orderStatusTransitions';

describe('orderStatusTransitions', () => {
  it('parses known statuses', () => {
    expect(parseOrderStatus('new')).toBe('NEW');
    expect(parseOrderStatus('Cancelled')).toBe('CANCELLED');
    expect(parseOrderStatus('x')).toBeNull();
  });

  it('matches backend transition matrix', () => {
    expect(allowedNextStatuses('NEW')).toEqual(['CONFIRMED', 'CANCELLED']);
    expect(allowedNextStatuses('CONFIRMED')).toEqual(['SHIPPED', 'CANCELLED']);
    expect(allowedNextStatuses('SHIPPED')).toEqual(['COMPLETED']);
    expect(allowedNextStatuses('COMPLETED')).toEqual([]);
    expect(allowedNextStatuses('CANCELLED')).toEqual([]);
  });
});
