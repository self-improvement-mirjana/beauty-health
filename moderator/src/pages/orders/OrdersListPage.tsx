import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { MoneyDto } from '@/features/catalog/types';
import { useListAdminOrdersQuery } from '@/features/api/orderEndpoints';
import { orderStatusLabel } from '@/lib/orderStatusTransitions';

function formatMoney(m: MoneyDto): string {
  return `${m.amount} ${m.currency}`;
}

function localDateTimeToIso(local: string): string | undefined {
  const t = local.trim();
  if (!t) {
    return undefined;
  }
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) {
    return undefined;
  }
  return d.toISOString();
}

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Svi statusi' },
  { value: 'NEW', label: 'Nova' },
  { value: 'CONFIRMED', label: 'Potvrđena' },
  { value: 'SHIPPED', label: 'Poslata' },
  { value: 'COMPLETED', label: 'Završena' },
  { value: 'CANCELLED', label: 'Otkazana' },
];

export function OrdersListPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('');
  const [fromDraft, setFromDraft] = useState('');
  const [toDraft, setToDraft] = useState('');
  const [fromIso, setFromIso] = useState<string | undefined>();
  const [toIso, setToIso] = useState<string | undefined>();

  const queryArgs = useMemo(
    () => ({
      page,
      size: 20,
      ...(status ? { status } : {}),
      ...(fromIso ? { from: fromIso } : {}),
      ...(toIso ? { to: toIso } : {}),
    }),
    [page, status, fromIso, toIso],
  );

  const { data, isLoading, isFetching, isError, refetch } = useListAdminOrdersQuery(queryArgs);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Narudžbine</h1>
        <p className="mt-1 text-sm text-slate-400">
          Lista i filteri (B11). Klik na broj ili „Detalj” otvara stranicu narudžbine.
        </p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-slate-400">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400">Od (datum i vreme)</label>
            <input
              type="datetime-local"
              value={fromDraft}
              onChange={(e) => setFromDraft(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400">Do (datum i vreme)</label>
            <input
              type="datetime-local"
              value={toDraft}
              onChange={(e) => setToDraft(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>
          <div className="flex flex-col justify-end gap-2 sm:flex-row sm:items-end">
            <button
              type="button"
              onClick={() => {
                setFromIso(localDateTimeToIso(fromDraft));
                setToIso(localDateTimeToIso(toDraft));
                setPage(0);
              }}
              className="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Primeni datume
            </button>
            <button
              type="button"
              onClick={() => {
                setFromDraft('');
                setToDraft('');
                setFromIso(undefined);
                setToIso(undefined);
                setPage(0);
              }}
              className="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              Reset datuma
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Na serveru je polje „do” isključivo: u rezultatu su samo narudžbine sa{' '}
          <span className="font-mono text-slate-400">createdAt &lt; do</span>.
        </p>
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
              <th className="px-4 py-3 text-left font-medium text-slate-300">Broj</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Datum</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Kupac</th>
              <th className="px-4 py-3 text-right font-medium text-slate-300">Ukupno</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Status</th>
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
                  Nema narudžbina za zadate filtere.
                </td>
              </tr>
            ) : (
              data?.content.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-mono text-xs text-amber-400">
                    <Link to={`/orders/${row.id}`} className="hover:underline">
                      #{row.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {new Date(row.createdAt).toLocaleString('sr-RS', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-slate-300" title={row.customerEmail}>
                    {row.customerEmail}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-200">{formatMoney(row.total)}</td>
                  <td className="px-4 py-3 text-slate-300">{orderStatusLabel(row.status)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/orders/${row.id}`}
                      className="rounded-md border border-slate-600 px-2 py-1 text-xs font-medium text-amber-400 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      Detalj
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
