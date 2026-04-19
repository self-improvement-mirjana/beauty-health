import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

import { useAddCartItemMutation } from '@/features/api/cartEndpoints';
import { parseApiError } from '@/lib/parseApiError';

const LOCK_PREFIX = 'beautyhealth_atc_lock:';

/**
 * `?add-to-cart=<variantId>` (B06): jednokratno dodavanje + banner (spec. 6.3 koristi ID — backend očekuje varijantu).
 */
export function AddToCartSearchParamsBanner() {
  const [, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [addItem] = useAddCartItemMutation();
  const [banner, setBanner] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const addToCartParam = location.search.includes('add-to-cart=')
    ? new URLSearchParams(location.search).get('add-to-cart')
    : null;

  useEffect(() => {
    const raw = addToCartParam;
    if (!raw) {
      return;
    }

    const strip = () =>
      setSearchParams(
        (prev) => {
          const n = new URLSearchParams(prev);
          n.delete('add-to-cart');
          return n;
        },
        { replace: true },
      );

    const lockKey = `${LOCK_PREFIX}${location.pathname}:${raw}`;
    if (sessionStorage.getItem(lockKey)) {
      strip();
      return;
    }
    sessionStorage.setItem(lockKey, '1');
    strip();

    const variantId = Number.parseInt(raw, 10);
    if (!Number.isFinite(variantId)) {
      sessionStorage.removeItem(lockKey);
      setBanner({ kind: 'error', text: 'Parametar add-to-cart mora biti broj (ID varijante).' });
      return;
    }

    void addItem({ variantId, quantity: 1 })
      .unwrap()
      .then(() => setBanner({ kind: 'success', text: 'Proizvod je dodat u korpu.' }))
      .catch((err: unknown) => {
        sessionStorage.removeItem(lockKey);
        setBanner({ kind: 'error', text: parseApiError(err).message });
      });
  }, [addToCartParam, location.pathname, addItem, setSearchParams]);

  if (!banner) {
    return null;
  }

  return (
    <div
      role="status"
      className={`border-b px-4 py-3 text-center text-sm ${
        banner.kind === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
          : 'border-red-200 bg-red-50 text-red-900'
      }`}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 sm:px-6">
        <span>{banner.text}</span>
        <button
          type="button"
          onClick={() => setBanner(null)}
          className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs font-medium text-neutral-900 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        >
          Zatvori
        </button>
      </div>
    </div>
  );
}
