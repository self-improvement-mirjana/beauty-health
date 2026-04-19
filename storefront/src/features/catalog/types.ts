export type MoneyDto = { amount: string; currency: string };

/** Kartica proizvoda (B04 `ProductCardResponse`). */
export type ProductCardDto = {
  title: string;
  slug: string;
  brandName: string;
  brandSlug: string;
  primaryImageUrl: string | null;
  moneyRegular: MoneyDto;
  moneySale: MoneyDto | null;
  ctaType: 'ADD_TO_CART' | 'CHOOSE_OPTIONS' | 'OUT_OF_STOCK';
  inStock: boolean;
  chooseOptionsRequired: boolean;
  primaryVariantId: number | null;
  /** Prosek odobrenih recenzija 1–5; izostavljeno na starijem API-ju */
  ratingAverage?: number | null;
  reviewCount?: number;
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

export type BrandSummaryDto = {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  /** Broj aktivnih proizvoda brenda (listing). */
  productCount?: number;
};

export type CategoryTreeNodeDto = {
  id: number;
  name: string;
  slug: string;
  children: CategoryTreeNodeDto[];
};

/** GET /categories/{parentSlug}/child-product-counts */
export type CategoryChildProductCountDto = {
  slug: string;
  productCount: number;
};

export type ProductCategoryLinkDto = {
  id: number;
  name: string;
  slug: string;
};

export type SelectedOptionValueDto = {
  optionName: string;
  value: string;
};

export type ProductOptionValueDto = {
  id: number;
  value: string;
};

export type ProductOptionDto = {
  name: string;
  values: ProductOptionValueDto[];
};

export type ProductVariantDetailDto = {
  id: number;
  sku: string;
  name: string;
  moneyRegular: MoneyDto;
  moneySale: MoneyDto | null;
  inStock: boolean;
  selectedOptions: SelectedOptionValueDto[];
};

/** Javni PDP (`GET /api/v1/products/{slug}`). */
export type ProductDetailDto = {
  id: number;
  brandId: number;
  title: string;
  slug: string;
  primaryImageUrl: string | null;
  brandName: string;
  brandSlug: string;
  shortDescription: string;
  description: string;
  featured: boolean;
  active: boolean;
  categories: ProductCategoryLinkDto[];
  options: ProductOptionDto[];
  variants: ProductVariantDetailDto[];
  ratingAverage?: number | null;
  reviewCount?: number;
};

export type ProductReviewDto = {
  id: number;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
};

/** Telo `POST /api/v1/products/{slug}/reviews` (B08). */
export type CreateProductReviewBody = {
  authorName: string;
  authorEmail: string;
  rating: number;
  body: string;
  publicEmail?: boolean;
};
