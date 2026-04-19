import { NavLink, Outlet } from 'react-router-dom';

const tabCls = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-slate-700 text-amber-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
  ].join(' ');

export function UsersLayout() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Korisnici i recenzije</h1>
        <p className="mt-1 text-sm text-slate-400">
          Ograničeni modul za podršku (B11) i moderaciju recenzija (admin API). Pristup je dozvoljen samo ulozi moderator.
        </p>
      </div>
      <div
        role="note"
        className="rounded-lg border border-amber-800/60 bg-amber-950/25 px-4 py-3 text-sm text-amber-100/95"
      >
        <strong className="font-semibold text-amber-400">Upozorenje (GDPR / PII):</strong> prikaz e-pošte i drugih
        identifikatora koristi se isključivo u svrhu korisničke podrške i moderacije sadržaja. Ne iznosite podatke van
        ovlašćenog opsega.
      </div>
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-3">
        <NavLink to="/users/reviews" className={tabCls}>
          Recenzije
        </NavLink>
        <NavLink to="/users/support" className={tabCls}>
          Podrška (korisnik)
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
