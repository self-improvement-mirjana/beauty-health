import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import type { ProductCardDto } from '@/features/catalog/types';
import { useAddCartItemMutation } from '@/features/api/cartEndpoints';
import { useWishlistSlug } from '@/hooks/useWishlistSlug';
import { formatRsd } from '@/lib/money';
import { parseApiError } from '@/lib/parseApiError';
import { trackAddToCartClick } from '@/lib/analytics/client';
import { HeartIcon } from '@/components/WishlistHeartPopover';
import { StarRating } from '@/components/StarRating';

type Props = {
  product: ProductCardDto;
};

function isCta(v: string): v is ProductCardDto['ctaType'] {
  return v === 'ADD_TO_CART' || v === 'CHOOSE_OPTIONS' || v === 'OUT_OF_STOCK';
}

function ProductCardWishlistHeart({ product }: { product: ProductCardDto }) {
  const { onList, toggle } = useWishlistSlug(product.slug);
  return (
    <button
      type="button"
      title={onList ? 'Ukloni sa liste želja' : 'Dodaj na listu želja'}
      aria-label={onList ? 'Ukloni sa liste želja' : 'Dodaj na listu želja'}
      aria-pressed={onList}
      className={[
        'group/heart absolute right-2.5 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full',
        'text-neutral-800 transition-[background-color,box-shadow] duration-150 ease-out',
        /* Sephora: samo srce u miru; krug (disk) tek na hover/fokusu, unutar image box-a */
        /* Blaga senka unutra — spoljašnji omotač ima overflow-hidden da krug ne „curi“ */
        'bg-transparent shadow-none hover:bg-white/95 hover:shadow-[0_2px_10px_rgba(0,0,0,0.12)]',
        'focus-visible:outline-none focus-visible:bg-white/95 focus-visible:shadow-[0_2px_10px_rgba(0,0,0,0.12)]',
        'active:bg-white/90',
      ].join(' ')}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle({
          title: product.title,
          brandName: product.brandName,
          primaryImageUrl: product.primaryImageUrl ?? undefined,
          priceLabel: formatRsd(product.moneySale ?? product.moneyRegular),
          primaryVariantId: product.primaryVariantId ?? undefined,
          inStock: product.inStock,
        });
      }}
    >
      <HeartIcon
        filled={onList}
        className="h-[1.05rem] w-[1.05rem] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-[filter] duration-150 group-hover/heart:drop-shadow-none group-focus-visible/heart:drop-shadow-none"
      />
    </button>
  );
}

function CartActions({
  cta,
  product,
  adding,
  onAddToCart,
  className,
}: {
  cta: ProductCardDto['ctaType'];
  product: ProductCardDto;
  adding: boolean;
  onAddToCart: () => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {cta === 'ADD_TO_CART' ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAddToCart();
          }}
          disabled={adding || product.primaryVariantId == null}
          className="w-full rounded-sm bg-neutral-900 py-2.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {adding ? 'Dodavanje…' : 'Dodaj u korpu'}
        </button>
      ) : null}
      {cta === 'CHOOSE_OPTIONS' ? (
        <Link
          to={`/p/${encodeURIComponent(product.slug)}`}
          className="block w-full rounded-sm border border-neutral-300 bg-white py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-neutral-900 transition hover:border-neutral-900"
          onClick={(e) => e.stopPropagation()}
        >
          Odaberite opcije
        </Link>
      ) : null}
      {cta === 'OUT_OF_STOCK' ? (
        <p className="py-2 text-center text-xs font-medium text-neutral-400">Nema na zalihama</p>
      ) : null}
    </div>
  );
}

