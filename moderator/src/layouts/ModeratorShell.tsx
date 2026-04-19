import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearCredentials, selectAuthUser } from '@/features/auth/authSlice';

const navCls = ({ isActive }: { isActive: boolean }) =>
  [
    'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-slate-700 text-amber-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ');

export function ModeratorShell() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector(selectAuthUser);

  function logout() {
    dispatch(clearCredentials());
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <aside className="border-b border-shell-border bg-shell-panel md:w-56 md:border-b-0 md:border-r">
        <div className="border-b border-shell-border px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-500/90">Beauty Health</p>
          <p className="text-lg font-semibold text-white">Moderacija</p>
        </div>
        <nav className="flex flex-row gap-1 overflow-x-auto px-2 py-3 md:flex-col md:overflow-visible">
          <NavLink to="/" end className={navCls}>
            Kontrolna tabla
          </NavLink>
          <NavLink to="/products" className={navCls}>
            Proizvodi
          </NavLink>
          <NavLink to="/brands" className={navCls}>
            Brendovi
          </NavLink>
          <NavLink to="/categories" className={navCls}>
            Kategorije
          </NavLink>
          <NavLink to="/orders" className={navCls}>
            Narudžbine
          </NavLink>
          <NavLink to="/content" className={navCls}>
            Sadržaj
          </NavLink>
          <NavLink to="/users" className={navCls}>
            Korisnici
          </NavLink>
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-shell-border bg-shell-bg px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-slate-400">
              {user?.fullName ? (
                <>
                  <span className="font-medium text-slate-200">{user.fullName}</span>
                  <span className="text-slate-500"> · </span>
                </>
              ) : null}
              <span className="text-slate-500">{user?.email}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="shrink-0 rounded-md border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Odjavi se
          </button>
        </header>
        <main className="flex-1 overflow-auto bg-slate-950 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
