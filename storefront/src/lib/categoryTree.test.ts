import { describe, expect, it } from 'vitest';

import type { CategoryTreeNodeDto } from '@/features/catalog/types';
import { findCategoryBySlug, getCategoryPath } from '@/lib/categoryTree';

const tree: CategoryTreeNodeDto[] = [
  {
    id: 1,
    name: 'Lice',
    slug: 'lice',
    children: [
      { id: 2, name: 'Čišćenje', slug: 'ciscenje', children: [] },
    ],
  },
];

describe('findCategoryBySlug', () => {
  it('finds root', () => {
    expect(findCategoryBySlug(tree, 'lice')?.name).toBe('Lice');
  });

  it('finds nested', () => {
    expect(findCategoryBySlug(tree, 'ciscenje')?.name).toBe('Čišćenje');
  });

  it('returns null when missing', () => {
    expect(findCategoryBySlug(tree, 'x')).toBeNull();
  });
});

describe('getCategoryPath', () => {
  it('returns single node for root category', () => {
    expect(getCategoryPath(tree, 'lice').map((n) => n.slug)).toEqual(['lice']);
  });

  it('returns chain for nested category', () => {
    expect(getCategoryPath(tree, 'ciscenje').map((n) => n.slug)).toEqual(['lice', 'ciscenje']);
  });

  it('returns empty when missing', () => {
    expect(getCategoryPath(tree, 'x')).toEqual([]);
  });
});
