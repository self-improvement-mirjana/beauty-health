import { useMemo, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';

import { useAppSelector } from '@/app/hooks';
import { LICE_MEGA_COLUMNS } from '@/config/referenceMegaNav';
import { selectAccessToken } from '@/features/auth/authSlice';
import { hasBrowserAuthToken } from '@/features/auth/authPresence';
import { useCategoryTreeQuery } from '@/features/api/catalogEndpoints';
import type { CategoryTreeNodeDto } from '@/features/catalog/types';
import { getBrowserAuthTokenSnapshot, subscribeAuthSessionChanged } from '@/lib/authSession';
import { chunkCategoryChildren } from '@/lib/chunkCategoryChildren';
import { findCategoryBySlug } from '@/lib/categoryTree';

function shopCategoryHref(slug: string): string {
  return `/category/${encodeURIComponent(slug)}`;
}

/**
 * Spolja: `pointer-events-none` (puna širina) da PLP levo/desno ne drži hover.
 * `z-40` ispod headera (`z-50`) da transparentni sloj ne „pojede“ klik na „Lice“ / kategorije na crnoj traci.
 * `top` tačno ispod headera — most je `pt-*` unutar `megaHitAreaCls` (interaktivno), bez negativnog `top` preko trake.
 */
const megaOverlayCls =
  'pointer-events-none invisible fixed left-0 right-0 z-40 flex justify-center px-3 opacity-0 transition-opacity duration-150 group-hover:visible group-hover:opacity-100 top-[var(--site-header-height,7rem)]';

/**
 * Nevidljivi most ispod trigera: `megaOverlay` je `fixed` pa ne širi `.group` za hit-test.
 * Bez ovoga, pri spuštanju miša sa linka `group-hover` se gasi i panel nestane pre nego što stigneš do njega.
 * Ista širina kao mega panel (centrirano na triggeru).
 */
const megaHoverBridgeCls =
  'pointer-events-none absolute left-1/2 top-full z-[45] h-8 w-[min(72rem,calc(100vw-1.5rem))] -translate-x-1/2 group-hover:pointer-events-auto';

/** Uska kolona + gornji most ispod trake (veći `pt` ako je zazor do panela) */
const megaHitAreaCls =
  'pointer-events-none w-full max-w-[min(72rem,calc(100vw-1.5rem))] pt-8 group-hover:pointer-events-auto';

const megaPanelInnerCls =
  'overflow-hidden rounded-sm border border-neutral-200 border-t-2 border-t-neutral-900 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)]';

const megaPanelWidthCls = 'w-full';

/** Jednake kolone na lg+; na užem ekranu2 pa 1 kolona — bez preklapanja teksta */
const megaGridCls =
  'grid grid-cols-1 items-start gap-x-12 gap-y-10 px-8 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-14 lg:px-10 lg:py-10';

const megaColumnCls = 'flex min-h-0 flex-col gap-10';

const megaGroupTitleCls =
  'mb-3 border-b border-neutral-900 pb-2 text-[11px] font-bold uppercase leading-tight tracking-[0.12em] text-neutral-900';

const megaLinkCls =
  'block break-words py-1.5 text-[13px] leading-snug text-neutral-800 outline-none transition-colors hover:text-neutral-950 hover:underline focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2';

const megaFooterCls = 'border-t border-neutral-200 bg-neutral-50 px-8 py-4 lg:px-10';

const subLinkCls =
  'block rounded px-1 py-0.5 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900';

function navClasses(dark: boolean) {
  return {
    trigger: dark
      ? 'inline-flex items-center rounded-md px-3 py-2 text-sm font-normal tracking-normal text-white transition-colors hover:bg-white/10 hover:text-white'
      : 'inline-flex items-center rounded-md px-2 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900',
    simple: dark
      ? 'rounded-md px-3 py-2 text-sm font-normal tracking-normal text-white transition-colors hover:bg-white/10 hover:text-white'
      : 'rounded-md px-2 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900',
  };
}

function LiceMegaMenu({ dark }: { dark: boolean }) {
  const { trigger: navTriggerCls } = navClasses(dark);

  return (
    <div className="group relative flex shrink-0 items-center self-stretch">
      <Link to={shopCategoryHref('lice')} className={navTriggerCls}>
        Lice
      </Link>
      <div className={megaHoverBridgeCls} aria-hidden />
      <div className={megaOverlayCls} role="navigation" aria-label="Podkategorije Lice">
        <div className={megaHitAreaCls}>
          <div className={`${megaPanelInnerCls} ${megaPanelWidthCls}`}>
          <div className={megaGridCls}>
            {LICE_MEGA_COLUMNS.map((column, ci) => (
              <div key={ci} className={megaColumnCls}>
                {column.map((group) => (
                  <div key={group.title} className="min-h-0 min-w-0">
                    <p className={megaGroupTitleCls}>{group.title}</p>
                    <ul className="space-y-0.5">
                      {group.links.map((l) => (
                        <li key={l.slug}>
                          <Link to={shopCategoryHref(l.slug)} className={megaLinkCls}>
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className={megaFooterCls}>
            <Link
              to={shopCategoryHref('lice')}
              className="text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline"
            >
              Sva kategorija Lice →
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

function AutoMegaMenu({ label, rootSlug, dark }: { label: string; rootSlug: string; dark: boolean }) {
  const { data: tree } = useCategoryTreeQuery();
  const { trigger: navTriggerCls, simple: navSimpleCls } = navClasses(dark);
  const node = useMemo(
    () => (tree ? findCategoryBySlug(tree, rootSlug) : null),
    [tree, rootSlug],
  );
  const columns = useMemo(() => chunkCategoryChildren(node, 4), [node]);

  if (!columns.length) {
    return (
      <Link to={shopCategoryHref(rootSlug)} className={`${navSimpleCls} inline-flex shrink-0 items-center self-stretch`}>
        {label}
      </Link>
    );
  }

  return (
    <div className="group relative flex shrink-0 items-center self-stretch">
      <Link to={shopCategoryHref(rootSlug)} className={navTriggerCls}>
        {label}
      </Link>
      <div className={megaHoverBridgeCls} aria-hidden />
      <div className={megaOverlayCls} role="navigation" aria-label={`Podkategorije ${label}`}>
        <div className={megaHitAreaCls}>
          <div className={`${megaPanelInnerCls} ${megaPanelWidthCls}`}>
          <div className={megaGridCls}>
            {columns.map((col, i) => (
              <ul key={i} className="list-none space-y-0.5">
                {col.map((c: CategoryTreeNodeDto) => (
                  <li key={c.id} className="min-w-0">
                    <Link to={shopCategoryHref(c.slug)} className={megaLinkCls}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
          <div className={megaFooterCls}>
            <Link
              to={shopCategoryHref(rootSlug)}
              className="text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline"
            >
              Sva kategorija {label} →
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

type SiteMainNavDesktopProps = {
  /** Sephora-style crna traka: beli tekst, hover poluprovidan */
  variant?: 'default' | 'darkRail';
};

export function SiteMainNavDesktop({ variant = 'default' }: SiteMainNavDesktopProps) {
  const dark = variant === 'darkRail';
  const itemShrink = 'shrink-0';
  const railItemCls = `${navClasses(dark).simple} ${itemShrink} inline-flex items-center self-stretch`;
  return (
    <>
      <Link to="/shop" className={railItemCls}>
        Prodavnica
      </Link>
      <LiceMegaMenu dark={dark} />
      <AutoMegaMenu label="Telo" rootSlug="telo" dark={dark} />
      <AutoMegaMenu label="Make-up" rootSlug="make-up" dark={dark} />
      <AutoMegaMenu label="Kosa" rootSlug="kosa" dark={dark} />
      <Link to="/shop" className={railItemCls}>
        Wellness
      </Link>
    </>
  );
}

/** Kratka horizontalna traka za mobilni crni rail (bez mega-menija). */
export function SiteMainNavMobileCategoryRail() {
  const accessToken = useAppSelector(selectAccessToken);
  const storageTokenSnap = useSyncExternalStore(
    subscribeAuthSessionChanged,
    getBrowserAuthTokenSnapshot,
    () => '',
  );
  const authenticated = Boolean(accessToken || storageTokenSnap || hasBrowserAuthToken());
  const railCls =
    'shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-normal tracking-normal text-white/95 transition-colors hover:bg-white/10';
  return (
    <nav
      className="flex w-full gap-1 overflow-x-auto overscroll-x-contain px-3 py-2 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Brzi izbor kategorije"
    >
      <Link to="/shop" className={railCls}>
        Prodavnica
      </Link>
      <Link to={shopCategoryHref('lice')} className={railCls}>
        Lice
      </Link>
      <Link to={shopCategoryHref('telo')} className={railCls}>
        Telo
      </Link>
      <Link to={shopCategoryHref('make-up')} className={railCls}>
        Make-up
      </Link>
      <Link to={shopCategoryHref('kosa')} className={railCls}>
        Kosa
      </Link>
      <Link to="/shop" className={railCls}>
        Wellness
      </Link>
      <Link to="/brands" className={railCls}>
        Brendovi
      </Link>
      {authenticated ? (
        <Link to="/account" className={railCls}>
          Nalog
        </Link>
      ) : (
        <>
          <Link to="/login" className={railCls}>
            Prijava
          </Link>
          <Link to="/register" className={railCls}>
            Registracija
          </Link>
        </>
      )}
    </nav>
  );
}

function flattenLiceLinks(): { label: string; slug: string }[] {
  const out: { label: string; slug: string }[] = [];
  for (const col of LICE_MEGA_COLUMNS) {
    for (const g of col) {
      for (const l of g.links) {
        out.push(l);
      }
    }
  }
  return out;
}

const navSimpleCls =
  'rounded-md px-2 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900';

export function SiteMainNavMobileSection({ onNavigate }: { onNavigate: () => void }) {
  const { data: tree } = useCategoryTreeQuery();

  const teloCols = useMemo(
    () => chunkCategoryChildren(tree ? findCategoryBySlug(tree, 'telo') : null, 1),
    [tree],
  );
  const teloFlat = teloCols.flat();

  const makeupCols = useMemo(
    () => chunkCategoryChildren(tree ? findCategoryBySlug(tree, 'make-up') : null, 1),
    [tree],
  );
  const makeupFlat = makeupCols.flat();

  const kosaCols = useMemo(
    () => chunkCategoryChildren(tree ? findCategoryBySlug(tree, 'kosa') : null, 1),
    [tree],
  );
  const kosaFlat = kosaCols.flat();

  const liceFlat = flattenLiceLinks();

  return (
    <div className="flex flex-col gap-3 border-t border-neutral-200 pt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Kategorije</p>
      <Link to="/shop" className={navSimpleCls} onClick={onNavigate}>
        Prodavnica
      </Link>

      <details className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1">
        <summary className="cursor-pointer py-2 text-sm font-medium text-neutral-900">Lice</summary>
        <ul className="max-h-64 space-y-1 overflow-y-auto pb-2 pl-2">
          <li>
            <Link
              to={shopCategoryHref('lice')}
              className={`${subLinkCls} font-medium text-neutral-900`}
              onClick={onNavigate}
            >
              Sve — Lice
            </Link>
          </li>
          {liceFlat.map((l) => (
            <li key={l.slug}>
              <Link to={shopCategoryHref(l.slug)} className={subLinkCls} onClick={onNavigate}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </details>

      <details className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1">
        <summary className="cursor-pointer py-2 text-sm font-medium text-neutral-900">Telo</summary>
        <ul className="max-h-64 space-y-1 overflow-y-auto pb-2 pl-2">
          <li>
            <Link
              to={shopCategoryHref('telo')}
              className={`${subLinkCls} font-medium text-neutral-900`}
              onClick={onNavigate}
            >
              Sve — Telo
            </Link>
          </li>
          {teloFlat.map((c) => (
            <li key={c.id}>
              <Link to={shopCategoryHref(c.slug)} className={subLinkCls} onClick={onNavigate}>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </details>

      <details className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1">
        <summary className="cursor-pointer py-2 text-sm font-medium text-neutral-900">Make-up</summary>
        <ul className="max-h-64 space-y-1 overflow-y-auto pb-2 pl-2">
          <li>
            <Link
              to={shopCategoryHref('make-up')}
              className={`${subLinkCls} font-medium text-neutral-900`}
              onClick={onNavigate}
            >
              Sve — Make-up
            </Link>
          </li>
          {makeupFlat.map((c) => (
            <li key={c.id}>
              <Link to={shopCategoryHref(c.slug)} className={subLinkCls} onClick={onNavigate}>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </details>

      <details className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1">
        <summary className="cursor-pointer py-2 text-sm font-medium text-neutral-900">Kosa</summary>
        <ul className="max-h-64 space-y-1 overflow-y-auto pb-2 pl-2">
          <li>
            <Link
              to={shopCategoryHref('kosa')}
              className={`${subLinkCls} font-medium text-neutral-900`}
              onClick={onNavigate}
            >
              Sve — Kosa
            </Link>
          </li>
          {kosaFlat.map((c) => (
            <li key={c.id}>
              <Link to={shopCategoryHref(c.slug)} className={subLinkCls} onClick={onNavigate}>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </details>

      <Link to="/shop" className={navSimpleCls} onClick={onNavigate}>
        Wellness
      </Link>
    </div>
  );
}
