import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { useListMyOrdersQuery } from '@/features/api/orderEndpoints';
import { formatRsd } from '@/lib/money';
import { orderStatusBadgeClass } from '@/lib/orderUi';

const fmtDate = new Intl.DateTimeFormat('sr-Latn-RS', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function AccountOrdersPage() {
  const { data, isLoading, isError } = useListMyOrdersQuery({ page: 0, size: 50 });

  return (
    <div className="min-h-[50vh] bg-white">
      <Helmet>
        <title>Porudžbine — Moj nalog</title>
      </Helmet>

      <nav className="mb-6 text-xs text-neutral-600" aria-label="Putanja">
        <Link to="/" className="hover:text-neutral-900 hover:underline">
          Početna
        </Link>
        <span className="mx-1.5 text-neutral-400">/</span>
        <Link to="/account" className="hover:text-neutral-900 hover:underline">
          Moj nalog
        </Link>
        <span className="mx-1.5 text-neutral-400">/</span>
        <span className="text-neutral-900">Porudžbine</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 md:text-4xl">Vaše porudžbine</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600">
          Pregled svih narudžbina. Kliknite na porudžbinu za stavke, slike proizvoda i adresu isporuke.
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-4" aria-busy>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-neutral-200 bg-white p-6">
              <div className="h-5 w-24 rounded bg-neutral-200" />
              <div className="mt-4 h-6 w-48 rounded bg-neutral-200" />
              <div className="mt-2 h-4 w-full max-w-md rounded bg-neutral-100" />
              <div className="mt-6 h-8 w-32 rounded bg-neutral-200" />
            </div>
          ))}
        </div>
      ) : null}

      {isError ? (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          Ne možemo da učitamo porudžbine. Pokušajte ponovo kasnije.
        </p>
      ) : null}

      {data && data.content.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
          <p className="text-sm text-neutral-700">Još uvek nemate porudžbine.</p>
          <Link
            to="/shop"
            className="mt-4 inline-block text-sm font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
          >
            Krenite u kupovinu
          </Link>
        </div>
      ) : null}

      {data && data.content.length > 0 ? (
        <div className="grid gap-4">
          {data.content.map((o) => (
            <Link
              key={o.id}
              to={`/account/porudzbina/${o.id}`}
              className="group block rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-[box-shadow,border-color] hover:border-neutral-300 hover:shadow-md"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${orderStatusBadgeClass(o.status)}`}
                  >
                    {o.status}
                  </span>
                  <p className="mt-3 text-lg font-semibold tracking-tight text-neutral-900 group-hover:text-neutral-950">
                    Porudžbina #{o.id}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {fmtDate.format(new Date(o.createdAt))}
                    <span className="text-neutral-400"> · </span>
                    {o.lineCount} {o.lineCount === 1 ? 'stavka' : 'stavki'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-semibold tabular-nums text-neutral-900">{formatRsd(o.total)}</p>
                  <p className="mt-1 text-xs font-medium text-neutral-500 transition-colors group-hover:text-neutral-800">
                    Detalji porudžbine →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
