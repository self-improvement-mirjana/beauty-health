import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { ErrorState } from '@/components/ErrorState';
import type { CategoryTreeNodeDto } from '@/features/catalog/types';
import { findCategoryBySlug } from '@/lib/categoryTree';
import type { ShopBrandOption, ShopCategoryOption } from '@/lib/shopListingOptions';

export type { ShopBrandOption, ShopCategoryOption } from '@/lib/shopListingOptions';

function FilterAccordion({
  title,
  titleExtra,
  defaultOpen = false,
  children,
}: {
  title: string;
  titleExtra?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="group border-b border-neutral-200/90 last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 pr-0.5 text-left outline-none [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-[0.9375rem] font-bold leading-snug tracking-tight text-neutral-900">{title}</span>
          {titleExtra}
        </span>
        <svg
          className="h-3 w-3 shrink-0 text-neutral-900 transition-transform duration-200 group-open:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.25}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="pb-4 pt-0.5">{children}</div>
    </details>
  );
}

function PlaceholderNote({ children }: { children: ReactNode }) {
  return <p className="py-1 text-xs leading-relaxed text-neutral-500">{children}</p>;
}

function categoryToggleCls(unavailable: boolean | undefined) {
  return [
    'flex items-start gap-2.5 py-1.5 text-sm leading-snug',
    unavailable ? 'cursor-not-allowed text-neutral-400' : 'cursor-pointer text-neutral-800',
  ].join(' ');
}

function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function StarGlyphs({ filled }: { filled: number }) {
  return (
    <span className="text-[0.85rem] leading-none tracking-tight text-amber-500" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i}>{i < filled ? '\u2605' : '\u2606'}</span>
      ))}
    </span>
  );
}

/** Višestruki facet (OR na backendu); čekiranje ne gazi ostale izbore. */
function FacetCheckRow({
  name,
  slug,
  checked,
  unavailable,
  onFacetToggle,
}: {
  name: string;
  slug: string;
  checked: boolean;
  unavailable?: boolean;
  onFacetToggle: (slug: string) => void;
}) {
  return (
    <label className={categoryToggleCls(unavailable)}>
      <input
        type="checkbox"
        checked={checked}
        disabled={unavailable}
        onChange={() => onFacetToggle(slug)}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 bg-white text-neutral-900 focus:ring-neutral-400 disabled:opacity-40"
      />
      <span>
        {name}
        {unavailable ? <span className="ml-1 text-xs text-neutral-500">(uskoro)</span> : null}
      </span>
    </label>
  );
}

type Props = {
  tree: CategoryTreeNodeDto[] | undefined;
  categoryOptions: ShopCategoryOption[];
  brandOptions: ShopBrandOption[];
  selectedCategorySlug: string;
  /** Slug-ovi iz leve kolone (tip kože, stanje…); backend: categoryFacet, OR. */
  selectedFacetSlugs: string[];
  onFacetToggle: (slug: string) => void;
  selectedBrandSlug: string;
  selectedRatingMin: number | null;
  onRatingMinChange: (value: number | null) => void;
  featuredOnly: boolean;
  treeLoading: boolean;
  treeError: boolean;
  treeErr: unknown;
  brandsLoading: boolean;
  brandsError: boolean;
  brandsErr: unknown;
  onRetryTree: () => void;
  onRetryBrands: () => void;
  onCategoryChange: (slug: string) => void;
  onBrandChange: (slug: string) => void;
  onFeaturedChange: (value: boolean) => void;
  onClearCategory: () => void;
  onClearBrand: () => void;
  onClearAll: () => void;
  /** Na /shop: true. Na /category/:slug kategorija je u putanji — ne računa se u „Obriši sve“. */
  countCategoryForActiveFilters?: boolean;
  /** Na /category/:slug sakriti „Reset kategorije“ (kontekst je uvek iz URL putanje). */
  showCategoryResetButton?: boolean;
  /** Faza 2: uključuje `categoryFacet` iz sačuvanog tipa kože (profil). */
  primeniProfilUkljuceno?: boolean;
  mozePrimenaProfila?: boolean;
  onPrimeniProfilChange?: (ukljuceno: boolean) => void;
  /** Nazivi opcija sa profila (npr. „Masna koža“) za prikaz pored čekboksa. */
  profilFacetLabele?: string[];
};

