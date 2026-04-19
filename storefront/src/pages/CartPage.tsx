import { Link } from 'react-router-dom';

import { useAppSelector } from '@/app/hooks';
import { ErrorState } from '@/components/ErrorState';
import { WishlistProductThumb } from '@/components/WishlistProductThumb';
import { isLoggedInForUi } from '@/features/auth/authPresence';
import { selectAccessToken } from '@/features/auth/authSlice';
import {
  useDeleteCartItemMutation,
  useGetCartQuery,
  usePatchCartItemMutation,
} from '@/features/api/cartEndpoints';
import type { CartItemDto } from '@/features/cart/types';
import { formatRsd } from '@/lib/money';

function stavkeUKorpiLabel(count: number): string {
  const n10 = count % 10;
  const n100 = count % 100;
  if (n10 === 1 && n100 !== 11) {
    return `${count} stavka u korpi`;
  }
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) {
    return `${count} stavke u korpi`;
  }
  return `${count} stavki u korpi`;
}

function CartLineRow({
  line,
  patching,
  deleting,
  onDec,
  onInc,
  onRemove,
}: {
  line: CartItemDto;
  patching: boolean;
  deleting: boolean;
  onDec: () => void;
  onInc: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex gap-4 border-b border-neutral-200/90 py-6 last:border-b-0 sm:gap-6">
      <Link
        to={`/p/${encodeURIComponent(line.productSlug)}`}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-white sm:h-28 sm:w-28"
        aria-label={`Pogledaj ${line.productName}`}
      >
        <WishlistProductThumb slug={line.productSlug} />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-[0.9375rem] font-semibold leading-snug text-neutral-900 sm:text-base">
            <Link
              to={`/p/${encodeURIComponent(line.productSlug)}`}
              className="hover:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2"
            >
              {line.productName}
            </Link>
          </h2>
          {line.variantLabel ? (
            <p className="mt-1.5 text-xs font-normal text-neutral-500">{line.variantLabel}</p>
          ) : null}
          <p className="mt-1 text-xs text-neutral-400">SKU {line.sku}</p>
          <p className="mt-2 text-sm text-neutral-600">
            <span className="text-neutral-500">Cena po komadu </span>
            {formatRsd(line.unitPrice)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center rounded border border-neutral-300 bg-white">
              <button
                type="button"
                disabled={patching || line.quantity <= 1}
                onClick={onDec}
                className="px-3 py-2 text-sm text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Smanji količinu"
              >
                −
              </button>
              <span className="min-w-[2.25rem] text-center text-sm tabular-nums text-neutral-900">{line.quantity}</span>
              <button
                type="button"
                disabled={patching}
                onClick={onInc}
                className="px-3 py-2 text-sm text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Povećaj količinu"
              >
                +
              </button>
            </div>
            <button
              type="button"
              disabled={deleting}
              onClick={onRemove}
              className="text-xs font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-neutral-900 hover:decoration-neutral-600 disabled:opacity-40"
            >
              Ukloni
            </button>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start sm:items-end sm:pt-0.5">
          <p className="text-base font-semibold tabular-nums text-neutral-900 sm:text-[1.05rem]">
            {formatRsd(line.lineTotal)}
          </p>
        </div>
      </div>
    </li>
  );
}

export function CartPage() {
  const accessToken = useAppSelector(selectAccessToken);
  const authenticated = isLoggedInForUi(accessToken);
  const { data, isLoading, isError, error, refetch } = useGetCartQuery();
  const [patchItem, { isLoading: patching }] = usePatchCartItemMutation();
  const [deleteItem, { isLoading: deleting }] = useDeleteCartItemMutation();

  if (isLoading) {
    return (
      <div
        className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-neutral-50"
        aria-busy="true"
      >
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="animate-pulse">
            <div className="flex justify-between gap-4">
              <div className="h-8 w-48 rounded bg-neutral-200" />
              <div className="hidden h-5 w-32 rounded bg-neutral-200 sm:block" />
            </div>
            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-12">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="flex gap-4 border-b border-neutral-100 pb-6">
                  <div className="h-28 w-28 shrink-0 rounded bg-neutral-200" />
                  <div className="min-w-0 flex-1 space-y-2 pt-1">
                    <div className="h-4 max-w-[14rem] rounded bg-neutral-200" />
                    <div className="h-3 max-w-[10rem] rounded bg-neutral-200" />
                    <div className="h-8 w-32 rounded bg-neutral-200" />
                  </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <div className="h-28 w-28 shrink-0 rounded bg-neutral-200" />
                  <div className="min-w-0 flex-1 space-y-2 pt-1">
                    <div className="h-4 max-w-[12rem] rounded bg-neutral-200" />
                    <div className="h-3 w-40 rounded bg-neutral-200" />
                  </div>
                </div>
              </div>
              <div className="h-64 rounded-lg bg-white shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  if (data.empty || data.items.length === 0) {
    return (
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-neutral-50">
        <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6 sm:py-20">
          <h1 className="text-2xl font-light tracking-tight text-neutral-900 sm:text-[1.75rem]">Vaša korpa je prazna</h1>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Kada dodate proizvode, pojaviće se ovde — isto kao u prodavnici na mreži koju poznajete.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex min-h-[2.75rem] min-w-[12rem] items-center justify-center rounded-full bg-neutral-900 px-8 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2"
          >
            Nastavi kupovinu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">Korpa</p>
            <h1 className="mt-1 text-2xl font-light tracking-tight text-neutral-900 sm:text-[1.75rem]">
              Pregled korpe </h1>
            <p className="mt-1 text-sm text-neutral-600">{stavkeUKorpiLabel(data.totalQuantity)}</p>
          </div>
          <Link
            to="/shop"
            className="self-start text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-900 sm:self-auto"
          >
            Nastavi kupovinu
          </Link>
        </div>

        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[1fr_min(100%,380px)] lg:items-start lg:gap-10 xl:gap-14">
          <div className="rounded-lg border border-neutral-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="border-b border-neutral-100 px-4 py-4 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Proizvodi u korpi</p>
            </div>
            <ul className="px-4 sm:px-6">
              {data.items.map((line) => (
                <CartLineRow
                  key={line.id}
                  line={line}
                  patching={patching}
                  deleting={deleting}
                  onDec={() =>
                    void patchItem({ itemId: line.id, body: { quantity: line.quantity - 1 } }).unwrap()
                  }
                  onInc={() =>
                    void patchItem({ itemId: line.id, body: { quantity: line.quantity + 1 } }).unwrap()
                  }
                  onRemove={() => void deleteItem(line.id).unwrap()}
                />
              ))}
            </ul>
          </div>

          <aside className="rounded-lg border border-neutral-200/80 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:p-6 lg:sticky lg:top-[calc(var(--site-header-height,5rem)+1rem)] lg:self-start">
            <h2 className="text-sm font-semibold text-neutral-900">Rezime porudžbine</h2>
            <p className="mt-1 text-xs text-neutral-500">Cene u RSD. Dostava i konačan iznos na sledećem koraku.</p>

            <div className="mt-6 space-y-3 border-b border-neutral-100 pb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Međuzbir ({data.totalQuantity})</span>
                <span className="tabular-nums text-neutral-900">{formatRsd(data.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Dostava</span>
                <span className="text-neutral-500">Na kasi</span>
              </div>
            </div>

            <div className="mt-5 flex justify-between text-base font-semibold text-neutral-900">
              <span>Procenjeno ukupno</span>
              <span className="tabular-nums">{formatRsd(data.subtotal)}</span>
            </div>

            <div className="mt-6 rounded-md border border-dashed border-neutral-200 bg-neutral-50/80 px-3 py-3 text-center">
              <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500">Promotivni kod</p>
              <p className="mt-1 text-xs text-neutral-500">Unos kodova uskoro na kasi.</p>
            </div>

            {authenticated ? (
              <Link
                to="/checkout"
                className="mt-6 flex min-h-[3rem] w-full items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/25 focus-visible:ring-offset-2"
              >
                Nastavi na plaćanje
              </Link>
            ) : (
              <div className="mt-6 space-y-3">
                <p className="text-center text-xs leading-relaxed text-neutral-600">
                  Za poručivanje je potrebna prijava.
                </p>
                <Link
                  to={`/login?next=${encodeURIComponent('/checkout')}`}
                  className="flex min-h-[3rem] w-full items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/25 focus-visible:ring-offset-2"
                >
                  Prijavite se da nastavite
                </Link>
              </div>
            )}

            <p className="mt-5 text-center text-[11px] leading-relaxed text-neutral-400">
              Bezbedna kupovina · Povrat prema uslovima prodaje
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
