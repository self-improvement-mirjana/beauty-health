import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';

import { AccountInlineNav } from '@/components/AccountInlineNav';
import { useWishlistProductCardsQuery } from '@/features/api/catalogEndpoints';
import { useGetMyOrderQuery } from '@/features/api/orderEndpoints';
import type { ProductCardDto } from '@/features/catalog/types';
import type { OrderLineDetailDto } from '@/features/order/types';
import { formatRsd } from '@/lib/money';
import { formatPaymentLabel, formatPaymentStatus, orderStatusBadgeClass } from '@/lib/orderUi';
import { parseApiError } from '@/lib/parseApiError';
import { stripHtmlToPlainText } from '@/lib/stripHtml';

const fmtDate = new Intl.DateTimeFormat('sr-Latn-RS', {
  dateStyle: 'long',
  timeStyle: 'short',
});

function OrderLineRow({ line, card }: { line: OrderLineDetailDto; card: ProductCardDto | undefined }) {
  const img = card?.primaryImageUrl;

  return (
    <li className="py-5 first:pt-0">
      <Link
        to={`/p/${line.productSlug}`}
        className="group flex gap-4 rounded-lg outline-none ring-neutral-900/15 focus-visible:ring-2 sm:gap-5"
      >
        <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 sm:h-24 sm:w-24">
          {img ? (
            <img src={img} alt="" className="h-full w-full object-cover transition-opacity group-hover:opacity-90" />
          ) : (
            <span className="flex h-full w-full items-center justify-center px-1 text-center text-[10px] text-neutral-400">
              Nema slike
            </span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-neutral-900 group-hover:underline sm:text-base">
            {line.productName}
          </span>
          <span className="mt-1 block text-xs text-neutral-500 sm:text-sm">
            Količina {line.quantity}
            <span className="text-neutral-400"> · </span>
            {formatRsd(line.unitPrice)} po komadu
            <span className="text-neutral-400"> · </span>
            varijanta #{line.variantId}
          </span>
        </span>
        <span className="shrink-0 self-start text-right">
          <span className="block text-sm font-semibold tabular-nums text-neutral-900 sm:text-base">
            {formatRsd(line.lineTotal)}
          </span>
        </span>
      </Link>
    </li>
  );
}

function OrderLinesSkeleton({ rows }: { rows: number }) {
  return (
    <ul className="divide-y divide-neutral-100" aria-busy>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex gap-4 py-5 first:pt-0">
          <div className="h-20 w-20 shrink-0 animate-pulse rounded-lg bg-neutral-100 sm:h-24 sm:w-24" />
          <div className="min-w-0 flex-1 space-y-2 pt-1">
            <div className="h-4 w-full max-w-md animate-pulse rounded bg-neutral-100" />
            <div className="h-3 w-48 animate-pulse rounded bg-neutral-100" />
          </div>
          <div className="h-5 w-16 shrink-0 animate-pulse rounded bg-neutral-100" />
        </li>
      ))}
    </ul>
  );
}

