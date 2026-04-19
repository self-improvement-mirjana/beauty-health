import { NavLink, useLocation, useMatches } from 'react-router-dom';

import { ACCOUNT_ORDER_DETAIL_ROUTE_ID, ACCOUNT_ORDERS_LIST_ROUTE_ID } from '@/lib/accountRouteIds';

const linkCls = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-2 py-1 transition-colors',
    isActive ? 'bg-neutral-200 font-medium text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  ].join(' ');

export function AccountInlineNav() {
  const matches = useMatches();
  const { pathname } = useLocation();
  const onOrdersList = /(^|\/)account\/porudzbine\/?$/.test(pathname);
  const onOrderDetailPath = /(^|\/)account\/porudzbina\/[^/]+/.test(pathname);
  const ordersTabActive =
    matches.some((m) => m.id === ACCOUNT_ORDERS_LIST_ROUTE_ID || m.id === ACCOUNT_ORDER_DETAIL_ROUTE_ID) ||
    onOrdersList ||
    onOrderDetailPath;

  return (
    <nav
      className="flex flex-wrap items-center gap-1 border-b border-neutral-200 pb-3 text-xs sm:text-sm"
      aria-label="Moj nalog — brzi izbor"
    >
      <NavLink to="/account" end className={linkCls}>
        Pregled
      </NavLink>
      <span className="text-neutral-300" aria-hidden>
        ·
      </span>
      <NavLink to="/account/informacije" className={linkCls}>
        Podaci o nalogu
      </NavLink>
      <span className="text-neutral-300" aria-hidden>
        ·
      </span>
      <NavLink
        to="/account/porudzbine"
        className={({ isActive }) => linkCls({ isActive: isActive || ordersTabActive })}
      >
        Porudžbine
      </NavLink>
      <span className="text-neutral-300" aria-hidden>
        ·
      </span>
      <NavLink to="/account/ponovo-kupi" className={linkCls}>
        Ponovo kupi
      </NavLink>
    </nav>
  );
}
