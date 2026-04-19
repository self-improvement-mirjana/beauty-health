import { baseApi } from '@/features/api/baseApi';
import type {
  AdminBrand,
  AdminCategory,
  AdminInventoryLine,
  AdminProductCreated,
  AdminStoreLocation,
  BrandUpsertBody,
  CategoryUpsertBody,
  CreateProductBody,
  ProductCard,
  ProductDetail,
  SpringPage,
  UpdateProductBody,
} from '@/features/catalog/types';

export type ProductListParams = {
  page?: number;
  size?: number;
  q?: string;
  brandSlug?: string;
  categorySlug?: string;
  featured?: boolean;
};

const catalogApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    listProducts: build.query<SpringPage<ProductCard>, ProductListParams>({
      query: (p) => ({
        url: '/products',
        params: {
          page: p.page ?? 0,
          size: p.size ?? 20,
          ...(p.q?.trim() ? { q: p.q.trim() } : {}),
          ...(p.brandSlug ? { brandSlug: p.brandSlug } : {}),
          ...(p.categorySlug ? { categorySlug: p.categorySlug } : {}),
          ...(p.featured !== undefined ? { featured: p.featured } : {}),
        },
      }),
      providesTags: [{ type: 'Product', id: 'LIST' }],
    }),
    moderatorProductDetail: build.query<ProductDetail, string>({
      query: (slug) => ({
        url: '/admin/products/detail',
        params: { slug },
      }),
      providesTags: (_result, _err, slug) => [{ type: 'Product', id: slug }],
    }),
    listAdminBrands: build.query<AdminBrand[], void>({
      query: () => '/admin/brands',
      providesTags: [{ type: 'Brand', id: 'LIST' }],
    }),
    listAdminCategories: build.query<AdminCategory[], void>({
      query: () => '/admin/categories',
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    listStoreLocations: build.query<AdminStoreLocation[], void>({
      query: () => '/admin/store-locations',
      providesTags: [{ type: 'StoreLocation', id: 'LIST' }],
    }),
    variantInventory: build.query<AdminInventoryLine[], { productId: number; variantId: number }>({
      query: ({ productId, variantId }) => `/admin/products/${productId}/variants/${variantId}/inventory`,
      providesTags: (_r, _e, { productId, variantId }) => [
        { type: 'VariantInventory', id: `${productId}-${variantId}` },
      ],
    }),
    createProduct: build.mutation<AdminProductCreated, CreateProductBody>({
      query: (body) => ({ url: '/admin/products', method: 'POST', body }),
      invalidatesTags: ['Product', 'VariantInventory'],
    }),
    updateProduct: build.mutation<AdminProductCreated, { id: number; body: UpdateProductBody }>({
      query: ({ id, body }) => ({ url: `/admin/products/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Product', 'VariantInventory'],
    }),
    patchVariantPrices: build.mutation<
      void,
      { productId: number; variantId: number; regularPrice: number; salePrice: number | null }
    >({
      query: ({ productId, variantId, regularPrice, salePrice }) => ({
        url: `/admin/products/${productId}/variants/${variantId}/prices`,
        method: 'PATCH',
        body: { regularPrice, salePrice },
      }),
      invalidatesTags: ['Product', 'VariantInventory'],
    }),
    patchVariantInventory: build.mutation<
      void,
      { productId: number; variantId: number; lines: { storeLocationId: number; quantity: number }[] }
    >({
      query: ({ productId, variantId, lines }) => ({
        url: `/admin/products/${productId}/variants/${variantId}/inventory`,
        method: 'PATCH',
        body: { lines },
      }),
      invalidatesTags: ['Product', 'VariantInventory'],
    }),
    createBrand: build.mutation<AdminBrand, BrandUpsertBody>({
      query: (body) => ({ url: '/admin/brands', method: 'POST', body }),
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }, 'Product'],
    }),
    updateBrand: build.mutation<AdminBrand, { id: number; body: BrandUpsertBody }>({
      query: ({ id, body }) => ({ url: `/admin/brands/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }, 'Product'],
    }),
    deleteBrand: build.mutation<void, number>({
      query: (id) => ({ url: `/admin/brands/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }, 'Product'],
    }),
    createCategory: build.mutation<AdminCategory, CategoryUpsertBody>({
      query: (body) => ({ url: '/admin/categories', method: 'POST', body }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }, 'Product'],
    }),
    updateCategory: build.mutation<AdminCategory, { id: number; body: CategoryUpsertBody }>({
      query: ({ id, body }) => ({ url: `/admin/categories/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }, 'Product'],
    }),
    deleteCategory: build.mutation<void, number>({
      query: (id) => ({ url: `/admin/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }, 'Product'],
    }),
  }),
});

export const {
  useListProductsQuery,
  useModeratorProductDetailQuery,
  useListAdminBrandsQuery,
  useListAdminCategoriesQuery,
  useListStoreLocationsQuery,
  useVariantInventoryQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  usePatchVariantPricesMutation,
  usePatchVariantInventoryMutation,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = catalogApi;
