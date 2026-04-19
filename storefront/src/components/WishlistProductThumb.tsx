import { useEffect, useState } from 'react';

import { useGetProductBySlugQuery } from '@/features/api/catalogEndpoints';
import { mergeWishlistItemMeta } from '@/lib/wishlistLocal';
import { resolveMediaUrl } from '@/lib/resolveMediaUrl';

type Props = {
  slug: string;
  storedUrl?: string;
  className?: string;
  imgClassName?: string;
};

/**
 * Prikaz sličice sa liste želja: koristi sačuvani URL, dopunjava relativne putanje,
 * ili povlači proizvod sa API-ja ako nema slike (npr. stara lista samo sa slug-om).
 */
export function WishlistProductThumb({ slug, storedUrl, className, imgClassName }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const resolvedStored = resolveMediaUrl(storedUrl);
  const shouldFetch = Boolean(slug) && !resolvedStored;
  const { data } = useGetProductBySlugQuery(slug, { skip: !shouldFetch });
  const fromApi = resolveMediaUrl(data?.primaryImageUrl);
  const src = resolvedStored || fromApi;

  useEffect(() => {
    setImgFailed(false);
  }, [slug, storedUrl, fromApi]);

  useEffect(() => {
    if (!data?.primaryImageUrl?.trim() || resolvedStored) {
      return;
    }
    mergeWishlistItemMeta(slug, { primaryImageUrl: data.primaryImageUrl });
  }, [slug, data?.primaryImageUrl, resolvedStored]);

  const showImg = Boolean(src) && !imgFailed;

  return (
    <span className={`relative block h-full w-full ${className ?? ''}`}>
      {showImg ? (
        <img
          src={src!}
          alt=""
          className={imgClassName ?? 'h-full w-full object-contain p-0.5'}
          loading="lazy"
          decoding="async"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center bg-neutral-50 text-[9px] text-neutral-400">
          Nema
        </span>
      )}
    </span>
  );
}