export function ProductCard({ product }: Props) {
  const [addItem, { isLoading: adding }] = useAddCartItemMutation();
  const [cartErr, setCartErr] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);
  const cta: ProductCardDto['ctaType'] = isCta(product.ctaType) ? product.ctaType : 'OUT_OF_STOCK';

  useEffect(() => {
    setImgFailed(false);
  }, [product.primaryImageUrl, product.slug]);

  const thumbUrl = product.primaryImageUrl?.trim() || null;
  const showThumb = Boolean(thumbUrl) && !imgFailed;
  const reviewCount = product.reviewCount ?? 0;
  const ratingAvg = product.ratingAverage;
  const hasReviews =
    reviewCount > 0 && typeof ratingAvg === 'number' && Number.isFinite(ratingAvg);

  function onAddToCart() {
    setCartErr(null);
    const vid = product.primaryVariantId;
    if (vid == null) {
      setCartErr('Nije moguće dodati u korpu bez varijante.');
      return;
    }
    trackAddToCartClick(vid, product.slug);
    void addItem({ variantId: vid, quantity: 1 })
      .unwrap()
      .catch((e: unknown) => {
        setCartErr(parseApiError(e).message);
      });
  }

  return (
    <article className="group relative flex flex-col bg-white">
      <div className="relative">
        {/*
          Omotač sa overflow-hidden seče krug/senku srca tačno na ivici slike.
          Srce nije unutar <Link> (invalidan HTML); link je absolute inset-0 ispod dugmeta.
        */}
        <div className="relative aspect-square w-full min-h-[140px] overflow-hidden bg-white sm:min-h-[180px] md:min-h-[220px] lg:min-h-[260px]">
          <Link
            to={`/p/${encodeURIComponent(product.slug)}`}
            className="absolute inset-0 z-0 block outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral-900/25"
            aria-label={`${product.title} — detalji proizvoda`}
          >
            {showThumb ? (
              <img
                src={thumbUrl!}
                alt=""
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain p-1 transition-transform duration-300 ease-out group-hover:scale-[1.02] sm:p-1.5 md:p-2"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center bg-neutral-50 text-xs text-neutral-400">
                Nema slike
              </span>
            )}
          </Link>

          <ProductCardWishlistHeart product={product} />
        </div>

        {/* Desktop: akcije ispod slike, vidljive na hover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden md:block">
          <div className="pointer-events-auto translate-y-full bg-white/95 px-2 pb-2 pt-1 opacity-0 shadow-[0_-6px_16px_rgba(0,0,0,0.06)] backdrop-blur-sm transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <CartActions
              cta={cta}
              product={product}
              adding={adding}
              onAddToCart={onAddToCart}
              className="space-y-1.5"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <p className="order-1 text-[13px] font-semibold leading-tight text-neutral-900">
          <Link
            to={`/brand/${encodeURIComponent(product.brandSlug)}`}
            className="hover:underline hover:decoration-neutral-400"
          >
            {product.brandName}
          </Link>
        </p>
        <h2 className="order-2 mt-1 text-[13px] font-normal leading-snug text-neutral-900">
          <Link
            to={`/p/${encodeURIComponent(product.slug)}`}
            className="line-clamp-2 hover:text-neutral-600 focus:outline-none"
          >
            {product.title}
          </Link>
        </h2>
        <div className="order-3 mt-1.5 flex min-h-[1.35rem] flex-wrap items-center gap-x-2 gap-y-0.5">
          <StarRating rating={hasReviews ? ratingAvg : 0} size="md" />
          {hasReviews ? (
            <>
              <span className="text-[12px] font-semibold tabular-nums text-neutral-900">{ratingAvg.toFixed(1)}</span>
              <span className="text-[11px] tabular-nums text-neutral-600">/5 · {reviewCount}</span>
            </>
          ) : (
            <span className="text-[11px] text-neutral-500">Nema ocena</span>
          )}
        </div>
        <div className="order-4 mt-2 text-sm">
          {product.moneySale ? (
            <p>
              <span className="font-semibold text-neutral-900">{formatRsd(product.moneySale)}</span>{' '}
              <span className="text-sm font-normal text-neutral-400 line-through">{formatRsd(product.moneyRegular)}</span>
            </p>
          ) : (
            <p className="font-semibold text-neutral-900">{formatRsd(product.moneyRegular)}</p>
          )}
        </div>

        {cartErr ? <p className="order-5 mt-2 text-xs text-red-600">{cartErr}</p> : null}

        <div className="order-6 mt-3 md:hidden">
          <CartActions
            cta={cta}
            product={product}
            adding={adding}
            onAddToCart={onAddToCart}
            className="space-y-2"
          />
        </div>
      </div>
    </article>
  );
}