export function AccountOrderDetailPage() {
  const { orderId } = useParams();
  const id = orderId ? Number.parseInt(orderId, 10) : NaN;
  const { data, isLoading, isError, isFetching, error, refetch } = useGetMyOrderQuery(id, {
    skip: !Number.isFinite(id),
    refetchOnMountOrArgChange: true,
  });

  const lineSlugs = useMemo(() => {
    if (!data?.lines?.length) {
      return [];
    }
    const seen = new Set<string>();
    const out: string[] = [];
    for (const line of data.lines) {
      const s = line.productSlug.trim().toLowerCase();
      if (s && !seen.has(s)) {
        seen.add(s);
        out.push(line.productSlug.trim());
      }
    }
    return out;
  }, [data?.lines]);

  const { data: cardsPage, isFetching: cardsFetching } = useWishlistProductCardsQuery(
    { slugs: lineSlugs },
    { skip: lineSlugs.length === 0 },
  );

  const cardBySlug = useMemo(() => {
    const m = new Map<string, ProductCardDto>();
    for (const p of cardsPage?.content ?? []) {
      m.set(p.slug.trim().toLowerCase(), p);
    }
    return m;
  }, [cardsPage?.content]);

  if (!Number.isFinite(id)) {
    return (
      <div className="min-h-[40vh] bg-white">
        <div className="mb-5">
          <AccountInlineNav />
        </div>
        <p className="text-sm text-red-700">Nepoznata porudžbina.</p>
        <Link
          to="/account/porudzbine"
          className="mt-4 inline-block text-sm font-medium text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
        >
          Nazad na porudžbine
        </Link>
      </div>
    );
  }

  const showLineSkeleton = Boolean(data?.lines.length) && cardsFetching && !cardsPage;
  const deliveryNoteRaw = data?.deliverySummaryText?.trim() ?? '';
  const deliveryNote = deliveryNoteRaw ? stripHtmlToPlainText(deliveryNoteRaw) : '';

  return (
    <div className="min-h-[50vh] bg-white">
      <Helmet>
        <title>{`Porudžbina #${id} — Moj nalog`}</title>
      </Helmet>

      <div className="mb-5">
        <AccountInlineNav />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <nav className="text-xs text-neutral-600" aria-label="Putanja">
          <Link to="/" className="hover:text-neutral-900 hover:underline">
            Početna
          </Link>
          <span className="mx-1.5 text-neutral-400">/</span>
          <Link to="/account" className="hover:text-neutral-900 hover:underline">
            Moj nalog
          </Link>
          <span className="mx-1.5 text-neutral-400">/</span>
          <Link to="/account/porudzbine" className="hover:text-neutral-900 hover:underline">
            Porudžbine
          </Link>
          <span className="mx-1.5 text-neutral-400">/</span>
          <span className="text-neutral-900">#{id}</span>
        </nav>
        <Link
          to="/account/porudzbine"
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-sm transition-colors hover:border-neutral-400 hover:bg-neutral-50"
        >
          <span aria-hidden>←</span> Sve porudžbine
        </Link>
      </div>

      {isLoading || (isFetching && !data) ? (
        <div className="space-y-8" aria-busy>
          <div className="animate-pulse space-y-3">
            <div className="h-8 w-56 rounded bg-neutral-200" />
            <div className="h-4 w-full max-w-lg rounded bg-neutral-100" />
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:p-6">
            <OrderLinesSkeleton rows={3} />
          </div>
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-900">
          <p className="font-medium">Porudžbina nije učitana</p>
          <p className="mt-2 text-red-800/90">
            Proverite da ste prijavljeni istim nalogom koji je koristio za kupovinu. Ako je porudžbina tuđa ili ne
            postoji, API je vraća grešku.
          </p>
          <p className="mt-2 text-xs text-red-800/80">{parseApiError(error).message}</p>
          <button
            type="button"
            className="mt-4 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-900 hover:bg-red-50"
            onClick={() => void refetch()}
          >
            Pokušaj ponovo
          </button>
        </div>
      ) : null}

      {data ? (
        <>
          <header className="mb-8 border-b border-neutral-200 pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${orderStatusBadgeClass(data.status)}`}
              >
                {data.status}
              </span>
            </div>
            <h1 className="mt-3 font-serif text-3xl font-normal tracking-tight text-neutral-900 md:text-[2rem]">
              Porudžbina #{data.id}
            </h1>
            <p className="mt-2 text-sm text-neutral-600">{fmtDate.format(new Date(data.createdAt))}</p>
          </header>

          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_minmax(0,300px)] lg:gap-12 xl:max-w-6xl">
            <div className="min-w-0">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Stavke</h2>
              <div
                className={`mt-3 rounded-xl border border-neutral-200 bg-white px-4 py-1 shadow-sm sm:px-6 ${
                  cardsFetching && cardsPage ? 'opacity-90 transition-opacity' : ''
                }`}
              >
                {showLineSkeleton ? (
                  <OrderLinesSkeleton rows={Math.min(Math.max(data.lines.length, 1), 5)} />
                ) : (
                  <ul className="divide-y divide-neutral-100">
                    {data.lines.map((line) => (
                      <OrderLineRow
                        key={line.id}
                        line={line}
                        card={cardBySlug.get(line.productSlug.trim().toLowerCase())}
                      />
                    ))}
                  </ul>
                )}
                <div className="flex justify-end border-t border-neutral-200 py-4">
                  <p className="text-base font-semibold tabular-nums text-neutral-900">
                    Ukupno: {formatRsd(data.total)}
                  </p>
                </div>
              </div>
            </div>

            <aside className="space-y-6 lg:pt-7">
              <section className="rounded-xl border border-neutral-200 bg-neutral-50/90 p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Plaćanje</h2>
                <p className="mt-2 text-sm font-medium text-neutral-900">{formatPaymentLabel(data.paymentProvider)}</p>
                <p className="mt-1 text-xs text-neutral-600">{formatPaymentStatus(data.paymentStatus)}</p>
              </section>
              <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Isporuka</h2>
                <p className="mt-3 text-sm font-medium text-neutral-900">{data.recipientName}</p>
                <p className="text-sm text-neutral-600">{data.recipientPhone}</p>
                <p className="mt-4 text-sm leading-relaxed text-neutral-800">
                  {data.addressLine1}
                  {data.addressLine2 ? `, ${data.addressLine2}` : ''}
                  <br />
                  {data.postalCode} {data.city}, {data.countryCode}
                </p>
                {deliveryNote ? (
                  <div className="mt-4 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Napomena</p>
                    <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-neutral-700">{deliveryNote}</p>
                  </div>
                ) : null}
              </section>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
