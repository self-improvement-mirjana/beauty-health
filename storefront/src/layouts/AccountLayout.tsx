import { NavLink, Outlet, useLocation, useMatches } from 'react-router-dom';

import { useAppSelector } from '@/app/hooks';
import { useLogoutAction } from '@/features/auth/useLogoutAction';
import { selectAuthUser } from '@/features/auth/authSlice';
import { ACCOUNT_ORDER_DETAIL_ROUTE_ID } from '@/lib/accountRouteIds';

const ORDER_DETAIL_PATH_FALLBACK = /(^|\/)account\/porudzbina\/[^/]+/;

const subNavCls = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  ].join(' ');

export function AccountLayout() {
  const user = useAppSelector(selectAuthUser);
  const logout = useLogoutAction();
  const matches = useMatches();
  const { pathname } = useLocation();
  const isOrderDetail =
    matches.some((m) => m.id === ACCOUNT_ORDER_DETAIL_ROUTE_ID) || ORDER_DETAIL_PATH_FALLBACK.test(pathname);

  if (isOrderDetail) {
    return (
      <div className="min-w-0">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Moj nalog</p>
        {user ? (
          <p className="mt-2 truncate text-sm text-neutral-900" title={user.email}>
            {user.fullName}
          </p>
        ) : null}
        <nav className="mt-4 flex flex-col gap-1" aria-label="Podstranice naloga">
          <NavLink to="/account" end className={subNavCls}>
            Pregled
          </NavLink>
          <NavLink to="/account/preferencije" className={subNavCls}>
            Preferencije lepote
          </NavLink>
          <NavLink to="/account/informacije" className={subNavCls}>
            Podaci o nalogu
          </NavLink>
          <NavLink to="/account/porudzbine" className={subNavCls}>
            Porudžbine
          </NavLink>
          <NavLink to="/account/ponovo-kupi" className={subNavCls}>
            Ponovo kupi
          </NavLink>
          <NavLink to="/lista-zelja" className={subNavCls}>
            Lista želja
          </NavLink>
        </nav>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-6 w-full rounded-md border border-neutral-300 bg-white py-2 text-sm text-neutral-800 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        >
          Odjava
        </button>
      </aside>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
