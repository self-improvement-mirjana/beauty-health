import { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/clients', label: 'Klijenti' },
  { to: '/merchants', label: 'Merchant-i' },
  { to: '/transactions', label: 'Transakcije' },
  { to: '/audit', label: 'Audit Log' },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('bank_token');

  useEffect(() => {
    if (!token) navigate('/login', { replace: true });
  }, [token, navigate]);

  if (!token) return null;

  function handleLogout() {
    localStorage.removeItem('bank_token');
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-neutral-200 bg-white">
        <div className="px-4 py-5">
          <h1 className="text-lg font-bold text-neutral-900">Banka Admin</h1>
        </div>
        <nav className="mt-2 space-y-0.5 px-2">
          {navItems.map((item) => {
            const active =
              location.pathname === item.to ||
              (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`block rounded-md px-3 py-2 text-sm font-medium ${active ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-neutral-200 px-4 py-3">
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            Odjavi se
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-neutral-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
