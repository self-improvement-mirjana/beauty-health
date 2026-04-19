export type MoneyDto = { amount: string; currency: string };

export type ProductCard = {
  title: string;
  slug: string;
  brandName: string;
  brandSlug: string;
  moneyRegular: MoneyDto;
  moneySale: MoneyDto | null;
  ctaType: string;
  inStock: boolean;
  chooseOptionsRequired: boolean;
  primaryVariantId: number | null;
};

export type SpringPage<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

export type ProductCategoryLink = { id: number; name: string; slug: string };

export type ProductVariantDetail = {
  id: number;
  sku: string;
  name: string | null;
  moneyRegular: MoneyDto;
  moneySale: MoneyDto | null;
  inStock: boolean;
  selectedOptions: { optionName: string; value: string }[];
};

export type ProductDetail = {
  id: number;
  brandId: number;
  title: string;
  slug: string;
  brandName: string;
  brandSlug: string;
  shortDescription: string | null;
  description: string | null;
  featured: boolean;
  active: boolean;
  categories: ProductCategoryLink[];
  options: unknown[];
  variants: ProductVariantDetail[];
};

export type AdminBrand = { id: number; name: string; slug: string };

export type BrandUpsertBody = { name: string; slug: string };

export type CategoryUpsertBody = {
  name: string;
  slug: string;
  description: string | null;
  parentCategoryId: number | null;
  sortOrder: number;
  active: boolean;
};

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  parentCategoryId: number | null;
  sortOrder: number;
  active: boolean;
  description: string | null;
};

export type AdminStoreLocation = { id: number; name: string; slug: string };

export type AdminInventoryLine = {
  storeLocationId: number;
  storeLocationName: string;
  quantity: number;
};

export type AdminProductCreated = { id: number; slug: string };

export type CreateProductBody = {
  brandId: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  featured: boolean;
  active: boolean;
  categoryIds: number[];
  variants: {
    sku: string;
    name: string | null;
    regularPrice: number;
    salePrice: number | null;
    defaultVariant: boolean;
    inventory: { storeLocationId: number; quantity: number }[];
  }[];
};

export type UpdateProductBody = {
  brandId: number;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  featured: boolean;
  active: boolean;
  categoryIds: number[];
};

export type ApiErrorBody = {
  code: string;
  message: string;
  details: string[];
};
