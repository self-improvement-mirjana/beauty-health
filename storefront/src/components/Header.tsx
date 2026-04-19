import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useAppSelector } from '@/app/hooks';
import { useGetCartSummaryQuery } from '@/features/api/cartEndpoints';
import { selectAccessToken } from '@/features/auth/authSlice';
import { hasBrowserAuthToken, menuAuthUser } from '@/features/auth/authPresence';
import { useLogoutAction } from '@/features/auth/useLogoutAction';
import {
  SiteMainNavDesktop,
  SiteMainNavMobileCategoryRail,
  SiteMainNavMobileSection,
} from '@/components/SiteMainNav';
import { AccountMenuPopover } from '@/components/AccountMenuPopover';
import { CartBagPopover } from '@/components/CartBagPopover';
import { WishlistHeartPopover } from '@/components/WishlistHeartPopover';
import { selectAuthUser } from '@/features/auth/authSlice';
import { getBrowserAuthTokenSnapshot, subscribeAuthSessionChanged } from '@/lib/authSession';

const navClsTop = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-2.5 py-2 text-[0.9375rem] font-medium transition-colors',
    isActive ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
  ].join(' ');

const navClsRail = ({ isActive }: { isActive: boolean }) =>
  [
    'shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-normal tracking-normal transition-colors',
    isActive ? 'bg-white/15 text-white' : 'text-white/90 hover:bg-white/10 hover:text-white',
  ].join(' ');

const secondaryNav = [
  { to: '/brands', label: 'Brendovi' },
  { to: '/blog', label: 'Blog' },
  { to: '/locations', label: 'Lokacije' },
] as const;

/** Jedan otvoren panel u desnoj traci (nalog / lista / korpa) — kao na Sephori, bez preklapanja. */
type HeaderFlyoutId = 'account' | 'wishlist' | 'cart';

const HEADER_FLYOUT_CLOSE_MS = 280;

