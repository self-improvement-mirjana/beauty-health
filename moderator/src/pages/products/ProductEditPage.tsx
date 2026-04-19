import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { ApiErrorBanner } from '@/components/ApiErrorBanner';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  useListAdminBrandsQuery,
  useListAdminCategoriesQuery,
  useModeratorProductDetailQuery,
  usePatchVariantInventoryMutation,
  usePatchVariantPricesMutation,
  useUpdateProductMutation,
  useVariantInventoryQuery,
} from '@/features/api/catalogEndpoints';
import type { ProductVariantDetail } from '@/features/catalog/types';
import {
  productUpdateSchema,
  type ProductUpdateFormInput,
  type ProductUpdateFormValues,
} from '@/features/catalog/productFormSchema';
import { parseApiError } from '@/lib/parseApiError';

function VariantPricesEditor({
  productId,
  variant,
}: {
  productId: number;
  variant: ProductVariantDetail;
}) {
  const [regular, setRegular] = useState(() => parseFloat(variant.moneyRegular.amount));
  const [sale, setSale] = useState(() =>
    variant.moneySale ? parseFloat(variant.moneySale.amount) : '',
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<{ message: string; details: string[] } | null>(null);
  const [patch, { isLoading }] = usePatchVariantPricesMutation();

  useEffect(() => {
    setRegular(parseFloat(variant.moneyRegular.amount));
    setSale(variant.moneySale ? parseFloat(variant.moneySale.amount) : '');
  }, [variant.id, variant.moneyRegular.amount, variant.moneySale]);

  async function save() {
    setErr(null);
    setMsg(null);
    try {
      const saleNum = sale === '' || sale === null ? null : Number(sale);
      if (saleNum !== null && (Number.isNaN(saleNum) || saleNum < 0)) {
        setErr({ message: 'Akcijska cena mora biti broj ≥ 0 ili prazno', details: [] });
        return;
      }
      await patch({
        productId,
        variantId: variant.id,
        regularPrice: regular,
        salePrice: saleNum,
      }).unwrap();
      setMsg('Cene su ažurirane (potvrdiće javni PDP posle osvežavanja).');
    } catch (e) {
      setErr(parseApiError(e));
    }
  }

  return (
    <div className="rounded-md border border-slate-700/80 bg-slate-950/50 p-3 space-y-2">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-slate-500">Regularna (RSD)</label>
          <input
            type="number"
            step="0.01"
            min={0}
            value={regular}
            onChange={(e) => setRegular(parseFloat(e.target.value) || 0)}
            className="mt-1 w-32 rounded border border-slate-600 bg-slate-950 px-2 py-1 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Akcijska (opciono)</label>
          <input
            type="text"
            inputMode="decimal"
            value={sale}
            onChange={(e) => setSale(e.target.value)}
            className="mt-1 w-32 rounded border border-slate-600 bg-slate-950 px-2 py-1 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={isLoading}
          className="rounded-md border border-amber-700/60 bg-amber-950/30 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-900/40 disabled:opacity-50"
        >
          {isLoading ? '…' : 'Sačuvaj cene'}
        </button>
      </div>
      {msg ? <p className="text-xs text-emerald-400">{msg}</p> : null}
      {err ? <p className="text-xs text-red-400">{err.message}</p> : null}
    </div>
  );
}

function VariantInventoryEditor({ productId, variantId }: { productId: number; variantId: number }) {
  const { data, isLoading, isError, refetch } = useVariantInventoryQuery({ productId, variantId });
  const [lines, setLines] = useState<{ storeLocationId: number; quantity: number }[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<{ message: string; details: string[] } | null>(null);
  const [patch, { isLoading: saving }] = usePatchVariantInventoryMutation();

  useEffect(() => {
    if (data) {
      setLines(data.map((r) => ({ storeLocationId: r.storeLocationId, quantity: r.quantity })));
    }
  }, [data]);

  async function save() {
    setErr(null);
    setMsg(null);
    try {
      await patch({ productId, variantId, lines }).unwrap();
      setMsg('Zalihe su zamenjene na serveru.');
      void refetch();
    } catch (e) {
      setErr(parseApiError(e));
    }
  }

  if (isLoading && !data) {
    return <p className="text-xs text-slate-500">Učitavanje zaliha…</p>;
  }
  if (isError) {
    return (
      <p className="text-xs text-red-400">
        Greška pri učitavanju.{' '}
        <button type="button" className="underline" onClick={() => void refetch()}>
          Ponovi
        </button>
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {lines.map((line, idx) => {
          const label = data?.find((d) => d.storeLocationId === line.storeLocationId)?.storeLocationName ?? 'Magacin';
          return (
            <div key={line.storeLocationId} className="flex items-center gap-2 text-xs">
              <span className="min-w-0 flex-1 truncate text-slate-400" title={label}>
                {label}
              </span>
              <input
                type="number"
                min={0}
                value={line.quantity}
                onChange={(e) => {
                  const q = parseInt(e.target.value, 10);
                  setLines((prev) =>
                    prev.map((l, i) => (i === idx ? { ...l, quantity: Number.isNaN(q) ? 0 : q } : l)),
                  );
                }}
                className="w-20 rounded border border-slate-600 bg-slate-950 px-2 py-1 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="rounded-md border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? 'Snimanje…' : 'Sačuvaj zalihe'}
        </button>
        {msg ? <span className="text-xs text-emerald-400">{msg}</span> : null}
        {err ? <span className="text-xs text-red-400">{err.message}</span> : null}
      </div>
    </div>
  );
}

export function ProductEditPage() {
  const { slug: slugParam } = useParams<{ slug: string }>();
  const slug = slugParam ? decodeURIComponent(slugParam) : '';
  const navigate = useNavigate();
  const { data: detail, isLoading, isError, refetch } = useModeratorProductDetailQuery(slug, { skip: !slug });
  const { data: categories } = useListAdminCategoriesQuery();
  const { data: brands } = useListAdminBrandsQuery();
  const [updateProduct, { isLoading: savingMeta }] = useUpdateProductMutation();
  const [banner, setBanner] = useState<{ message: string; details: string[] } | null>(null);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ProductUpdateFormInput, unknown, ProductUpdateFormValues>({
    resolver: zodResolver(productUpdateSchema) as Resolver<ProductUpdateFormInput, unknown, ProductUpdateFormValues>,
  });

  useEffect(() => {
    if (!detail) {
      return;
    }
    reset({
      brandId: detail.brandId,
      name: detail.title,
      slug: detail.slug,
      description: detail.description ?? '',
      shortDescription: detail.shortDescription ?? '',
      featured: detail.featured,
      active: detail.active,
      categoryIds: detail.categories.map((c) => c.id),
    });
  }, [detail, reset]);

  async function onSaveMeta(values: ProductUpdateFormValues) {
    if (!detail) {
      return;
    }
    setBanner(null);
    try {
      const res = await updateProduct({
        id: detail.id,
        body: {
          brandId: values.brandId,
          name: values.name,
          slug: values.slug,
          description: values.description,
          shortDescription: values.shortDescription,
          featured: values.featured,
          active: values.active,
          categoryIds: values.categoryIds,
        },
      }).unwrap();
      if (res.slug !== slug) {
        navigate(`/products/${encodeURIComponent(res.slug)}/edit`, { replace: true });
      }
    } catch (e) {
      setBanner(parseApiError(e));
    }
  }

  async function confirmDeactivate() {
    if (!detail) {
      return;
    }
    setBanner(null);
    const parsed = productUpdateSchema.safeParse(getValues());
    if (!parsed.success) {
      setBanner({ message: 'Ispravite polja u formi pre deaktivacije', details: [] });
      setDeactivateOpen(false);
      return;
    }
    try {
      await updateProduct({
        id: detail.id,
        body: { ...parsed.data, active: false },
      }).unwrap();
      setDeactivateOpen(false);
      reset((f) => ({ ...f, active: false }));
    } catch (e) {
      setBanner(parseApiError(e));
      setDeactivateOpen(false);
    }
  }

  if (!slug) {
    return <p className="text-red-400">Nedostaje slug u URL-u.</p>;
  }

  if (isLoading) {
    return <p className="text-slate-400">Učitavanje proizvoda…</p>;
  }

  if (isError || !detail) {
    return (
      <p className="text-red-400">
        Proizvod nije učitan.{' '}
        <button type="button" className="underline" onClick={() => void refetch()}>
          Pokušaj ponovo
        </button>
      </p>
    );
  }

  const selectedCats = watch('categoryIds');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Uredi proizvod</h1>
          <p className="mt-1 font-mono text-sm text-slate-500">{detail.slug}</p>
          <p className="text-xs text-slate-500">
            Status:{' '}
            <span className={detail.active ? 'text-emerald-400' : 'text-amber-400'}>
              {detail.active ? 'aktivan' : 'neaktivan'}
            </span>
          </p>
        </div>
        <Link
          to="/products"
          className="text-sm text-amber-400 hover:text-amber-300 focus:outline-none focus:underline"
        >
          ← Lista proizvoda
        </Link>
      </div>

      {banner ? <ApiErrorBanner {...banner} onDismiss={() => setBanner(null)} /> : null}

      <form className="space-y-6" onSubmit={handleSubmit(onSaveMeta)} noValidate>
        <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 space-y-4">
          <h2 className="text-lg font-medium text-white">Osnovno</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300">Brend</label>
              <select
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                {...register('brandId', { valueAsNumber: true })}
              >
                {(brands ?? []).map((b) => (
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
              <label className="text-sm text-slate-300">Naziv</label>
              <input
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                {...register('name')}
              />
              {errors.name ? <p className="mt-1 text-xs text-red-400">{errors.name.message}</p> : null}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-slate-300">Slug</label>
              <input
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
                  const checked = selectedCats?.includes(c.id) ?? false;
                  return (
                    <label key={c.id} className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const cur = watch('categoryIds') ?? [];
                          const next = checked ? cur.filter((id) => id !== c.id) : [...cur, c.id];
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
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={savingMeta}
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-60"
            >
              {savingMeta ? 'Snimanje…' : 'Sačuvaj osnovno'}
            </button>
            <button
              type="button"
              onClick={() => setDeactivateOpen(true)}
              className="rounded-md border border-red-800/80 px-4 py-2 text-sm text-red-300 hover:bg-red-950/40"
            >
              Deaktiviraj proizvod…
            </button>
          </div>
        </section>
      </form>

      <section className="rounded-lg border border-slate-700 bg-slate-900/40 p-4 space-y-4">
        <h2 className="text-lg font-medium text-white">Varijante: cene i zalihe</h2>
        <p className="text-xs text-slate-500">
          Opcije proizvoda (B04) nisu u B10 admin opsegu — menjaju se samo cene i zalihe po varijanti.
        </p>
        <div className="space-y-6">
          {detail.variants.map((v) => (
            <div key={v.id} className="rounded-lg border border-slate-800 p-4 space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-mono text-sm text-amber-400">{v.sku}</p>
                  {v.name ? <p className="text-sm text-slate-300">{v.name}</p> : null}
                </div>
                <p className="text-xs text-slate-500">Varijanta ID: {v.id}</p>
              </div>
              {v.selectedOptions?.length ? (
                <ul className="text-xs text-slate-500">
                  {v.selectedOptions.map((o) => (
                    <li key={`${o.optionName}-${o.value}`}>
                      {o.optionName}: {o.value}
                    </li>
                  ))}
                </ul>
              ) : null}
              <VariantPricesEditor productId={detail.id} variant={v} />
              <div>
                <p className="mb-2 text-xs font-medium text-slate-400">Zalihe po magacinu</p>
                <VariantInventoryEditor productId={detail.id} variantId={v.id} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <ConfirmModal
        open={deactivateOpen}
        title="Deaktivacija proizvoda"
        confirmLabel="Deaktiviraj"
        onCancel={() => setDeactivateOpen(false)}
        onConfirm={() => void confirmDeactivate()}
        busy={savingMeta}
      >
        <p>
          Proizvod će postati <strong>neaktivan</strong> (ostaje u bazi). Javni listing ga tipično ne prikazuje.
        </p>
      </ConfirmModal>
    </div>
  );
}
