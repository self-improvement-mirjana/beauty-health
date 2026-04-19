import { Helmet } from 'react-helmet-async';

import { ErrorState } from '@/components/ErrorState';
import { useListRetailLocationsQuery } from '@/features/api/contentEndpoints';

export function LocationsPage() {
  const { data, isLoading, isError, error, refetch } = useListRetailLocationsQuery();

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4" aria-busy="true">
        <div className="h-8 w-48 rounded bg-neutral-200" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-40 rounded bg-neutral-200" />
          <div className="h-40 rounded bg-neutral-200" />
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  const locations = data ?? [];

  return (
    <div>
      <Helmet>
        <title>Lokacije · Beauty Health</title>
        <meta name="description" content="Maloprodajne lokacije Beauty Health." />
      </Helmet>
      <h1 className="text-2xl font-semibold text-neutral-900">Lokacije</h1>
      <p className="mt-2 text-sm text-neutral-600">Aktivne maloprodajne lokacije (B09 / spec. odjeljak 8).</p>

      {locations.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">Trenutno nema upisanih lokacija.</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map((loc) => (
            <li
              key={`${loc.name}-${loc.address}`}
              className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-neutral-900">{loc.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-700">{loc.address}</p>
              {loc.phone ? (
                <p className="mt-3 text-sm text-neutral-600">
                  Tel:{' '}
                  <a href={`tel:${loc.phone.replace(/\s/g, '')}`} className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600">
                    {loc.phone}
                  </a>
                </p>
              ) : null}
              {loc.hoursText ? (
                <p className="mt-2 text-xs leading-relaxed text-neutral-500">Radno vreme: {loc.hoursText}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
