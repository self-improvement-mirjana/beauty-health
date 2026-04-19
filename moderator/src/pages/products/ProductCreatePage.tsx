import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm, type Resolver } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { ApiErrorBanner } from '@/components/ApiErrorBanner';
import {
  useCreateProductMutation,
  useListAdminBrandsQuery,
  useListAdminCategoriesQuery,
  useListStoreLocationsQuery,
} from '@/features/api/catalogEndpoints';
import {
  productCreateSchema,
  type ProductCreateFormInput,
  type ProductCreateFormValues,
} from '@/features/catalog/productFormSchema';
import { parseApiError } from '@/lib/parseApiError';

export function ProductCreatePage() {
  const navigate = useNavigate();
  const { data: brands, isLoading: brandsLoading } = useListAdminBrandsQuery();
  const { data: categories, isLoading: catLoading } = useListAdminCategoriesQuery();
  const { data: locations, isSuccess: locOk } = useListStoreLocationsQuery();
  const [createProduct, { isLoading: saving }] = useCreateProductMutation();
  const [banner, setBanner] = useState<{ message: string; details: string[] } | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductCreateFormInput, unknown, ProductCreateFormValues>({
    resolver: zodResolver(productCreateSchema) as Resolver<ProductCreateFormInput, unknown, ProductCreateFormValues>,
    defaultValues: {
      brandId: 0,
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      featured: false,
      active: true,
      categoryIds: [],
      variants: [
        {
          sku: '',
          name: '',
          regularPrice: 0,
          salePrice: '',
          defaultVariant: true,
          inventory: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });

  useEffect(() => {
    if (!locOk || !locations?.length || !brands?.length) {
      return;
    }
    const inv = locations.map((l) => ({ storeLocationId: l.id, quantity: 0 }));
    reset({
      brandId: brands[0].id,
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      featured: false,
      active: true,
      categoryIds: [],
      variants: [
        {
          sku: '',
          name: '',
          regularPrice: 0,
          salePrice: '',
          defaultVariant: true,
          inventory: inv,
        },
      ],
    });
  }, [locOk, locations, brands, reset]);

  const variants = watch('variants');

  async function onSubmit(values: ProductCreateFormValues) {
    setBanner(null);
    try {
      const res = await createProduct({
        brandId: values.brandId,
        name: values.name,
        slug: values.slug,
        description: values.description,
        shortDescription: values.shortDescription,
        featured: values.featured,
        active: values.active,
        categoryIds: values.categoryIds,
        variants: values.variants.map((v) => ({
          sku: v.sku,
          name: v.name ?? null,
          regularPrice: v.regularPrice,
          salePrice: v.salePrice,
          defaultVariant: v.defaultVariant,
          inventory: v.inventory,
        })),
      }).unwrap();
      navigate(`/products/${encodeURIComponent(res.slug)}/edit`, { replace: true });
    } catch (e) {
      setBanner(parseApiError(e));
    }
  }

  const ready = locOk && locations.length > 0 && brands && brands.length > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Novi proizvod</h1>
          <p className="mt-1 text-sm text-slate-400">Kreiranje preko POST /api/v1/admin/products (B10).</p>
        </div>
        <Link
          to="/products"
          className="text-sm text-amber-400 hover:text-amber-300 focus:outline-none focus:underline"
        >
          ← Nazad na listu
        </Link>
      </div>

      {banner ? <ApiErrorBanner {...banner} onDismiss={() => setBanner(null)} /> : null}

      {!ready ? (
        <p className="text-slate-400">
          {brandsLoading || catLoading || !locOk ? 'Učitavanje brendova, kategorija i magacina…' : 'Nema magacina u bazi.'}
        </p>
      ) : (
        <form className="space-y-8" onSubmit={handleSubmit(onSubmit)} noValidate>
          <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 space-y-4">
            <h2 className="text-lg font-medium text-white">Osnovno</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-slate-300">Brend</label>
                <select
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  {...register('brandId', { valueAsNumber: true })}
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {errors.brandId ? <p className="mt-1 text-xs text-red-400">{errors.brandId.message}</p> : null}
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" {...register('featured')} className="rounded border-slate-500 text-amber-500" />
                  Istaknut
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" {...register('active')} className="rounded border-slate-500 text-amber-500" />
                  Aktivan
                </label>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="product-name" className="text-sm text-slate-300">
                  Naziv
                </label>
                <input
                  id="product-name"
                  data-testid="product-name"
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  {...register('name')}
                />
                {errors.name ? <p className="mt-1 text-xs text-red-400">{errors.name.message}</p> : null}
              </div>
              <div className="md:col-span-2">
                <label htmlFor="product-slug" className="text-sm text-slate-300">
                  Slug (URL)
                </label>
                <input
                  id="product-slug"
                  data-testid="product-slug"
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  {...register('slug')}
                />
                {errors.slug ? <p className="mt-1 text-xs text-red-400">{errors.slug.message}</p> : null}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-slate-300">Kratki opis</label>
                <input
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  {...register('shortDescription')}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-slate-300">Opis</label>
                <textarea
                  rows={4}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  {...register('description')}
                />
              </div>
              <div className="md:col-span-2">
                <span className="text-sm text-slate-300">Kategorije</span>
                <div className="mt-2 max-h-40 space-y-2 overflow-y-auto rounded-md border border-slate-700 p-2">
                  {categories?.map((c) => {
                    const selected = watch('categoryIds') ?? [];
                    const checked = selected.includes(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2 text-sm text-slate-200">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? selected.filter((id) => id !== c.id)
                              : [...selected, c.id];
                            setValue('categoryIds', next, { shouldValidate: true });
                          }}
                          className="rounded border-slate-500 text-amber-500"
                        />
                        {c.name}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">Varijante</h2>
              <button
                type="button"
                onClick={() =>
                  append({
                    sku: '',
                    name: '',
                    regularPrice: 0,
                    salePrice: '',
                    defaultVariant: false,
                    inventory: (locations ?? []).map((l) => ({ storeLocationId: l.id, quantity: 0 })),
                  })
                }
                className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-amber-400 hover:bg-slate-800"
              >
                + Varijanta
              </button>
            </div>
            {errors.variants && typeof errors.variants.message === 'string' ? (
              <p className="text-sm text-red-400">{errors.variants.message}</p>
            ) : null}

            {fields.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-300">Varijanta {index + 1}</span>
                  {fields.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Ukloni
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs text-slate-400" htmlFor={`variant-sku-${index}`}>
                      SKU
                    </label>
                    <input
                      id={`variant-sku-${index}`}
                      data-testid={index === 0 ? 'variant-0-sku' : undefined}
                      className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      {...register(`variants.${index}.sku`)}
                    />
                    {errors.variants?.[index]?.sku ? (
                      <p className="mt-1 text-xs text-red-400">{errors.variants[index]?.sku?.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Naziv varijante (opciono)</label>
                    <input
                      className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      {...register(`variants.${index}.name`)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Regularna cena (RSD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      {...register(`variants.${index}.regularPrice`, { valueAsNumber: true })}
                    />
                    {errors.variants?.[index]?.regularPrice ? (
                      <p className="mt-1 text-xs text-red-400">{errors.variants[index]?.regularPrice?.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Akcijska cena (opciono)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="prazno = nema akcije"
                      className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      {...register(`variants.${index}.salePrice`)}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-300 md:col-span-2">
                    <input
                      type="radio"
                      name="defaultVariantGroup"
                      checked={variants[index]?.defaultVariant === true}
                      onChange={() => {
                        fields.forEach((_, i) => {
                          setValue(`variants.${i}.defaultVariant`, i === index);
                        });
                      }}
                    />
                    Podrazumevana varijanta
                  </label>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Zalihe po magacinu</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {locations.map((loc, li) => (
                      <div key={loc.id} className="flex items-center gap-2">
                        <span className="min-w-0 flex-1 truncate text-xs text-slate-400" title={loc.name}>
                          {loc.name}
                        </span>
                        <input
                          type="number"
                          min={0}
                          className="w-20 rounded border border-slate-600 bg-slate-950 px-2 py-1 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          {...register(`variants.${index}.inventory.${li}.quantity`, { valueAsNumber: true })}
                        />
                        <input
                          type="hidden"
                          {...register(`variants.${index}.inventory.${li}.storeLocationId`, {
                            valueAsNumber: true,
                          })}
                        />
                      </div>
                    ))}
                  </div>
                  {errors.variants?.[index]?.inventory ? (
                    <p className="mt-1 text-xs text-red-400">Proverite količine zaliha.</p>
                  ) : null}
                </div>
              </div>
            ))}
          </section>

          <div className="flex justify-end gap-2">
            <Link
              to="/products"
              className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Otkaži
            </Link>
            <button
              type="submit"
              data-testid="product-create-submit"
              disabled={saving}
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
            >
              {saving ? 'Snimanje…' : 'Kreiraj proizvod'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
