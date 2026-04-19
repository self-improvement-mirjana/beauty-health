import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  useListAdminBrandsQuery,
  useListAdminCategoriesQuery,
  useListProductsQuery,
} from '@/features/api/catalogEndpoints';

export function ProductListPage() {
  const [page, setPage] = useState(0);
  const [q, setQ] = useState('');
  const [qDraft, setQDraft] = useState('');
  const [brandSlug, setBrandSlug] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [featured, setFeatured] = useState<boolean | undefined>(undefined);

  const { data, isLoading, isFetching, isError, refetch } = useListProductsQuery({
    page,
    size: 20,
    ...(q.trim() ? { q: q.trim() } : {}),
    ...(brandSlug ? { brandSlug } : {}),
    ...(categorySlug ? { categorySlug } : {}),
    ...(featured !== undefined ? { featured } : {}),
  });

  const { data: brands } = useListAdminBrandsQuery();
  const { data: categories } = useListAdminCategoriesQuery();

  const brandOptions = useMemo(() => brands ?? [], [brands]);
  const categoryOptions = useMemo(() => categories ?? [], [categories]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Proizvodi</h1>
          <p className="mt-1 text-sm text-slate-400">
            Lista iz javnog kataloga (B04); izmene kroz B10 admin API.
          </p>
        </div>
        <Link
          to="/products/new"
          className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950"
        >
          Novi proizvod
        </Link>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400">Pretraga (naziv)</label>
            <div className="mt-1 flex gap-2">
              <input
                value={qDraft}
                onChange={(e) => setQDraft(e.target.value)}
                placeholder="npr. serum"
                className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => {
                  setQ(qDraft);
                  setPage(0);
                }}
                className="shrink-0 rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                Primeni
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400">Brend</label>
            <select
              value={brandSlug}
              onChange={(e) => {
                setBrandSlug(e.target.value);
                setPage(0);
              }}
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Svi</option>
              {brandOptions.map((b) => (
                <option key={b.id} value={b.slug}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400">Kategorija</label>
            <select
              value={categorySlug}
              onChange={(e) => {
                setCategorySlug(e.target.value);
                setPage(0);
              }}
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Sve</option>
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={featured === true}
                onChange={(e) => {
                  setFeatured(e.target.checked ? true : undefined);
                  setPage(0);
                }}
                className="rounded border-slate-500 bg-slate-950 text-amber-500 focus:ring-amber-500"
              />
              Samo istaknuti
            </label>
          </div>
        </div>
      </div>

      {isError ? (
        <p className="text-sm text-red-400">
          Učitavanje liste nije uspelo.{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Pokušaj ponovo
          </button>
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700 text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Naziv</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Brend</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Slug</th>
              <th className="px-4 py-3 text-right font-medium text-slate-300">Cena od</th>
              <th className="px-4 py-3 text-center font-medium text-slate-300">Zaliha</th>
              <th className="px-4 py-3 text-right font-medium text-slate-300">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Učitavanje…
                </td>
              </tr>
            ) : data && data.content.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Nema rezultata za zadate filtere.
                </td>
              </tr>
            ) : (
              data?.content.map((row) => (
                <tr key={row.slug} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-medium text-white">{row.title}</td>
                  <td className="px-4 py-3 text-slate-300">{row.brandName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{row.slug}</td>
                  <td className="px-4 py-3 text-right text-slate-200">
                    {row.moneySale ? (
                      <span>
                        <span className="text-amber-400">{row.moneySale.amount}</span>{' '}
                        <span className="text-slate-500 line-through">{row.moneyRegular.amount}</span>
                      </span>
                    ) : (
                      row.moneyRegular.amount
                    )}{' '}
                    <span className="text-slate-500">{row.moneyRegular.currency}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-300">{row.inStock ? 'Da' : 'Ne'}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/products/${encodeURIComponent(row.slug)}/edit`}
                      className="rounded-md border border-slate-600 px-2 py-1 text-xs font-medium text-amber-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      Uredi
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Strana {data.number + 1} od {data.totalPages} ({data.totalElements} ukupno)
            {isFetching ? ' · osvežavanje…' : null}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={data.first}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-md border border-slate-600 px-3 py-1.5 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prethodna
            </button>
            <button
              type="button"
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-slate-600 px-3 py-1.5 text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sledeća
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