export function ShopListingFilters({
  tree,
  categoryOptions,
  brandOptions,
  selectedCategorySlug,
  selectedFacetSlugs,
  onFacetToggle,
  selectedBrandSlug,
  selectedRatingMin,
  onRatingMinChange,
  featuredOnly,
  treeLoading,
  treeError,
  treeErr,
  brandsLoading,
  brandsError,
  brandsErr,
  onRetryTree,
  onRetryBrands,
  onCategoryChange,
  onBrandChange,
  onFeaturedChange,
  onClearCategory,
  onClearBrand,
  onClearAll,
  countCategoryForActiveFilters = true,
  showCategoryResetButton = true,
  primeniProfilUkljuceno = false,
  mozePrimenaProfila = false,
  onPrimeniProfilChange,
  profilFacetLabele = [],
}: Props) {
  const [brandSearch, setBrandSearch] = useState('');
  const [brandListExpanded, setBrandListExpanded] = useState(false);
  const selectedLower = selectedCategorySlug.toLowerCase();
  const facetLowerSet = useMemo(
    () => new Set(selectedFacetSlugs.map((s) => s.toLowerCase())),
    [selectedFacetSlugs],
  );

  const tipKozeChildren = useMemo(() => {
    const node = tree?.length ? findCategoryBySlug(tree, 'tip-koze') : null;
    const ch = node?.children ?? [];
    return [...ch].sort((a, b) => a.name.localeCompare(b.name, 'sr'));
  }, [tree]);

  const stanjeKozeChildren = useMemo(() => {
    const node = tree?.length ? findCategoryBySlug(tree, 'stanje-koze') : null;
    const ch = node?.children ?? [];
    return [...ch].sort((a, b) => a.name.localeCompare(b.name, 'sr'));
  }, [tree]);

  const kosaChildren = useMemo(() => {
    const node = tree?.length ? findCategoryBySlug(tree, 'kosa') : null;
    const ch = node?.children ?? [];
    return [...ch].sort((a, b) => a.name.localeCompare(b.name, 'sr'));
  }, [tree]);

  const hasActiveFilters =
    (countCategoryForActiveFilters ? Boolean(selectedCategorySlug) : false) ||
    selectedFacetSlugs.length > 0 ||
    Boolean(selectedBrandSlug) ||
    featuredOnly ||
    selectedRatingMin != null ||
    primeniProfilUkljuceno;

  const brandSearchNorm = normalizeForSearch(brandSearch);
  const brandsFiltered = useMemo(() => {
    if (!brandSearchNorm) {
      return brandOptions;
    }
    return brandOptions.filter((b) => normalizeForSearch(b.name).includes(brandSearchNorm));
  }, [brandOptions, brandSearchNorm]);

  const BRAND_PREVIEW = 12;
  const brandsVisible = brandListExpanded ? brandsFiltered : brandsFiltered.slice(0, BRAND_PREVIEW);
  const showBrandMoreControl = brandsFiltered.length > BRAND_PREVIEW;

  const beautyPrefsExtra = (
    <>
      <span
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-neutral-400 text-[9px] font-bold text-neutral-600"
        title="Predlozi na osnovu podešavanja naloga"
      >
        i
      </span>
      <span className="rounded-full bg-neutral-900 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
        Novo
      </span>
    </>
  );

  return (
    <div className="w-full rounded-2xl border border-neutral-200 bg-white shadow-md ring-1 ring-black/5">
      <div className="sticky top-0 z-[1] flex items-center justify-between gap-2 border-b border-neutral-200 bg-white px-4 py-3">
        <h2 className="text-base font-bold text-neutral-900">Filteri</h2>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-semibold text-neutral-700 underline-offset-2 hover:text-neutral-900 hover:underline"
          >
            Obriši sve
          </button>
        ) : null}
      </div>

      <div className="px-4">
        <FilterAccordion title="Dostava i preuzimanje">
          <div className="space-y-3">
            <label className="flex cursor-not-allowed items-start gap-2.5 text-sm text-neutral-400">
              <input type="checkbox" disabled className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300" />
              <span>Ista dostava (uskoro)</span>
            </label>
            <label className="flex cursor-not-allowed items-start gap-2.5 text-sm text-neutral-400">
              <input type="checkbox" disabled className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300" />
              <span>Standardna isporuka (uskoro)</span>
            </label>
            <PlaceholderNote>Zip / grad i opcije kao na Sephori biće dostupni kada povežemo logistiku.</PlaceholderNote>
          </div>
        </FilterAccordion>

        {/* Preferencije profila + listing */}
        <FilterAccordion title="Preferencije sa profila" titleExtra={beautyPrefsExtra}>
          {mozePrimenaProfila && onPrimeniProfilChange ? (
            <>
              <label className={categoryToggleCls(false)}>
                <input
                  type="checkbox"
                  checked={primeniProfilUkljuceno}
                  onChange={(e) => onPrimeniProfilChange(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 bg-white text-neutral-900 focus:ring-neutral-400"
                />
                <span>
                  Primeni moje preference (tip kože)
                  {profilFacetLabele.length > 0 ? (
                    <span className="text-neutral-600"> — {profilFacetLabele.join(', ')}</span>
                  ) : null}
                </span>
              </label>
              <PlaceholderNote>
                Sužava listu proizvoda kao da ste u filteru „Tip kože“ označili istu vrednost sa profila. Možete isključiti u bilo kom trenutku.
              </PlaceholderNote>
            </>
          ) : (
            <PlaceholderNote>
              Prijavite se i sačuvajte tip kože na stranici preferenci da bismo ovde mogli da predložimo odgovarajući facet.
            </PlaceholderNote>
          )}
          {!mozePrimenaProfila ? (
            <Link
              to="/account/preferencije"
              className="mt-2 inline-block text-xs font-semibold text-[rgb(0,76,151)] hover:underline"
            >
              Otvori podešavanja: Preferencije lepote
            </Link>
          ) : null}
          <label className={`${categoryToggleCls(false)} mt-4 border-t border-neutral-100 pt-4`}>
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => onFeaturedChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 bg-white text-neutral-900 focus:ring-neutral-400"
            />
            <span>Istaknuti u ponudi</span>
          </label>
        </FilterAccordion>

        <FilterAccordion title="Raspon cene">
          <PlaceholderNote>
            Filter po cenama uskoro. Do tada koristite sortiranje iznad liste (cena rastuće / opadajuće).
          </PlaceholderNote>
        </FilterAccordion>

        <FilterAccordion title="Brend">
          {brandsLoading ? <p className="py-2 text-sm text-neutral-500">Učitavanje…</p> : null}
          {brandsError ? (
            <div className="py-2">
              <ErrorState error={brandsErr} onRetry={onRetryBrands} />
            </div>
          ) : null}
          {!brandsLoading && !brandsError ? (
            <>
              <div className="relative mb-3">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.2-4.2M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" />
                </svg>
                <input
                  type="search"
                  value={brandSearch}
                  onChange={(e) => {
                    setBrandSearch(e.target.value);
                    setBrandListExpanded(false);
                  }}
                  placeholder="Pretraži brend"
                  className="w-full rounded-md border border-neutral-300 bg-white py-2 pl-9 pr-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                  autoComplete="off"
                />
              </div>
              <ul className="max-h-60 space-y-0.5 overflow-y-auto overscroll-contain pr-1">
                {brandsVisible.map((brand) => {
                  const checked =
                    selectedBrandSlug !== '' && selectedBrandSlug.toLowerCase() === brand.slug.toLowerCase();
                  const disabled = Boolean(brand.unavailable);
                  return (
                    <li key={brand.id}>
                      <label
                        className={[
                          'flex items-baseline gap-2 py-1.5 text-sm leading-snug',
                          disabled ? 'cursor-not-allowed text-neutral-400' : 'cursor-pointer',
                        ].join(' ')}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => {
                            if (!disabled) {
                              onBrandChange(checked ? '' : brand.slug);
                            }
                          }}
                          className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 bg-white text-neutral-900 focus:ring-neutral-400 disabled:opacity-40"
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className={[
                              'font-medium',
                              disabled ? 'text-neutral-400' : 'text-[rgb(0,76,151)]',
                            ].join(' ')}
                          >
                            {brand.name}
                          </span>
                          {brand.unavailable ? (
                            <span className="ml-1 text-xs text-neutral-500">(uskoro)</span>
                          ) : null}
                          <span className="whitespace-nowrap text-neutral-500">
                            {' '}
                            ({brand.productCount})
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {showBrandMoreControl ? (
                <button
                  type="button"
                  onClick={() => setBrandListExpanded((e) => !e)}
                  className="mt-2 text-sm font-semibold text-[rgb(0,76,151)] hover:underline"
                >
                  {brandListExpanded ? 'Prikaži manje' : 'Prikaži više'}
                </button>
              ) : null}
              {selectedBrandSlug ? (
                <button
                  type="button"
                  onClick={onClearBrand}
                  className="mt-2 text-xs font-semibold text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
                >
                  Reset brenda
                </button>
              ) : null}
            </>
          ) : null}
        </FilterAccordion>

        <FilterAccordion title="Ocena">
          <div className="space-y-0.5" role="radiogroup" aria-label="Minimalna prosečna ocena">
            <label className="flex cursor-pointer items-center gap-2.5 py-2 text-sm text-neutral-800">
              <input
                type="radio"
                name="shop-rating-min"
                checked={selectedRatingMin === null}
                onChange={() => onRatingMinChange(null)}
                className="h-4 w-4 shrink-0 border-neutral-300 text-neutral-900 focus:ring-neutral-400"
              />
              <span>Bilo koja ocena</span>
            </label>
            {[4, 3, 2, 1].map((n) => (
              <label
                key={n}
                className="flex cursor-pointer items-center gap-2.5 py-2 text-sm text-neutral-800"
              >
                <input
                  type="radio"
                  name="shop-rating-min"
                  checked={selectedRatingMin === n}
                  onChange={() => onRatingMinChange(n)}
                  className="h-4 w-4 shrink-0 border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                />
                <StarGlyphs filled={n} />
                <span className="text-neutral-800">
                  {n} i više
                </span>
              </label>
            ))}
          </div>
        </FilterAccordion>

        {stanjeKozeChildren.length > 0 ? (
          <FilterAccordion title="Brige za kožu">
            <ul className="space-y-0.5">
              {stanjeKozeChildren.map((child) => (
                <li key={child.id}>
                  <FacetCheckRow
                    name={child.name}
                    slug={child.slug}
                    checked={facetLowerSet.has(child.slug.toLowerCase())}
                    onFacetToggle={onFacetToggle}
                  />
                </li>
              ))}
            </ul>
          </FilterAccordion>
        ) : null}

        <FilterAccordion title="Preferencije pri kupovini">
          <PlaceholderNote>Besplatna dostava, poklon uz porudžbinu i slično — proširenja uskoro.</PlaceholderNote>
        </FilterAccordion>

        {tipKozeChildren.length > 0 ? (
          <FilterAccordion title="Tip kože">
            <ul className="space-y-0.5">
              {tipKozeChildren.map((child) => (
                <li key={child.id}>
                  <FacetCheckRow
                    name={child.name}
                    slug={child.slug}
                    checked={facetLowerSet.has(child.slug.toLowerCase())}
                    onFacetToggle={onFacetToggle}
                  />
                </li>
              ))}
            </ul>
          </FilterAccordion>
        ) : null}

        <FilterAccordion title="Preferencije sastojaka">
          <PlaceholderNote>Bez parfema, vegan, bez alkohola i sl. — povezaćemo sa katalogom u narednoj fazi.</PlaceholderNote>
        </FilterAccordion>

        <FilterAccordion title="Uzrast">
          <PlaceholderNote>Preporuke po uzrastu uskoro.</PlaceholderNote>
        </FilterAccordion>

        {kosaChildren.length > 0 ? (
          <FilterAccordion title="Brige za kosu">
            <ul className="space-y-0.5">
              {kosaChildren.map((child) => (
                <li key={child.id}>
                  <FacetCheckRow
                    name={child.name}
                    slug={child.slug}
                    checked={facetLowerSet.has(child.slug.toLowerCase())}
                    onFacetToggle={onFacetToggle}
                  />
                </li>
              ))}
            </ul>
          </FilterAccordion>
        ) : null}

        <FilterAccordion title="Formulacija">
          <PlaceholderNote>Kreme, serumi, ulja… — grupisanje po teksturi uskoro.</PlaceholderNote>
        </FilterAccordion>

        <FilterAccordion title="Veličina">
          <PlaceholderNote>Putna, punopotpuna… uskoro.</PlaceholderNote>
        </FilterAccordion>

        <FilterAccordion title="Zaštita od sunca">
          <ul className="space-y-0.5">
            <li>
              <FacetCheckRow
                name="SPF i zaštita od sunca"
                slug="zastita-od-sunca"
                checked={facetLowerSet.has('zastita-od-sunca')}
                onFacetToggle={onFacetToggle}
              />
            </li>
          </ul>
        </FilterAccordion>

        <FilterAccordion title="Rasprodaja">
          <ul className="space-y-0.5">
            <li>
              <FacetCheckRow
                name="Outlet"
                slug="outlet"
                checked={facetLowerSet.has('outlet')}
                onFacetToggle={onFacetToggle}
              />
            </li>
            <li>
              <FacetCheckRow
                name="Popust do -50%"
                slug="popusti-do-50"
                checked={facetLowerSet.has('popusti-do-50')}
                onFacetToggle={onFacetToggle}
              />
            </li>
          </ul>
        </FilterAccordion>

        <FilterAccordion title="Prednosti">
          <PlaceholderNote>Hidratacija, anti-age, sjaj… kao filteri uskoro.</PlaceholderNote>
        </FilterAccordion>

        <FilterAccordion title="Tekstura kose">
          <PlaceholderNote>Koristite sekciju „Brige za kosu“ ili kategoriju Kosa u listi ispod.</PlaceholderNote>
        </FilterAccordion>

        <FilterAccordion title="Sve kategorije">
          {treeLoading ? <p className="py-2 text-sm text-neutral-500">Učitavanje…</p> : null}
          {treeError ? (
            <div className="py-2">
              <ErrorState error={treeErr} onRetry={onRetryTree} />
            </div>
          ) : null}
          {categoryOptions.length ? (
            <ul className="max-h-64 space-y-0.5 overflow-y-auto overscroll-contain pr-1">
              {categoryOptions.map((category) => {
                const checked =
                  selectedLower !== '' && selectedLower === category.slug.toLowerCase();
                return (
                  <li key={category.id}>
                    <label
                      className={categoryToggleCls(category.unavailable)}
                      style={{ paddingLeft: `${category.depth * 12}px` }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={category.unavailable}
                        onChange={() => onCategoryChange(checked ? '' : category.slug)}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 bg-white text-neutral-900 focus:ring-neutral-400 disabled:opacity-40"
                      />
                      <span>
                        {category.name}
                        {category.unavailable ? (
                          <span className="ml-1 text-xs text-neutral-500">(uskoro)</span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : !treeLoading && !treeError ? (
            <p className="py-2 text-sm text-neutral-500">Nema kategorija.</p>
          ) : null}
          {selectedCategorySlug && showCategoryResetButton ? (
            <button
              type="button"
              onClick={onClearCategory}
              className="mt-2 text-xs font-semibold text-neutral-600 underline-offset-2 hover:text-neutral-900 hover:underline"
            >
              Reset kategorije
            </button>
          ) : null}
        </FilterAccordion>
      </div>
    </div>
  );
}
