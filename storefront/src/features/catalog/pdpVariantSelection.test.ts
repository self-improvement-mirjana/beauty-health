import { describe, expect, it } from 'vitest';

import { initialVariantSelection, matchVariant, type VariantSelectionState } from '@/features/catalog/pdpVariantSelection';
import type { MoneyDto, ProductDetailDto } from '@/features/catalog/types';

const money = (n: string): MoneyDto => ({ amount: n, currency: 'RSD' });

function product(over: Partial<ProductDetailDto> = {}): ProductDetailDto {
  return {
    id: 1,
    brandId: 2,
    title: 'P',
    slug: 'p',
    primaryImageUrl: null,
    brandName: 'B',
    brandSlug: 'b',
    shortDescription: '',
    description: '',
    featured: false,
    active: true,
    categories: [],
    options: [],
    ratingAverage: null,
    reviewCount: 0,
    variants: [
      {
        id: 10,
        sku: 'S1',
        name: 'V1',
        moneyRegular: money('100'),
        moneySale: null,
        inStock: true,
        selectedOptions: [],
      },
    ],
    ...over,
  };
}

describe('initialVariantSelection', () => {
  it('auto-bira jedinu varijantu kada nema opcija', () => {
    const p = product();
    expect(initialVariantSelection(p)).toEqual({ selectedValueIds: [], bareVariantId: 10 });
  });

  it('ne bira varijantu kada ima više bez opcija', () => {
    const p = product({
      variants: [
        { id: 1, sku: 'a', name: 'A', moneyRegular: money('1'), moneySale: null, inStock: true, selectedOptions: [] },
        { id: 2, sku: 'b', name: 'B', moneyRegular: money('2'), moneySale: null, inStock: true, selectedOptions: [] },
      ],
    });
    expect(initialVariantSelection(p)).toEqual({ selectedValueIds: [], bareVariantId: null });
  });

  it('inicijalizuje null po svakoj opciji', () => {
    const p = product({
      options: [
        {
          name: 'Veličina',
          values: [
            { id: 101, value: 'M' },
            { id: 102, value: 'L' },
          ],
        },
      ],
      variants: [
        {
          id: 20,
          sku: 'x',
          name: 'M',
          moneyRegular: money('50'),
          moneySale: null,
          inStock: true,
          selectedOptions: [{ optionName: 'Veličina', value: 'M' }],
        },
        {
          id: 21,
          sku: 'y',
          name: 'L',
          moneyRegular: money('60'),
          moneySale: null,
          inStock: true,
          selectedOptions: [{ optionName: 'Veličina', value: 'L' }],
        },
      ],
    });
    expect(initialVariantSelection(p)).toEqual({ selectedValueIds: [null], bareVariantId: null });
  });
});

describe('matchVariant', () => {
  it('poklapa kombinaciju opcija', () => {
    const p = product({
      options: [
        {
          name: 'Veličina',
          values: [
            { id: 101, value: 'M' },
            { id: 102, value: 'L' },
          ],
        },
      ],
      variants: [
        {
          id: 20,
          sku: 'x',
          name: 'M',
          moneyRegular: money('50'),
          moneySale: null,
          inStock: true,
          selectedOptions: [{ optionName: 'Veličina', value: 'M' }],
        },
        {
          id: 21,
          sku: 'y',
          name: 'L',
          moneyRegular: money('60'),
          moneySale: null,
          inStock: false,
          selectedOptions: [{ optionName: 'Veličina', value: 'L' }],
        },
      ],
    });
    const state: VariantSelectionState = { selectedValueIds: [101], bareVariantId: null };
    expect(matchVariant(p, state)?.id).toBe(20);
    const stateL: VariantSelectionState = { selectedValueIds: [102], bareVariantId: null };
    expect(matchVariant(p, stateL)?.id).toBe(21);
  });

  it('vraća null za nemoguću kombinaciju', () => {
    const p = product({
      options: [
        {
          name: 'Veličina',
          values: [
            { id: 101, value: 'M' },
            { id: 102, value: 'L' },
          ],
        },
      ],
      variants: [
        {
          id: 20,
          sku: 'x',
          name: 'M',
          moneyRegular: money('50'),
          moneySale: null,
          inStock: true,
          selectedOptions: [{ optionName: 'Veličina', value: 'M' }],
        },
      ],
    });
    const state: VariantSelectionState = { selectedValueIds: [102], bareVariantId: null };
    expect(matchVariant(p, state)).toBeNull();
  });

  it('koristi bareVariantId kada nema opcija', () => {
    const p = product({
      variants: [
        { id: 1, sku: 'a', name: 'A', moneyRegular: money('1'), moneySale: null, inStock: true, selectedOptions: [] },
        { id: 2, sku: 'b', name: 'B', moneyRegular: money('2'), moneySale: null, inStock: true, selectedOptions: [] },
      ],
    });
    expect(matchVariant(p, { selectedValueIds: [], bareVariantId: 2 })?.sku).toBe('b');
  });
});
