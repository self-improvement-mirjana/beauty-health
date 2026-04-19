import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ErrorState } from '@/components/ErrorState';
import { HeartIcon } from '@/components/WishlistHeartPopover';
import { ProductPdpTabs } from '@/components/ProductPdpTabs';
import { ProductReviewForm } from '@/components/ProductReviewForm';
import { StarRating } from '@/components/StarRating';
import { useAddCartItemMutation } from '@/features/api/cartEndpoints';
import { useGetProductBySlugQuery, useListProductReviewsQuery } from '@/features/api/catalogEndpoints';
import { useWishlistSlug } from '@/hooks/useWishlistSlug';
import {
  initialVariantSelection,
  matchVariant,
  type VariantSelectionState,
} from '@/features/catalog/pdpVariantSelection';
import type { ProductDetailDto, ProductVariantDetailDto } from '@/features/catalog/types';
import { isFetchBaseQueryError } from '@/lib/isFetchBaseQueryError';
import { formatRsd } from '@/lib/money';
import { parseApiError } from '@/lib/parseApiError';
import { stripHtmlToPlainText } from '@/lib/stripHtml';

const SHIPPING_COPY =
  'Porudžbine obrađujemo u roku od 1–3 radna dana. Isporuka je za 4–6 radnih dana. Rokovi se odnose na radne dane i mogu se produžiti u periodu povećanog obima porudžbina.';

const LEGAL_NOTE_COPY =
  'Slike su ilustrativne. Proizvođač zadržava pravo izmene ambalaže i sastava u skladu sa važećim propisima. U slučaju odstupanja informacija na sajtu od deklaracije na proizvodu, merodavna je deklaracija na ambalaži.';

