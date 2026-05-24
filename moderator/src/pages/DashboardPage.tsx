import { ApiErrorBanner } from '@/components/ApiErrorBanner';
import {
  useAdminAnalyticsFunnelQuery,
  useAdminAnalyticsKpiQuery,
  useAdminAnalyticsPaymentsQuery,
} from '@/features/api/analyticsEndpoints';
import { parseApiError } from '@/lib/parseApiError';

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const kpi = useAdminAnalyticsKpiQuery();
  const payments = useAdminAnalyticsPaymentsQuery();
  const funnel = useAdminAnalyticsFunnelQuery();

  const loading = kpi.isLoading || payments.isLoading || funnel.isLoading;
  const error = kpi.error ?? payments.error ?? funnel.error;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-white">Kontrolna tabla</h1>
      <p className="mt-2 max-w-xl text-slate-400">
        Analytics metrike iz Kafka pipeline-a (storefront + backend događaji → outbox → analytics-service).
      </p>

      {error ? (
        <div className="mt-6">
          <ApiErrorBanner message={parseApiError(error).message} />
        </div>
      ) : null}

      {loading ? <p className="mt-6 text-slate-400">Učitavanje analytics podataka…</p> : null}

      {!loading && !error && kpi.data && payments.data && funnel.data ? (
        <div className="mt-8 space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-medium text-white">KPI</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Porudžbine" value={String(kpi.data.orderCount)} />
              <StatCard label="Prihod (RSD)" value={kpi.data.revenueTotal.toLocaleString('sr-Latn')} />
              <StatCard
                label="Uspešnost plaćanja"
                value={`${payments.data.successRatePercent.toFixed(1)}%`}
              />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-white">Plaćanja</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Uspešna plaćanja" value={String(payments.data.successCount)} />
              <StatCard label="Neuspešna / istekla" value={String(payments.data.failureCount)} />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-medium text-white">Funnel</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Checkout start" value={String(funnel.data.checkoutStartCount)} />
              <StatCard label="Kreirane porudžbine" value={String(funnel.data.orderCreatedCount)} />
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
