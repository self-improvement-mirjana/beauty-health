import { useEffect, useState } from 'react';

import { readWishlistItems, WISHLIST_CHANGED_EVENT } from '@/lib/wishlistLocal';

export function useWishlistCount(): number {
  const [n, setN] = useState(() => readWishlistItems().length);

  useEffect(() => {
    function sync() {
      setN(readWishlistItems().length);
    }
    window.addEventListener(WISHLIST_CHANGED_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(WISHLIST_CHANGED_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return n;
}
