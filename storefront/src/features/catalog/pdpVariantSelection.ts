import type { ProductDetailDto, ProductVariantDetailDto } from '@/features/catalog/types';

export type VariantSelectionState = {
  /** Po jedan izabrani `ProductOptionValueDto.id` po opciji (isti redosled kao `product.options`). */
  selectedValueIds: (number | null)[];
  /** Kada proizvod nema grupe opcija, a ima više varijanti — eksplicitan izbor varijante. */
  bareVariantId: number | null;
};

export function initialVariantSelection(product: ProductDetailDto): VariantSelectionState {
  if (product.options.length === 0) {
    return {
      selectedValueIds: [],
      bareVariantId: product.variants.length === 1 ? product.variants[0].id : null,
    };
  }
  return {
    selectedValueIds: product.options.map(() => null),
    bareVariantId: null,
  };
}

export function matchVariant(
  product: ProductDetailDto,
  state: VariantSelectionState,
): ProductVariantDetailDto | null {
  const { options, variants } = product;
  if (variants.length === 0) {
    return null;
  }

  if (options.length === 0) {
    if (variants.length === 1) {
      return variants[0];
    }
    if (state.bareVariantId == null) {
      return null;
    }
    return variants.find((v) => v.id === state.bareVariantId) ?? null;
  }

  const { selectedValueIds } = state;
  if (selectedValueIds.length !== options.length) {
    return null;
  }
  if (selectedValueIds.some((id) => id == null)) {
    return null;
  }

  for (const v of variants) {
    let ok = true;
    for (let oi = 0; oi < options.length; oi++) {
      const opt = options[oi];
      const selId = selectedValueIds[oi]!;
      const valRec = opt.values.find((x) => x.id === selId);
      if (!valRec) {
        ok = false;
        break;
      }
      const matched = v.selectedOptions.some((s) => s.optionName === opt.name && s.value === valRec.value);
      if (!matched) {
        ok = false;
        break;
      }
    }
    if (ok) {
      return v;
    }
  }
  return null;
}
