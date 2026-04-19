import { NavLink, Outlet } from 'react-router-dom';

const tabCls = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-slate-700 text-amber-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ');

export function ContentLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Sadržaj</h1>
        <p className="mt-1 text-sm text-slate-400">
          CMS stranice, maloprodajne lokacije i blog (B09 admin API). Izmene su vidljive na storefront-u posle snimanja.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-3">
        <NavLink to="/content/cms" className={tabCls}>
          CMS stranice
        </NavLink>
        <NavLink to="/content/locations" className={tabCls}>
          Lokacije
        </NavLink>
        <NavLink to="/content/blog" className={tabCls}>
          Blog
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
