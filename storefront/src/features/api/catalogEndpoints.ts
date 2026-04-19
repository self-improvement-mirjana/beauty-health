import { baseApi } from '@/features/api/baseApi';
import { toApiSortParam } from '@/features/catalog/listingSort';
import type {
  BrandSummaryDto,
  CategoryChildProductCountDto,
  CategoryTreeNodeDto,
  ProductCardDto,
  CreateProductReviewBody,
  ProductDetailDto,
  ProductReviewDto,
  SpringPage,
} from '@/features/catalog/types';

export type ListProductsParams = {
  page?: number;
  size?: number;
  categorySlug?: string;
  /** Više vrednosti (OR); backend kombinuje sa categorySlug pomoću AND. */
  categoryFacet?: string[];
  brandSlug?: string;
  featured?: boolean;
  /** Minimalan prosečan rejting (1–5), samo proizvodi sa odobrenim recenzijama. */
  minRating?: number;
  q?: string;
  /** Spring format, npr. `id,desc`, `price,asc`, `name,asc` */
  sort?: string;
  /** Više slug-ova: kartice samo za listu želja (backend čuva red kao „nedavno dodato“ kada nema sort). */
  slugs?: string[];
};

export type SearchProductsParams = {
  q: string;
  page?: number;
  size?: number;
  categorySlug?: string;
  categoryFacet?: string[];
  brandSlug?: string;
  minRating?: number;
  sort?: string;
};

export type BrandProductsParams = {
  slug: string;
  page?: number;
  size?: number;
};

