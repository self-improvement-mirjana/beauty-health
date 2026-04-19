import { useCallback, useEffect, useState } from 'react';

import {
  toggleWishlistSlug,
  type WishlistItem,
  wishlistContains,
  WISHLIST_CHANGED_EVENT,
} from '@/lib/wishlistLocal';

export function useWishlistSlug(slug: string) {
  const [onList, setOnList] = useState(() => (slug ? wishlistContains(slug) : false));

  useEffect(() => {
    if (!slug) {
      setOnList(false);
      return;
    }
    function sync() {
      setOnList(wishlistContains(slug));
    }
    sync();
    window.addEventListener(WISHLIST_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(WISHLIST_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [slug]);

  const toggle = useCallback((meta?: Partial<Omit<WishlistItem, 'slug'>>) => {
    if (!slug) {
      return;
    }
    toggleWishlistSlug(slug, meta);
    setOnList(wishlistContains(slug));
  }, [slug]);

  return { onList, toggle };
}
