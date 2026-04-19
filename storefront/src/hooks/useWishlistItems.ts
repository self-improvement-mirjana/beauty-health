import { useEffect, useState } from 'react';

import { readWishlistItems, type WishlistItem, WISHLIST_CHANGED_EVENT } from '@/lib/wishlistLocal';

export function useWishlistItems(): WishlistItem[] {
  const [items, setItems] = useState(() => readWishlistItems());

  useEffect(() => {
    function sync() {
      setItems(readWishlistItems());
    }
    window.addEventListener(WISHLIST_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(WISHLIST_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return items;
}
