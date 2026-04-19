import { describe, expect, it } from 'vitest';

import { formatRsd } from '@/lib/money';

describe('formatRsd', () => {
  it('formats API string with dot decimals', () => {
    expect(formatRsd('3600.00')).toBe('3.600,00 RSD');
  });

  it('formats integer number', () => {
    expect(formatRsd(3600)).toBe('3.600,00 RSD');
  });

  it('formats large amounts', () => {
    expect(formatRsd('1234567.89')).toBe('1.234.567,89 RSD');
  });

  it('returns dash for invalid', () => {
    expect(formatRsd('abc')).toBe('—');
    expect(formatRsd(Number.NaN)).toBe('—');
  });
});
