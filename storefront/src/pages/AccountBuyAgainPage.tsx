import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useBuyAgainItemsQuery } from '@/features/api/orderEndpoints';
import { useAddCartItemMutation } from '@/features/api/cartEndpoints';
import { parseApiError } from '@/lib/parseApiError';

const fmtDate = new Intl.DateTimeFormat('sr-Latn-RS', {
  dateStyle: 'medium',
});

export function AccountBuyAgainPage() {
  const { data, isLoading, isError, refetch } = useBuyAgainItemsQuery({ limit: 80 });
  const [addCartItem, { isLoading: adding }] = useAddCartItemMutation();
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  async function addOne(variantId: number) {
    setMessage(null);
    try {
      await addCartItem({ variantId, quantity: 1 }).unwrap();
      setMessage({ kind: 'ok', text: 'Dodato u korpu (1 kom).' });
    } catch (e) {
      const { message: msg } = parseApiError(e);
      setMessage({ kind: 'err', text: msg || 'Dodavanje nije uspelo.' });
    }
  }

  return (
    <div>
      <Helmet>
        <title>Ponovo kupi — Moj nalog</title>
      </Helmet>
      <h1 className="text-2xl font-semibold text-neutral-900">Ponovo kupi</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Proizvodi koje ste već naručili — jednim klikom dodajte u korpu (proverite varijantu na stranici proizvoda ako ima opcija).
      </p>

      {message ? (
        <p
          className={`mt-4 text-sm ${message.kind === 'ok' ? 'text-green-800' : 'text-red-700'}`}
          role="status"
        >
          {message.text}
        </p>
      ) : null}

      {isLoading ? <p className="mt-8 text-sm text-neutral-500">Učitavanje…</p> : null}
      {isError ? (
        <div className="mt-8">
          <p className="text-sm text-red-700">Ne možemo da učitamo listu.</p>
          <button
            type="button"
            className="mt-2 text-sm font-medium text-neutral-900 underline"
            onClick={() => void refetch()}
          >
            Pokušaj ponovo
          </button>
        </div>
      ) : null}

      {data && data.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
          <p className="text-sm text-neutral-700">
            Kada završite prvu porudžbinu, na ovoj stranici pojaviće se brzi izbor za ponovni kupovinu.
          </p>
          <Link
            to="/shop"
            className="mt-4 inline-block text-sm font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
          >
            U prodavnicu
          </Link>
        </div>
      ) : null}

      {data && data.length > 0 ? (
        <ul className="mt-8 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white shadow-sm">
          {data.map((row) => (
            <li key={row.variantId} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <Link
                  to={`/p/${row.productSlug}`}
                  className="text-sm font-semibold text-neutral-900 underline-offset-2 hover:underline"
                >
                  {row.productName}
                </Link>
                <p className="mt-1 text-xs text-neutral-500">
                  Poslednji put: {fmtDate.format(new Date(row.lastOrderedAt))} · Ukupno naručeno: {row.totalQuantityOrdered}{' '}
                  kom
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Link
                  to={`/p/${row.productSlug}`}
                  className="hidden text-xs font-medium text-neutral-600 underline underline-offset-2 sm:inline"
                >
                  Detalji
                </Link>
                <button
                  type="button"
                  disabled={adding}
                  onClick={() => void addOne(row.variantId)}
                  className="rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  U korpu
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
