import { describe, expect, it } from 'vitest';

import { mapApiDetailsToFieldErrors } from '@/lib/mapApiFieldErrors';

describe('mapApiDetailsToFieldErrors', () => {
  it('parsira Spring field greške', () => {
    expect(mapApiDetailsToFieldErrors(['email: must not be blank', 'password: too short'])).toEqual({
      email: 'must not be blank',
      password: 'too short',
    });
  });

  it('ignoriše linije bez separatora', () => {
    expect(mapApiDetailsToFieldErrors(['something'])).toEqual({});
  });
});