export function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const accessToken = useAppSelector(selectAccessToken);
  const authUser = useAppSelector(selectAuthUser);
  const storageTokenSnap = useSyncExternalStore(
    subscribeAuthSessionChanged,
    getBrowserAuthTokenSnapshot,
    () => '',
  );
  /**
   * U kodu postoji AccountMenuPopover između pretrage i srca, ali se renderuje samo kad je ovo true.
   * Ako ste gost (nema tokena u Redux-u/storage-u), ovde je false — između pretrage i srca nema profila.
   * storageTokenSnap + hasBrowserAuthToken pokrivaju trenutak pre nego što Redux uhvati sesiju iz storage-a.
   */
  const authenticated = Boolean(accessToken || storageTokenSnap || hasBrowserAuthToken());
  const accountUser = menuAuthUser(authUser);
  const logout = useLogoutAction();
  const { data: cartSummary } = useGetCartSummaryQuery(undefined, {
    pollingInterval: 45_000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const count = cartSummary?.totalQuantity ?? 0;
  const [q, setQ] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerFlyout, setHeaderFlyout] = useState<HeaderFlyoutId | null>(null);
  const flyoutCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHeaderFlyoutClose = useCallback(() => {
    if (flyoutCloseTimerRef.current != null) {
      clearTimeout(flyoutCloseTimerRef.current);
      flyoutCloseTimerRef.current = null;
    }
  }, []);

  const scheduleHeaderFlyoutClose = useCallback(() => {
    cancelHeaderFlyoutClose();
    flyoutCloseTimerRef.current = setTimeout(() => {
      setHeaderFlyout(null);
      flyoutCloseTimerRef.current = null;
    }, HEADER_FLYOUT_CLOSE_MS);
  }, [cancelHeaderFlyoutClose]);

  const openHeaderFlyout = useCallback(
    (id: HeaderFlyoutId) => {
      cancelHeaderFlyoutClose();
      setHeaderFlyout(id);
    },
    [cancelHeaderFlyoutClose],
  );

  const closeHeaderFlyoutNow = useCallback(() => {
    cancelHeaderFlyoutClose();
    setHeaderFlyout(null);
  }, [cancelHeaderFlyoutClose]);

  useEffect(() => () => cancelHeaderFlyoutClose(), [cancelHeaderFlyoutClose]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) {
      return;
    }
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setMobileOpen(false);
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  useEffect(() => {
    const root = document.documentElement;
    const el = headerRef.current;
    if (!el) {
      return;
    }
    function sync() {
      const h = headerRef.current;
      if (!h) {
        return;
      }
      root.style.setProperty('--site-header-height', `${h.getBoundingClientRect().height}px`);
    }
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener('resize', sync);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', sync);
    };
  }, []);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 overflow-visible">
      <div className="border-b border-neutral-200 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="mx-auto flex w-full max-w-[90rem] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 sm:py-3.5 md:flex-nowrap md:gap-5 md:py-3.5 lg:gap-8 lg:px-10 lg:py-4 xl:gap-10 xl:px-12">
          <Link
            to="/"
            className="order-1 shrink-0 font-sans text-[1.05rem] font-extralight uppercase tracking-[0.32em] text-neutral-900 sm:text-[1.15rem] lg:text-[1.22rem] lg:tracking-[0.34em]"
          >
            Beauty Health
          </Link>

          <form
            onSubmit={onSearch}
            className="order-3 flex min-w-0 w-full flex-1 md:order-2 md:min-w-[12rem] md:max-w-[min(100%,24rem)] lg:max-w-[min(100%,28rem)] xl:max-w-[min(100%,30rem)] xl:pr-2"
            role="search"
          >
            <label htmlFor="global-search" className="sr-only">
              Pretraga proizvoda
            </label>
            <div className="group flex h-9 w-full items-center rounded-full border border-neutral-300 bg-white px-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-[box-shadow,border-color,min-height] duration-200 ease-out focus-within:border-neutral-900 focus-within:shadow-md focus-within:outline-none md:h-10 md:px-3.5 md:focus-within:h-11">
              <span
                className="mr-2 inline-flex shrink-0 transition-opacity duration-200 group-focus-within:hidden md:mr-2.5"
                aria-hidden
              >
                <svg
                  className="h-3.5 w-3.5 text-neutral-400 md:h-4 md:w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path strokeLinecap="round" d="M21 21l-4.2-4.2M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" />
                </svg>
              </span>
              <input
                id="global-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pretraga"
                autoComplete="off"
                className="bh-header-search-input min-w-0 flex-1 rounded-none border-0 bg-transparent py-1.5 pr-0.5 text-[0.9375rem] font-normal leading-snug tracking-normal text-neutral-900 shadow-none outline-none ring-0 transition-[font-size,font-weight,letter-spacing,color] duration-200 ease-out placeholder:text-neutral-400 placeholder-shown:text-sm placeholder-shown:font-normal placeholder-shown:tracking-normal placeholder-shown:text-neutral-500 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:text-[0.9375rem] focus:font-normal focus:tracking-normal focus:placeholder:text-neutral-400 focus:placeholder-shown:text-[0.9375rem] focus:placeholder-shown:font-normal focus:placeholder-shown:tracking-normal md:py-2 md:text-[1rem] md:focus:text-[1rem] md:focus:placeholder-shown:text-[1rem]"
              />
            </div>
          </form>

          <nav
            className="order-2 ml-auto flex shrink-0 items-center gap-1 md:order-3 md:ml-0 md:gap-3 md:pl-4 lg:gap-5 lg:pl-6"
            aria-label="Nalog i korpa"
          >
            {authenticated ? (
              <div className="flex shrink-0 items-center">
                <AccountMenuPopover
                  user={accountUser}
                  onLogout={() => void logout()}
                  flyoutOpen={headerFlyout === 'account'}
                  onFlyoutOpen={() => openHeaderFlyout('account')}
                  onFlyoutScheduleClose={scheduleHeaderFlyoutClose}
                  onFlyoutCancelClose={cancelHeaderFlyoutClose}
                  onFlyoutCloseNow={closeHeaderFlyoutNow}
                />
              </div>
            ) : (
              <div className="flex shrink-0 items-center gap-0.5 border-l border-neutral-200 pl-2 sm:gap-1 sm:pl-3 md:pl-4">
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    [
                      'whitespace-nowrap rounded-md px-2 py-2 text-[12px] font-semibold text-neutral-900 transition-colors sm:text-[13px]',
                      isActive ? 'bg-neutral-200' : 'hover:bg-neutral-100',
                    ].join(' ')
                  }
                >
                  Prijavi se
                </NavLink>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    [
                      'whitespace-nowrap rounded-md px-1.5 py-2 text-[11px] font-medium text-neutral-600 transition-colors sm:px-2 sm:text-[13px]',
                      isActive ? 'bg-neutral-200 text-neutral-900' : 'hover:bg-neutral-100 hover:text-neutral-900',
                    ].join(' ')
                  }
                >
                  Registracija
                </NavLink>
              </div>
            )}
            <WishlistHeartPopover
              flyoutOpen={headerFlyout === 'wishlist'}
              onFlyoutOpen={() => openHeaderFlyout('wishlist')}
              onFlyoutScheduleClose={scheduleHeaderFlyoutClose}
              onFlyoutCancelClose={cancelHeaderFlyoutClose}
              onFlyoutCloseNow={closeHeaderFlyoutNow}
            />
            <CartBagPopover
              totalQuantity={count}
              flyoutOpen={headerFlyout === 'cart'}
              onFlyoutOpen={() => openHeaderFlyout('cart')}
              onFlyoutScheduleClose={scheduleHeaderFlyoutClose}
              onFlyoutCancelClose={cancelHeaderFlyoutClose}
              onFlyoutCloseNow={closeHeaderFlyoutNow}
            />
            <button
              type="button"
              className="rounded-sm border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 md:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              Meni
            </button>
          </nav>
        </div>
      </div>

      <div className="overflow-visible border-b border-neutral-800 bg-neutral-950 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
        <div className="relative flex w-full items-center overflow-visible px-4 sm:px-8 lg:px-12 xl:px-16">
          <nav
            className="mx-auto hidden min-h-[2.75rem] w-full max-w-[90rem] items-stretch py-0.5 md:flex lg:min-h-[2.875rem]"
            aria-label="Prodavnica i kategorije"
          >
            <div className="min-w-0 flex-1 self-stretch" aria-hidden="true" />
            <div className="flex min-w-0 shrink-0 flex-nowrap items-stretch justify-center gap-x-2 md:gap-x-5 lg:gap-x-7">
              <SiteMainNavDesktop variant="darkRail" />
            </div>
            <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-1">
              {secondaryNav.map((item) => (
                <NavLink key={item.to} to={item.to} className={`${navClsRail} shrink-0`}>
                  {item.label}
                </NavLink>
              ))}
              {!authenticated ? (
                <>
                  <NavLink to="/login" className={`${navClsRail} shrink-0`}>
                    Prijavi se
                  </NavLink>
                  <NavLink to="/register" className={`${navClsRail} shrink-0`}>
                    Registracija
                  </NavLink>
                </>
              ) : null}
            </div>
          </nav>
          <SiteMainNavMobileCategoryRail />
        </div>
      </div>

      {mobileOpen ? (
        <div id="mobile-menu" className="border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
          <SiteMainNavMobileSection onNavigate={closeMobile} />
          <nav className="mt-3 flex flex-col gap-1" aria-label="Mobilna navigacija">
            {secondaryNav.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClsTop} onClick={() => setMobileOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            {authenticated ? (
              <>
                <NavLink to="/account" className={navClsTop} onClick={() => setMobileOpen(false)}>
                  Nalog
                </NavLink>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    void logout();
                  }}
                  className="rounded-md px-2 py-1.5 text-left text-sm font-medium text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  Odjava
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClsTop} onClick={() => setMobileOpen(false)}>
                  Prijava
                </NavLink>
                <NavLink to="/register" className={navClsTop} onClick={() => setMobileOpen(false)}>
                  Registracija
                </NavLink>
              </>
            )}
            <NavLink to="/lista-zelja" className={navClsTop} onClick={() => setMobileOpen(false)}>
              Lista želja
            </NavLink>
            <NavLink to="/cart" className={navClsTop} onClick={() => setMobileOpen(false)}>
              Korpa ({count})
            </NavLink>
          </nav>
          <form onSubmit={onSearch} className="mt-4 flex flex-col gap-2" role="search">
            <label htmlFor="mobile-search" className="sr-only">
              Pretraga proizvoda
            </label>
            <div className="group flex min-h-[2.75rem] items-center rounded-full border border-neutral-300 bg-white px-3 py-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,min-height] duration-200 ease-out focus-within:border-neutral-900 focus-within:shadow-md focus-within:outline-none focus-within:py-3">
              <span className="mr-2 inline-flex shrink-0 transition-opacity duration-200 group-focus-within:hidden" aria-hidden>
                <svg
                  className="h-4 w-4 text-neutral-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path strokeLinecap="round" d="M21 21l-4.2-4.2M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" />
                </svg>
              </span>
              <input
                id="mobile-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pretraga"
                className="bh-header-search-input min-w-0 flex-1 rounded-none border-0 bg-transparent py-0 pr-0.5 text-[0.9375rem] font-normal leading-snug tracking-normal text-neutral-900 shadow-none outline-none ring-0 transition-[font-size,font-weight,letter-spacing,color] duration-200 ease-out placeholder:text-neutral-400 placeholder-shown:text-sm placeholder-shown:font-normal placeholder-shown:tracking-normal placeholder-shown:text-neutral-500 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 focus:text-[0.9375rem] focus:font-normal focus:tracking-normal focus:placeholder:text-neutral-400 focus:placeholder-shown:text-[0.9375rem] focus:placeholder-shown:font-normal focus:placeholder-shown:tracking-normal"
              />
            </div>
            <button
              type="submit"
              disabled={!q.trim()}
              className="rounded-full bg-neutral-900 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Traži
            </button>
          </form>
        </div>
      ) : null}
    </header>
  );
}
