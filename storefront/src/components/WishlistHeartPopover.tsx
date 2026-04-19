import { useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { WishlistProductThumb } from '@/components/WishlistProductThumb';
import { usePopoverDock } from '@/hooks/usePopoverDock';
import { useAddCartItemMutation } from '@/features/api/cartEndpoints';
import { useWishlistCount } from '@/hooks/useWishlistCount';
import { useWishlistItems } from '@/hooks/useWishlistItems';
import type { WishlistItem } from '@/lib/wishlistLocal';

export function HeartIcon({ filled, className }: { filled?: boolean; className?: string }) {
  return (
    <svg
      className={className ?? 'h-[1.35rem] w-[1.35rem]'}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

const POPOVER_PREVIEW = 5;

const addToCartPillCls =
  'whitespace-nowrap rounded-full border border-neutral-900 bg-white px-3 py-1.5 text-center text-[11px] font-semibold text-neutral-900 transition hover:bg-neutral-50';

function WishlistPopoverAddButton({
  variantId,
  inStock,
  slug,
}: {
  variantId?: number | null;
  inStock?: boolean;
  slug: string;
}) {
  const [add, { isLoading }] = useAddCartItemMutation();
  const canAdd = typeof variantId === 'number' && inStock === true;

  if (!canAdd) {
    return (
      <Link
        to={`/p/${encodeURIComponent(slug)}`}
        className={addToCartPillCls}
        onClick={(e) => e.stopPropagation()}
      >
        Dodaj u korpu
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={isLoading}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void add({ variantId, quantity: 1 }).unwrap();
      }}
      className={`${addToCartPillCls} disabled:opacity-50`}
    >
      {isLoading ? '…' : 'Dodaj u korpu'}
    </button>
  );
}

function WishlistPreviewRow({ item }: { item: WishlistItem }) {
  const href = `/p/${encodeURIComponent(item.slug)}`;
  const label = item.title || item.slug.replace(/-/g, ' ');

  return (
    <div className="flex gap-3 border-b border-neutral-100 py-3 last:border-b-0">
      <Link
        to={href}
        className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-neutral-200 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <WishlistProductThumb slug={item.slug} storedUrl={item.primaryImageUrl} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={href} className="block min-w-0 hover:opacity-80" onClick={(e) => e.stopPropagation()}>
          {item.brandName ? (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-900">{item.brandName}</p>
          ) : null}
          <p className="mt-0.5 line-clamp-2 text-xs font-normal leading-snug text-neutral-800">{label}</p>
        </Link>
        {item.variantLabel ? (
          <p className="mt-0.5 text-[11px] font-light text-neutral-500">{item.variantLabel}</p>
        ) : null}
        <p className="mt-1 text-[10px] font-light uppercase tracking-wide text-neutral-400">Sačuvano na listi</p>
        {item.priceLabel ? (
          <p className="mt-1 text-sm font-semibold text-neutral-900">{item.priceLabel}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-col items-end justify-center gap-1 self-center">
        <WishlistPopoverAddButton
          slug={item.slug}
          variantId={item.primaryVariantId}
          inStock={item.inStock}
        />
      </div>
    </div>
  );
}

type WishlistFlyoutProps = {
  flyoutOpen: boolean;
  onFlyoutOpen: () => void;
  onFlyoutScheduleClose: () => void;
  onFlyoutCancelClose: () => void;
  onFlyoutCloseNow: () => void;
};

/**
 * Sephora-style: srce + panel ispod celog headera (bez preklapanja crne trake), sa sličicama.
 */
export function WishlistHeartPopover({
  flyoutOpen: panelOpen,
  onFlyoutOpen,
  onFlyoutScheduleClose,
  onFlyoutCancelClose,
  onFlyoutCloseNow,
}: WishlistFlyoutProps) {
  const navigate = useNavigate();
  const count = useWishlistCount();
  const items = useWishlistItems();
  const preview = items.slice(0, POPOVER_PREVIEW);
  const extra = Math.max(0, items.length - POPOVER_PREVIEW);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const dock = usePopoverDock(panelOpen, triggerRef);

  const openPanel = useCallback(() => {
    onFlyoutCancelClose();
    onFlyoutOpen();
  }, [onFlyoutCancelClose, onFlyoutOpen]);

  /** Zatvori samo ako kursor stvarno napušta srce + panel (panel je dete u DOM-u). */
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

  const goWishlist = useCallback(() => {
    onFlyoutCancelClose();
    onFlyoutCloseNow();
    navigate('/lista-zelja');
  }, [onFlyoutCancelClose, onFlyoutCloseNow, navigate]);

  return (
    <div
      ref={rootRef}
      className="relative flex items-center"
      onMouseEnter={openPanel}
      onMouseLeave={handleRootLeave}
    >
      <Link
        ref={triggerRef}
        to="/lista-zelja"
        onMouseDown={onFlyoutCancelClose}
        onClick={() => {
          onFlyoutCancelClose();
          onFlyoutCloseNow();
        }}
        className="relative z-[1] flex items-center justify-center rounded-md p-2 text-neutral-900 transition-colors hover:bg-neutral-100"
        aria-label={count > 0 ? `Lista želja, ${count} proizvoda` : 'Lista želja'}
        aria-expanded={panelOpen}
      >
        <HeartIcon filled={count > 0} />
        {count > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-red-600 px-0.5 text-[10px] font-semibold text-white">
            {count > 99 ? '99+' : count}
          </span>
        ) : null}
      </Link>

      {panelOpen ? (
      <div
        className="pointer-events-auto fixed z-[101] w-[min(26rem,calc(100vw-1.5rem))] opacity-100"
        style={{
          top: dock.top,
          right: dock.right,
        }}
        role="region"
        aria-label="Lista želja — pregled"
        onMouseEnter={openPanel}
        onMouseLeave={handleRootLeave}
      >
        <div className="max-h-[min(24rem,calc(100vh-8rem))] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.22)]">
          <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-neutral-900">Omiljeno</p>
              <p className="mt-0.5 text-[11px] font-light text-neutral-500">Vaša lista u ovom pregledaču</p>
            </div>
            <button
              type="button"
              className="shrink-0 text-left text-xs font-medium text-blue-700 hover:text-blue-900 hover:underline"
              onClick={goWishlist}
            >
              Pogledaj sve
            </button>
          </div>

          <div className="px-4 pb-3 pt-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">Nedavno dodato</p>
              {items.length > 0 ? (
                <button
                  type="button"
                  className="text-[11px] font-medium text-blue-700 hover:underline"
                  onClick={goWishlist}
                >
                  Pogledaj sve
                </button>
              ) : null}
            </div>

            {items.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs leading-relaxed text-neutral-600">
                  Još nema sačuvanih proizvoda. Kliknite na srce na kartici ili stranici proizvoda.
                </p>
                <Link
                  to="/shop"
                  className="mt-4 inline-flex rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-900"
                  onClick={(e) => e.stopPropagation()}
                >
                  Pregledaj prodavnicu
                </Link>
              </div>
            ) : (
              <div className="max-h-[min(18rem,50vh)] overflow-y-auto overscroll-contain pr-0.5">
                {preview.map((item) => (
                  <WishlistPreviewRow key={item.slug} item={item} />
                ))}
                {extra > 0 ? (
                  <p className="py-2 text-center text-[11px] text-neutral-500">
                    Još {extra}{' '}
                    {extra === 1 ? 'stavka' : 'stavki'} —{' '}
                    <button type="button" className="font-medium text-blue-700 hover:underline" onClick={goWishlist}>
                      prikaži sve
                    </button>
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
      ) : null}
    </div>
  );
}
