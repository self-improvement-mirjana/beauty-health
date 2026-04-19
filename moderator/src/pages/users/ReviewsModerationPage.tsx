import { useMemo, useState } from 'react';

import { ApiErrorBanner } from '@/components/ApiErrorBanner';
import { useListAdminReviewsQuery, usePatchReviewApprovalMutation } from '@/features/api/supportEndpoints';
import { parseApiError } from '@/lib/parseApiError';

type ApprovedFilter = 'all' | 'true' | 'false';

function clip(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) {
    return t;
  }
  return `${t.slice(0, max)}…`;
}

export function ReviewsModerationPage() {
  const [page, setPage] = useState(0);
  const [slugDraft, setSlugDraft] = useState('');
  const [slugApplied, setSlugApplied] = useState('');
  const [approvedFilter, setApprovedFilter] = useState<ApprovedFilter>('all');

  const approvedParam = useMemo(() => {
    if (approvedFilter === 'all') {
      return undefined;
    }
    return approvedFilter === 'true';
  }, [approvedFilter]);

  const queryArgs = useMemo(
    () => ({
      page,
      size: 20,
      ...(slugApplied.trim() ? { slug: slugApplied.trim() } : {}),
      ...(approvedParam !== undefined ? { approved: approvedParam } : {}),
    }),
    [page, slugApplied, approvedParam],
  );

  const { data, isLoading, isFetching, isError, refetch } = useListAdminReviewsQuery(queryArgs);
  const [patchApproval, { isLoading: patching }] = usePatchReviewApprovalMutation();
  const [banner, setBanner] = useState<{ message: string; details: string[] } | null>(null);

  async function setApproved(id: number, approved: boolean) {
    setBanner(null);
    try {
      await patchApproval({ id, approved }).unwrap();
    } catch (e) {
      setBanner(parseApiError(e));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Moderacija recenzija</h2>
        <p className="mt-1 text-sm text-slate-400">
          Nova recenzija ostaje skrivena sa PDP dok je status „Neodobreno”. Odobravanje odmah utiče na javni{' '}
          <code className="text-amber-500/90">GET /api/v1/products/&#123;slug&#125;/reviews</code>.
        </p>
      </div>

      {banner ? (
        <ApiErrorBanner message={banner.message} details={banner.details} onDismiss={() => setBanner(null)} />
      ) : null}

      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400">Slug proizvoda (opciono)</label>
            <div className="mt-1 flex gap-2">
              <input
                value={slugDraft}
                onChange={(e) => setSlugDraft(e.target.value)}
                placeholder="npr. product-001"
                className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={() => {
                  setSlugApplied(slugDraft);
                  setPage(0);
                }}
                className="shrink-0 rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                Primeni
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400">Status odobrenja</label>
            <select
              value={approvedFilter}
              onChange={(e) => {
                setApprovedFilter(e.target.value as ApprovedFilter);
                setPage(0);
              }}
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">Sve</option>
              <option value="false">Samo neodobrene</option>
              <option value="true">Samo odobrene</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSlugDraft('');
                setSlugApplied('');
                setPage(0);
              }}
              className="w-full rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Reset slug filtera
            </button>
          </div>
        </div>
      </div>

      {isError ? (
        <p className="text-sm text-red-400">
          Učitavanje nije uspelo (proverite da li ste ulogovani kao moderator).{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Pokušaj ponovo
          </button>
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700 text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Proizvod</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Autor</th>
              <th className="px-4 py-3 text-center font-medium text-slate-300">Ocena</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Datum</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Tekst</th>
              <th className="px-4 py-3 text-right font-medium text-slate-300">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Učitavanje…
                </td>
              </tr>
            ) : data && data.content.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Nema recenzija za zadate filtere.
                </td>
              </tr>
            ) : (
              data?.content.map((row) => (
                <tr key={row.id} className="align-top hover:bg-slate-900/60">
                  <td className="px-4 py-3 text-slate-200">
                    <div className="font-medium">{row.productTitle}</div>
                    <div className="font-mono text-xs text-slate-500">{row.productSlug}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <div>{row.authorName}</div>
                    <div className="break-all text-xs text-slate-500">{row.authorEmail}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-amber-400">{row.rating}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                    {new Date(row.createdAt).toLocaleString('sr-RS', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{row.approved ? 'Odobreno' : 'Neodobreno'}</td>
                  <td className="max-w-xs px-4 py-3 text-slate-400" title={row.body}>
                    {clip(row.body, 120)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!row.approved ? (
                      <button
                        type="button"
                        disabled={patching}
                        onClick={() => void setApproved(row.id, true)}
                        className="rounded-md border border-emerald-700 px-2 py-1 text-xs text-emerald-300 hover:bg-slate-800 disabled:opacity-40"
                      >
                        Odobri
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={patching}
                        onClick={() => void setApproved(row.id, false)}
                        className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                      >
                        Sakrij
                      </button>
                    )}
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
