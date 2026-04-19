import { useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { BasketIcon } from '@/components/BasketIcon';
import { WishlistProductThumb } from '@/components/WishlistProductThumb';
import { useGetCartQuery } from '@/features/api/cartEndpoints';
import type { CartItemDto } from '@/features/cart/types';
import { usePopoverDock } from '@/hooks/usePopoverDock';
import { formatRsd } from '@/lib/money';

const PREVIEW_MAX = 5;

function CartPreviewRow({ item }: { item: CartItemDto }) {
  const href = `/p/${encodeURIComponent(item.productSlug)}`;
  return (
    <div className="flex gap-3 border-b border-neutral-100 py-3 last:border-b-0">
      <Link
        to={href}
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <WishlistProductThumb slug={item.productSlug} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={href} className="block min-w-0 hover:opacity-80" onClick={(e) => e.stopPropagation()}>
          <p className="line-clamp-2 text-xs font-normal leading-snug text-neutral-800">{item.productName}</p>
        </Link>
        {item.variantLabel ? (
          <p className="mt-0.5 text-[11px] font-light text-neutral-500">{item.variantLabel}</p>
        ) : null}
        <p className="mt-1 text-[11px] text-neutral-500">
          {item.quantity} × {formatRsd(item.unitPrice)}
        </p>
      </div>
      <p className="shrink-0 self-center text-sm font-semibold tabular-nums text-neutral-900">
        {formatRsd(item.lineTotal)}
      </p>
    </div>
  );
}

type Props = {
  /** Broj iz `useGetCartSummaryQuery` u headeru — izbegava dupli polling. */
  totalQuantity: number;
  flyoutOpen: boolean;
  onFlyoutOpen: () => void;
  onFlyoutScheduleClose: () => void;
  onFlyoutCancelClose: () => void;
  onFlyoutCloseNow: () => void;
};

/**
 * Sephora-style mini korpa: hover ispod ikonice, fiksiran panel, ne preklapa nalog ako je z-index ispravan.
 */
export function CartBagPopover({
  totalQuantity,
  flyoutOpen: panelOpen,
  onFlyoutOpen,
  onFlyoutScheduleClose,
  onFlyoutCancelClose,
  onFlyoutCloseNow,
}: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onCartPage = pathname === '/cart';
  const count = totalQuantity;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);

  const { data: cart, isFetching } = useGetCartQuery(undefined, { skip: !panelOpen });

  const dock = usePopoverDock(panelOpen, triggerRef);

  const openPanel = useCallback(() => {
    onFlyoutCancelClose();
    onFlyoutOpen();
  }, [onFlyoutCancelClose, onFlyoutOpen]);

  const handleRootLeave = useCallback(
    (e: React.MouseEvent) => {
      const next = e.relatedTarget as Node | null;
      if (next && rootRef.current?.contains(next)) {
        return;
      }
      onFlyoutScheduleClose();
    },
    [onFlyoutScheduleClose],
  );

  const goCart = useCallback(() => {
    onFlyoutCancelClose();
    onFlyoutCloseNow();
    navigate('/cart');
  }, [onFlyoutCancelClose, onFlyoutCloseNow, navigate]);

  const items = cart?.items ?? [];
  const preview = items.slice(0, PREVIEW_MAX);
  const extra = Math.max(0, items.length - PREVIEW_MAX);

  return (
    <div
      ref={rootRef}
      className="relative flex items-center"
      onMouseEnter={openPanel}
      onMouseLeave={handleRootLeave}
    >
      <Link
        ref={triggerRef}
        to="/cart"
        onMouseDown={onFlyoutCancelClose}
        onClick={() => {
          onFlyoutCancelClose();
          onFlyoutCloseNow();
        }}
        className={[
          'relative z-[1] inline-flex items-center justify-center rounded-md p-2 text-[0.9375rem] font-medium transition-colors',
          onCartPage ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900',
        ].join(' ')}
        aria-label={count > 0 ? `Korpa, ${count} stavki` : 'Korpa'}
        aria-expanded={panelOpen}
      >
        <span className="relative inline-flex text-neutral-800">
          <BasketIcon className="h-6 w-6" />
          <span
            className={
              count > 0
                ? 'absolute -right-1.5 -top-1 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-600 px-0.5 text-[10px] font-semibold leading-none text-white'
                : 'absolute -right-1.5 -top-1 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full border border-neutral-300 bg-white px-0.5 text-[10px] font-medium leading-none text-neutral-500'
            }
          >
            {count > 99 ? '99+' : count}
          </span>
        </span>
      </Link>

      {panelOpen ? (
        <div
          className="pointer-events-auto fixed z-[102] w-[min(26rem,calc(100vw-1.5rem))] opacity-100"
          style={{
            top: dock.top,
            right: dock.right,
          }}
          role="region"
          aria-label="Korpa — pregled"
          onMouseEnter={openPanel}
          onMouseLeave={handleRootLeave}
        >
          <div className="max-h-[min(28rem,calc(100vh-8rem))] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.22)]">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-neutral-900">Korpa</p>
                <p className="mt-0.5 text-[11px] font-light text-neutral-500">
                  {count > 0 ? `${count} ${count === 1 ? 'stavka' : 'stavki'}` : 'Još uvek prazno'}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 text-left text-xs font-medium text-[rgb(0,76,151)] hover:underline"
                onClick={goCart}
              >
                Pogledaj korpu
              </button>
            </div>

            <div className="px-4 pb-3 pt-2">
              {isFetching && !cart ? (
                <p className="py-8 text-center text-xs text-neutral-500">Učitavanje…</p>
              ) : !cart || cart.empty || items.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs leading-relaxed text-neutral-600">
                    Još nema stavki. Dodajte proizvode iz prodavnice.
                  </p>
                  <Link
                    to="/shop"
                    className="mt-4 inline-flex rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Kupovina
                  </Link>
                </div>
              ) : (
                <>
                  <div className="max-h-[min(18rem,50vh)] overflow-y-auto overscroll-contain pr-0.5">
                    {preview.map((item) => (
                      <CartPreviewRow key={item.id} item={item} />
                    ))}
                    {extra > 0 ? (
                      <p className="py-2 text-center text-[11px] text-neutral-500">
                        Još {extra} u korpi —{' '}
                        <button type="button" className="font-medium text-[rgb(0,76,151)] hover:underline" onClick={goCart}>
                          prikaži sve
                        </button>
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-3 border-t border-neutral-100 pt-3">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium text-neutral-700">Ukupno (procena)</span>
                      <span className="font-semibold tabular-nums text-neutral-900">{formatRsd(cart.subtotal)}</span>
                    </div>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        className="flex-1 rounded-full border border-neutral-300 bg-white py-2.5 text-center text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                        onClick={goCart}
                      >
                        Korpa
                      </button>
                      <Link
                        to="/checkout"
                        className="flex-1 rounded-full bg-[rgb(0,76,151)] py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-95"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Na plaćanje
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