function facetCacheKey(slugs: string[] | undefined): string {
  if (!slugs?.length) {
    return '';
  }
  return [...slugs]
    .map((s) => s.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
    .join('\u001f');
}

const catalogApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    listProducts: build.query<SpringPage<ProductCardDto>, ListProductsParams>({
      query: (p) => {
        const usp = new URLSearchParams();
        usp.set('page', String(p.page ?? 0));
        usp.set('size', String(p.size ?? 20));
        if (p.categorySlug) {
          usp.set('categorySlug', p.categorySlug);
        }
        if (p.categoryFacet?.length) {
          for (const s of p.categoryFacet) {
            const t = s.trim();
            if (t) {
              /* Ponovljeni categoryFacet bez zareza u vrednosti — servlet/Tomcat pouzdano popunjava parametre. */
              usp.append('categoryFacet', t);
            }
          }
        }
        if (p.brandSlug) {
          usp.set('brandSlug', p.brandSlug);
        }
        if (p.minRating != null && p.minRating >= 1 && p.minRating <= 5) {
          usp.set('minRating', String(p.minRating));
        }
        if (p.featured !== undefined) {
          usp.set('featured', String(p.featured));
        }
        if (p.q?.trim()) {
          usp.set('q', p.q.trim());
        }
        const apiSort = toApiSortParam(p.sort);
        if (apiSort) {
          usp.set('sort', apiSort);
        }
        if (p.slugs?.length) {
          for (const s of p.slugs) {
            const t = s.trim();
            if (t) {
              usp.append('slugs', t);
            }
          }
        }
        const qs = usp.toString();
        return { url: `/products${qs ? `?${qs}` : ''}` };
      },
      /** Eksplicitan ključ (facet niz + slugs) da se listing nikad ne pomeša sa drugim filterima u kešu. */
      serializeQueryArgs: ({ queryArgs }) => {
        const { categoryFacet, slugs, ...rest } = queryArgs;
        const fk = facetCacheKey(categoryFacet);
        const sk = facetCacheKey(slugs);
        return `listProducts::${JSON.stringify(rest)}::facets:${fk}::slugs:${sk}`;
      },
      providesTags: ['ProductList'],
    }),
    /**
     * Samo lista želja: isti URL kao listProducts sa slugs, ali poseban keš ključ da se nikad ne pomeša
     * sa listingom prodavnice (inače se ponekad prikaže ceo katalog).
     */
    wishlistProductCards: build.query<SpringPage<ProductCardDto>, { slugs: string[]; sort?: string }>({
      query: ({ slugs, sort }) => {
        const usp = new URLSearchParams();
        usp.set('page', '0');
        usp.set('size', '200');
        for (const s of slugs) {
          const t = s.trim();
          if (t) {
            usp.append('slugs', t);
          }
        }
        const apiSort = toApiSortParam(sort);
        if (apiSort) {
          usp.set('sort', apiSort);
        }
        return { url: `/products?${usp.toString()}` };
      },
      serializeQueryArgs: ({ queryArgs }) => {
        const key = [...queryArgs.slugs].map((s) => s.trim()).filter(Boolean).join('\u001f');
        return `wishlistProductCards::${key}::${queryArgs.sort ?? ''}`;
      },
    }),
    searchProducts: build.query<SpringPage<ProductCardDto>, SearchProductsParams>({
      query: (p) => {
        const usp = new URLSearchParams();
        usp.set('q', p.q.trim());
        usp.set('page', String(p.page ?? 0));
        usp.set('size', String(p.size ?? 20));
        if (p.categorySlug) {
          usp.set('categorySlug', p.categorySlug);
        }
        if (p.categoryFacet?.length) {
          for (const s of p.categoryFacet) {
            const t = s.trim();
            if (t) {
              /* Ponovljeni categoryFacet bez zareza u vrednosti — servlet/Tomcat pouzdano popunjava parametre. */
              usp.append('categoryFacet', t);
            }
          }
        }
        if (p.brandSlug) {
          usp.set('brandSlug', p.brandSlug);
        }
        if (p.minRating != null && p.minRating >= 1 && p.minRating <= 5) {
          usp.set('minRating', String(p.minRating));
        }
        const sortParam = toApiSortParam(p.sort);
        if (sortParam) {
          usp.set('sort', sortParam);
        }
        return { url: `/products/search?${usp.toString()}` };
      },
      serializeQueryArgs: ({ queryArgs }) => {
        const { categoryFacet, ...rest } = queryArgs;
        const fk = facetCacheKey(categoryFacet);
        return `searchProducts::${JSON.stringify(rest)}::facets:${fk}`;
      },
      providesTags: ['ProductList'],
    }),
    listBrandProducts: build.query<SpringPage<ProductCardDto>, BrandProductsParams>({
      query: ({ slug, page, size }) => ({
        url: `/brands/${encodeURIComponent(slug)}/products`,
        params: {
          page: page ?? 0,
          size: size ?? 20,
        },
      }),
    }),
    listBrands: build.query<BrandSummaryDto[], void>({
      query: () => '/brands',
    }),
    categoryTree: build.query<CategoryTreeNodeDto[], void>({
      query: () => '/categories/tree',
    }),
    categoryChildProductCounts: build.query<CategoryChildProductCountDto[], string>({
      query: (parentSlug) => `/categories/${encodeURIComponent(parentSlug)}/child-product-counts`,
    }),
    getProductBySlug: build.query<ProductDetailDto, string>({
      query: (slug) => `/products/${encodeURIComponent(slug)}`,
      providesTags: (_r, _e, slug) => [{ type: 'Product', id: slug }],
    }),
    listProductReviews: build.query<SpringPage<ProductReviewDto>, { slug: string; page?: number; size?: number }>({
      query: ({ slug, page, size }) => ({
        url: `/products/${encodeURIComponent(slug)}/reviews`,
        params: {
          page: page ?? 0,
          size: size ?? 20,
        },
      }),
      providesTags: (_result, _err, { slug }) => [{ type: 'Reviews', id: slug }],
    }),
    createProductReview: build.mutation<ProductReviewDto, { slug: string; body: CreateProductReviewBody }>({
      query: ({ slug, body }) => ({
        url: `/products/${encodeURIComponent(slug)}/reviews`,
        method: 'POST',
        body: {
          ...body,
          publicEmail: body.publicEmail ?? false,
        },
      }),
      invalidatesTags: (_r, _e, { slug }) => [
        { type: 'Reviews', id: slug },
        { type: 'Product', id: slug },
        'ProductList',
      ],
    }),
  }),
});

export const {
  useListProductsQuery,
  useWishlistProductCardsQuery,
  useSearchProductsQuery,
  useListBrandProductsQuery,
  useListBrandsQuery,
  useCategoryTreeQuery,
  useCategoryChildProductCountsQuery,
  useGetProductBySlugQuery,
  useListProductReviewsQuery,
  useCreateProductReviewMutation,
} = catalogApi;
