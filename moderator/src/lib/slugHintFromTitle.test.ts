import { describe, expect, it } from 'vitest';

import { slugHintFromTitle } from '@/lib/slugHintFromTitle';

describe('slugHintFromTitle', () => {
  it('ASCII title', () => {
    expect(slugHintFromTitle('Hello World', 128)).toBe('hello-world');
  });

  it('respects max length', () => {
    expect(slugHintFromTitle('abcdef', 3)).toBe('abc');
  });
});