/** Broj recenzija za link ispod zvezdica (kompaktno kao na Sephora: 13,7k). */
function formatReviewCountLinkText(count: number): string {
  if (count < 1000) {
    return `${count} ocena`;
  }
  const k = count / 1000;
  const rounded = Math.round(k * 10) / 10;
  const compact =
    rounded % 1 === 0
      ? String(Math.round(rounded))
      : rounded.toLocaleString('sr-Latn', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${compact}k ocena`;
}

const reviewsAnchorCls =
  'mt-3 inline-flex max-w-full cursor-pointer flex-wrap items-center gap-x-2 gap-y-1 rounded-md text-left text-inherit no-underline outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2';

function PdpWishlistButton({
  product,
  matched,
}: {
  product: ProductDetailDto;
  matched: ProductVariantDetailDto | null;
}) {
  const { onList, toggle } = useWishlistSlug(product.slug);
  function meta() {
    const v = matched ?? (product.variants.length === 1 ? product.variants[0] : null);
    return {
      title: product.title,
      brandName: product.brandName,
      primaryImageUrl: product.primaryImageUrl ?? undefined,
      priceLabel: v ? formatRsd(v.moneySale ?? v.moneyRegular) : undefined,
      primaryVariantId: v?.id,
      inStock: v?.inStock,
      variantLabel: v?.name,
    };
  }
  return (
    <button
      type="button"
      onClick={() => toggle(meta())}
      className={`shrink-0 rounded-full border p-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 ${
        onList
          ? 'border-neutral-900 bg-neutral-50 text-neutral-900'
          : 'border-neutral-200 text-neutral-800 hover:border-neutral-400 hover:bg-white'
      }`}
      aria-label={onList ? 'Ukloni sa liste želja' : 'Sačuvaj na listu želja'}
      aria-pressed={onList}
    >
      <HeartIcon filled={onList} />
    </button>
  );
}

function useProductSeo(product: ProductDetailDto | undefined) {
  useEffect(() => {
    if (!product) {
      return;
    }
    document.title = `${product.title} · Prodavnica`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    const raw = product.shortDescription || product.description;
    const plain = stripHtmlToPlainText(raw);
    meta.setAttribute('content', plain.slice(0, 320) || product.title);
  }, [product]);
}

function ProductReviewsPanel({ slug }: { slug: string }) {
  const { data, isLoading, isError, error, refetch } = useListProductReviewsQuery({ slug });

  if (isLoading) {
    return <p className="text-sm text-neutral-500">Učitavanje recenzija…</p>;
  }
  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }
  const items = data?.content ?? [];
  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">Još nema odobrenih recenzija za ovaj proizvod.</p>;
  }
  return (
    <ul className="space-y-4">
      {items.map((r) => (
        <li key={r.id} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium text-neutral-900">{r.authorName}</p>
            <p className="text-xs text-neutral-500">
              {new Date(r.createdAt).toLocaleDateString('sr-Latn', { dateStyle: 'medium' })}
            </p>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <StarRating rating={r.rating} />
            <span className="text-xs text-neutral-600">{r.rating} / 5</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">{r.body}</p>
        </li>
      ))}
    </ul>
  );
}

export function ProductPage() {
  const { slug: slugParam } = useParams();
  const slug = slugParam ?? '';
  const [addCartItem, { isLoading: addingCart }] = useAddCartItemMutation();
  const [cartLineMsg, setCartLineMsg] = useState<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useGetProductBySlugQuery(slug, { skip: !slug });
  const [variantState, setVariantState] = useState<VariantSelectionState | null>(null);
  const [pdpImgFailed, setPdpImgFailed] = useState(false);

  useEffect(() => {
    if (data) {
      setVariantState(initialVariantSelection(data));
    } else {
      setVariantState(null);
    }
  }, [data]);

  useEffect(() => {
    setPdpImgFailed(false);
  }, [data?.slug, data?.primaryImageUrl]);

  const matched = useMemo(() => {
    if (!data || !variantState) {
      return null;
    }
    return matchVariant(data, variantState);
  }, [data, variantState]);

  useEffect(() => {
    setCartLineMsg(null);
  }, [matched?.id]);

  useProductSeo(data);

  const notFound = isFetchBaseQueryError(error) && error.status === 404;

  function setOptionValue(optionIndex: number, valueId: number) {
    setVariantState((prev) => {
      if (!data || !prev) {
        return prev;
      }
      const nextIds = [...prev.selectedValueIds];
      nextIds[optionIndex] = valueId;
      return { ...prev, selectedValueIds: nextIds };
    });
  }

  function onAddToCart() {
    if (!matched?.inStock) {
      return;
    }
    setCartLineMsg(null);
    void addCartItem({ variantId: matched.id, quantity: 1 })
      .unwrap()
      .then(() => setCartLineMsg('Dodato u korpu.'))
      .catch((e: unknown) => setCartLineMsg(parseApiError(e).message));
  }

  if (!slug) {
    return <p className="text-sm text-red-700">Nedostaje slug proizvoda u URL-u.</p>;
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4" aria-busy="true">
        <div className="h-8 w-2/3 rounded bg-neutral-200" />
        <div className="h-4 w-1/3 rounded bg-neutral-200" />
        <div className="h-24 w-full rounded bg-neutral-200" />
      </div>
    );
  }

  if (isError && notFound) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-neutral-900">Proizvod nije pronađen</h1>
        <p className="text-sm text-neutral-600">Proverite link ili se vratite u prodavnicu.</p>
        <Link to="/shop" className="inline-block text-sm text-neutral-900 underline underline-offset-2 hover:text-neutral-600">
          Nazad u prodavnicu
        </Link>
      </div>
    );
  }

  if (isError || !data || !variantState) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (data.variants.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-neutral-900">{data.title}</h1>
        <p className="text-sm text-neutral-600">Proizvod nema dostupnih varijanti.</p>
        <Link to="/shop" className="text-sm text-neutral-900 underline underline-offset-2 hover:text-neutral-600">
          Nazad u prodavnicu
        </Link>
      </div>
    );
  }

  const product = data;
  const requiresSelection = product.options.length > 0 || product.variants.length > 1;
  const showAddToCart = matched !== null && matched.inStock;
  const showOutOfStock = matched !== null && !matched.inStock;
  const showChooseOptions = requiresSelection && matched === null;

  const shortPlain = stripHtmlToPlainText(product.shortDescription);
  const descriptionPlain = stripHtmlToPlainText(product.description);
  const pdpImageUrl = product.primaryImageUrl?.trim() || null;
  const showPdpImage = Boolean(pdpImageUrl) && !pdpImgFailed;
  const pdpReviewCount = product.reviewCount ?? 0;
  const pdpRatingAvg = product.ratingAverage;
  const pdpHasReviews =
    pdpReviewCount > 0 && typeof pdpRatingAvg === 'number' && Number.isFinite(pdpRatingAvg);

  return (
    <article>
      <nav className="mb-6 text-sm text-neutral-600" aria-label="Putanja">
        <Link to="/shop" className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600">
          Prodavnica
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-neutral-500">{product.title}</span>
      </nav>

      <header className="border-b border-neutral-200 pb-8">
        <div
          className={
            showPdpImage
              ? 'grid gap-8 lg:grid-cols-[minmax(0,480px)_1fr] lg:items-start'
              : 'min-w-0'
          }
        >
          {showPdpImage ? (
            <div className="relative mx-auto aspect-square w-full max-w-lg rounded-xl border border-neutral-200 bg-white lg:mx-0">
              <img
                src={pdpImageUrl!}
                alt=""
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain p-2 sm:p-4"
                onError={() => setPdpImgFailed(true)}
              />
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3 gap-y-2">
              <h1 className="min-w-0 flex-1 text-2xl font-semibold text-neutral-900 md:text-3xl">{product.title}</h1>
              <PdpWishlistButton product={product} matched={matched} />
            </div>
            {pdpHasReviews && pdpRatingAvg != null ? (
              <a href="#recenzije" className={reviewsAnchorCls} aria-label="Idi na recenzije proizvoda">
                <StarRating rating={pdpRatingAvg} size="md" className="shrink-0" />
                <span className="text-sm text-neutral-700">
                  <span className="font-semibold tabular-nums text-neutral-900">{pdpRatingAvg.toFixed(1)}</span>
                  <span className="text-neutral-500"> / 5 · </span>
                  <span className="text-neutral-900 underline underline-offset-2">{formatReviewCountLinkText(pdpReviewCount)}</span>
                </span>
              </a>
            ) : (
              <a href="#recenzije" className={reviewsAnchorCls} aria-label="Idi na recenzije i ocenu proizvoda">
                <StarRating rating={0} size="md" className="shrink-0" />
                <span className="max-w-xl text-sm text-neutral-500">
                  Nema javnog proseka — prikazuje se tek odobrene recenzije.{' '}
                  <span className="text-neutral-900 underline underline-offset-2">Ocenite u kartici Recenzije</span>.
                </span>
              </a>
            )}
            <p className="mt-2 text-sm text-neutral-600">
              Brend:{' '}
              <Link
                to={`/brand/${encodeURIComponent(product.brandSlug)}`}
                className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
              >
                {product.brandName}
              </Link>
            </p>
            {shortPlain ? (
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-neutral-700">{shortPlain}</p>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          {product.options.map((opt, optionIndex) => (
            <fieldset key={opt.name} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <legend className="px-1 text-sm font-medium text-neutral-900">{opt.name}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {opt.values.map((v) => {
                  const selected = variantState.selectedValueIds[optionIndex] === v.id;
                  return (
                    <label
                      key={v.id}
                      className={`cursor-pointer rounded-md border px-3 py-2 text-sm outline-none transition-colors focus-within:ring-2 focus-within:ring-neutral-400 ${
                        selected
                          ? 'border-neutral-900 bg-neutral-100 text-neutral-900'
                          : 'border-neutral-300 text-neutral-700 hover:border-neutral-400'
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name={`option-${product.slug}-${optionIndex}`}
                        checked={selected}
                        onChange={() => setOptionValue(optionIndex, v.id)}
                      />
                      {v.value}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {product.options.length === 0 && product.variants.length > 1 ? (
            <div>
              <label htmlFor="pdp-variant" className="block text-sm font-medium text-neutral-900">
                Varijanta
              </label>
              <select
                id="pdp-variant"
                className="mt-2 w-full max-w-md rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                value={variantState.bareVariantId ?? ''}
                onChange={(e) => {
                  const v = Number.parseInt(e.target.value, 10);
                  setVariantState((prev) =>
                    prev
                      ? {
                          ...prev,
                          bareVariantId: Number.isFinite(v) ? v : null,
                        }
                      : prev,
                  );
                }}
              >
                <option value="">— Odaberite —</option>
                {product.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.sku})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {product.options.length > 0 && variantState.selectedValueIds.every((x) => x != null) && !matched ? (
            <p className="text-sm text-amber-800" role="status">
              Nedostupna kombinacija opcija.
            </p>
          ) : null}
        </div>

        <aside className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:self-start">
          <div>
            {matched?.moneySale ? (
              <p>
                <span className="text-2xl font-semibold text-red-600">{formatRsd(matched.moneySale)}</span>{' '}
                <span className="text-neutral-500 line-through">{formatRsd(matched.moneyRegular)}</span>
              </p>
            ) : matched ? (
              <p className="text-2xl font-semibold text-neutral-900">{formatRsd(matched.moneyRegular)}</p>
            ) : (
              <p className="text-sm text-neutral-500">Izaberite opcije da biste videli cenu.</p>
            )}
          </div>
          <p className="text-sm text-neutral-700">
            Zalihe:{' '}
            <span className={matched?.inStock ? 'font-medium text-emerald-700' : 'font-medium text-red-700'}>
              {matched ? (matched.inStock ? 'Na zalihama' : 'Nema na zalihama') : '—'}
            </span>
          </p>
          {matched?.sku ? (
            <p className="text-xs text-neutral-500">
              SKU: <span className="text-neutral-600">{matched.sku}</span>
            </p>
          ) : null}

          <div className="pt-2">
            {cartLineMsg ? (
              <p
                className={`mb-2 text-xs ${cartLineMsg.startsWith('Dodato') ? 'text-emerald-700' : 'text-red-700'}`}
                role="status"
              >
                {cartLineMsg}
              </p>
            ) : null}
            {showAddToCart ? (
              <button
                type="button"
                onClick={onAddToCart}
                disabled={addingCart}
                className="w-full rounded-md bg-neutral-900 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingCart ? 'Dodavanje…' : 'Dodaj u korpu'}
              </button>
            ) : null}
            {showOutOfStock ? (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-md border border-neutral-200 bg-neutral-100 py-2.5 text-sm text-neutral-500"
              >
                Nema na zalihama
              </button>
            ) : null}
            {showChooseOptions ? (
              <p className="rounded-md border border-neutral-200 bg-neutral-50 py-2.5 text-center text-sm text-neutral-600">
                Odaberite opcije
              </p>
            ) : null}
          </div>
        </aside>
      </div>

      <div id="recenzije" className="scroll-mt-28">
      <ProductPdpTabs
        tabs={[
          {
            id: 'desc',
            label: 'Opis',
            content: (
              <div className="prose prose-sm max-w-none text-neutral-700">
                {descriptionPlain ? (
                  <p className="whitespace-pre-wrap">{descriptionPlain}</p>
                ) : (
                  <p className="text-neutral-500">Nema opisa.</p>
                )}
              </div>
            ),
          },
          {
            id: 'extra',
            label: 'Dodatne informacije',
            content: (
              <div className="text-sm text-neutral-700">
                {product.categories.length > 0 ? (
                  <div>
                    <p className="font-medium text-neutral-900">Kategorije</p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {product.categories.map((c) => (
                        <li key={c.id}>
                          <Link
                            to={`/category/${encodeURIComponent(c.slug)}`}
                            className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-neutral-500">Nema dodatnih informacija.</p>
                )}
              </div>
            ),
          },
          {
            id: 'reviews',
            label: 'Recenzije',
            content: (
              <div className="space-y-10">
                <ProductReviewForm slug={product.slug} />
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">Objavljene recenzije</h3>
                  <div className="mt-4">
                    <ProductReviewsPanel slug={product.slug} />
                  </div>
                </div>
              </div>
            ),
          },
          {
            id: 'shipping',
            label: 'Isporuka',
            content: <p className="text-sm leading-relaxed text-neutral-700">{SHIPPING_COPY}</p>,
          },
          {
            id: 'note',
            label: 'Napomena',
            content: <p className="text-sm leading-relaxed text-neutral-700">{LEGAL_NOTE_COPY}</p>,
          },
        ]}
      />
      </div>
    </article>
  );
}
