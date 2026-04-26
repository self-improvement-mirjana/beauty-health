import { useGetDashboardQuery } from '../features/api/transactionEndpoints';

export function DashboardPage() {
  const { data, isLoading } = useGetDashboardQuery();

  if (isLoading || !data) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-neutral-200" />
        <div className="h-32 rounded bg-neutral-200" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Ukupno transakcija" value={String(data.totalTransactions)} />
        <Tile label="Odobrene" value={String(data.approvedCount)} color="text-emerald-700" />
        <Tile label="Odbijene" value={String(data.declinedCount)} color="text-red-700" />
        <Tile label="Ukupan iznos" value={data.totalAmountRsd.formatted} />
      </div>
      <h2 className="mt-8 text-lg font-medium text-neutral-800">Poslednji intent-i</h2>
      {data.recentIntents.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">Nema transakcija.</p>
      ) : (
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-500">
              <th className="pb-2">Ref</th>
              <th className="pb-2">Merchant</th>
              <th className="pb-2">Iznos</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Vreme</th>
            </tr>
          </thead>
          <tbody>
            {data.recentIntents.map((t) => (
              <tr key={t.id} className="border-b border-neutral-100">
                <td className="py-2 font-mono text-xs">{t.paymentRef.substring(0, 8)}...</td>
                <td className="py-2">{t.merchantName}</td>
                <td className="py-2">{t.amount.formatted}</td>
                <td className="py-2">
                  <StatusBadge status={t.intentStatus} />
                </td>
                <td className="py-2 text-neutral-500">
                  {new Date(t.processedAt).toLocaleString('sr')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Tile({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${color ?? 'text-neutral-900'}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    CREATED: 'bg-blue-50 text-blue-700',
    AUTHORIZED: 'bg-emerald-50 text-emerald-700',
    DECLINED: 'bg-red-50 text-red-700',
    EXPIRED: 'bg-neutral-100 text-neutral-600',
    FAILED: 'bg-red-50 text-red-700',
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? 'bg-neutral-100 text-neutral-600'}`}
    >
      {status}
    </span>
  );
}
