import { Link } from 'react-router-dom';

import { useAppSelector } from '@/app/hooks';
import { selectAuthUser } from '@/features/auth/authSlice';

export function AccountDashboardPage() {
  const user = useAppSelector(selectAuthUser);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Pregled naloga</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Osnovni podaci (F06). Detalji zone „Moj nalog“ slede kada specifikacija 11 bude zatvorena.
      </p>

      {user ? (
        <dl className="mt-8 grid max-w-lg gap-4 rounded-xl border border-neutral-200 bg-white p-6 text-sm shadow-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Ime</dt>
            <dd className="mt-1 text-neutral-900">{user.fullName}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">E-pošta</dt>
            <dd className="mt-1 text-neutral-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Uloge</dt>
            <dd className="mt-1 text-neutral-700">{user.roles.join(', ')}</dd>
          </div>
        </dl>
      ) : null}

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          to="/account/porudzbine"
          className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="text-sm font-semibold text-neutral-900">Porudžbine</h2>
          <p className="mt-2 text-sm text-neutral-600">Pregled i detalji svih narudžbina.</p>
        </Link>
        <Link
          to="/account/ponovo-kupi"
          className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="text-sm font-semibold text-neutral-900">Ponovo kupi</h2>
          <p className="mt-2 text-sm text-neutral-600">Proizvodi koje ste već naručili — brzo u korpu.</p>
        </Link>
        <Link
          to="/lista-zelja"
          className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <h2 className="text-sm font-semibold text-neutral-900">Lista želja</h2>
          <p className="mt-2 text-sm text-neutral-600">Sačuvani proizvodi na ovom uređaju.</p>
        </Link>
        <Link
          to="/shop"
          className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 transition-colors hover:bg-neutral-100"
        >
          <h2 className="text-sm font-semibold text-neutral-900">Prodavnica</h2>
          <p className="mt-2 text-sm text-neutral-600">Nastavi kupovinu.</p>
        </Link>
      </section>
    </div>
  );
}
