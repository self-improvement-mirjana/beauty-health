import { describe, expect, it } from 'vitest';

import { chunkCategoryChildren } from '@/lib/chunkCategoryChildren';

describe('chunkCategoryChildren', () => {
  it('deli decu u kolone po modulu', () => {
    const node = {
      id: 1,
      name: 'Root',
      slug: 'root',
      children: [
        { id: 10, name: 'A', slug: 'a', children: [] },
        { id: 11, name: 'B', slug: 'b', children: [] },
        { id: 12, name: 'C', slug: 'c', children: [] },
        { id: 13, name: 'D', slug: 'd', children: [] },
      ],
    };
    const cols = chunkCategoryChildren(node, 3);
    expect(cols.map((c) => c.map((x) => x.slug))).toEqual([
      ['a', 'd'],
      ['b'],
      ['c'],
    ]);
  });
});
