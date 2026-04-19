import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ApiErrorBanner } from '@/components/ApiErrorBanner';
import { ConfirmModal } from '@/components/ConfirmModal';
import { useGetAdminOrderQuery, usePatchAdminOrderStatusMutation } from '@/features/api/orderEndpoints';
import type { MoneyDto } from '@/features/catalog/types';
import { parseApiError } from '@/lib/parseApiError';
import {
  allowedNextStatuses,
  orderStatusLabel,
  parseOrderStatus,
  selectableOrderStatuses,
} from '@/lib/orderStatusTransitions';

function formatMoney(m: MoneyDto): string {
  return `${m.amount} ${m.currency}`;
}

export function OrderDetailPage() {
  const { id: idParam } = useParams();
  const id = idParam ? Number.parseInt(idParam, 10) : NaN;
  const validId = Number.isFinite(id) && id > 0;

  const { data, isLoading, isError, refetch } = useGetAdminOrderQuery(id, { skip: !validId });
  const [patchStatus, { isLoading: patching }] = usePatchAdminOrderStatusMutation();

  const [selectedStatus, setSelectedStatus] = useState('');
  const [cancelOpen, setCancelOpen] = useState(false);
  const [banner, setBanner] = useState<{ message: string; details: string[] } | null>(null);

  useEffect(() => {
    if (data?.order.status) {
      setSelectedStatus(data.order.status);
    }
  }, [data?.order.status]);

  const currentParsed = data ? parseOrderStatus(data.order.status) : null;
  const options = currentParsed ? selectableOrderStatuses(currentParsed) : [];
  const dirty = data ? selectedStatus !== data.order.status : false;
  const canChangeStatus = Boolean(currentParsed && allowedNextStatuses(currentParsed).length > 0);

  async function submitStatus(next: string) {
    if (!validId) {
      return;
    }
    setBanner(null);
    try {
      await patchStatus({ id, status: next }).unwrap();
    } catch (e) {
      setBanner(parseApiError(e));
    }
  }

  function onApplyClick() {
    if (!data || !dirty) {
      return;
    }
    if (selectedStatus === 'CANCELLED') {
      setCancelOpen(true);
      return;
    }
    void submitStatus(selectedStatus);
  }

  if (!validId) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-red-400">Nevažeći identifikator narudžbine.</p>
        <Link to="/orders" className="text-sm text-amber-400 hover:underline">
          Nazad na listu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to="/orders" className="text-sm text-amber-400 hover:underline">
            ← Narudžbine
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            Narudžbina #{validId ? id : '—'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">Detalj i promena statusa (B11).</p>
        </div>
      </div>

      {banner ? (
        <ApiErrorBanner
          message={banner.message}
          details={banner.details}
          onDismiss={() => setBanner(null)}
        />
      ) : null}

      {isError ? (
        <p className="text-sm text-red-400">
          Učitavanje nije uspelo.{' '}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Pokušaj ponovo
          </button>
        </p>
      ) : null}

      {isLoading ? <p className="text-sm text-slate-500">Učitavanje…</p> : null}

      {data ? (
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Status</h2>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-[200px] flex-1">
                <label className="block text-xs font-medium text-slate-400">Novi status</label>
                {currentParsed ? (
                  <select
                    value={selectedStatus}
                    disabled={!canChangeStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {options.map((s) => (
                      <option key={s} value={s}>
                        {orderStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-2 text-sm text-slate-300">{data.order.status}</p>
                )}
              </div>
              <button
                type="button"
                disabled={!dirty || patching || !canChangeStatus}
                onClick={() => onApplyClick()}
                className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {patching ? 'Snimanje…' : 'Sačuvaj status'}
              </button>
            </div>
            {!canChangeStatus ? (
              <p className="mt-2 text-xs text-slate-500">Dalja izmena statusa nije dozvoljena za ovu narudžbinu.</p>
            ) : null}
            <p className="mt-2 text-xs text-slate-500">
              Konflikt (npr. paralelna izmena) vraća HTTP 409 — poruka ispod banera.
            </p>
          </section>

          <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Kupac</h2>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">E-pošta</dt>
                <dd className="text-slate-200">{data.customerEmail}</dd>
              </div>
              <div>
                <dt className="text-slate-500">ID naloga (referenca)</dt>
                <dd className="font-mono text-xs text-slate-400">{data.customerUserId}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Pregled</h2>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Isporuka (tekst)</dt>
                <dd className="text-slate-200">{data.order.deliverySummaryText || '—'}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Ukupno</dt>
                <dd className="text-slate-200">{formatMoney(data.order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Stavke</h2>
            <div className="mt-3 overflow-x-auto rounded-md border border-slate-800">
              <table className="min-w-full divide-y divide-slate-800 text-sm">
                <thead className="bg-slate-950/80">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-slate-400">Proizvod</th>
                    <th className="px-3 py-2 text-left font-medium text-slate-400">Varijanta</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-400">Kol.</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-400">Cena</th>
                    <th className="px-3 py-2 text-right font-medium text-slate-400">Ukupno stavke</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data.order.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="px-3 py-2 text-slate-200">
                        <span className="font-medium">{line.productName}</span>
                        <span className="mt-0.5 block font-mono text-xs text-slate-500">{line.productSlug}</span>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-slate-400">#{line.variantId}</td>
                      <td className="px-3 py-2 text-right text-slate-300">{line.quantity}</td>
                      <td className="px-3 py-2 text-right text-slate-300">{formatMoney(line.unitPrice)}</td>
                      <td className="px-3 py-2 text-right text-slate-200">{formatMoney(line.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Adresa isporuke</h2>
            <dl className="mt-3 space-y-1 text-sm text-slate-200">
              <div>
                <span className="text-slate-500">Primalac: </span>
                {data.order.recipientName}
              </div>
              <div>
                <span className="text-slate-500">Telefon: </span>
                {data.order.recipientPhone}
              </div>
              <div>
                {data.order.addressLine1}
                {data.order.addressLine2 ? `, ${data.order.addressLine2}` : ''}
              </div>
              <div>
                {data.order.postalCode} {data.order.city}, {data.order.countryCode}
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Plaćanje</h2>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Provajder</dt>
                <dd className="text-slate-200">{data.order.paymentProvider}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Status zapisa</dt>
                <dd className="text-slate-200">{data.order.paymentStatus}</dd>
              </div>
            </dl>
          </section>
        </div>
      ) : null}

      <ConfirmModal
        open={cancelOpen}
        title="Otkazivanje narudžbine"
        confirmLabel="Da, otkaži"
        cancelLabel="Ne"
        busy={patching}
        onCancel={() => setCancelOpen(false)}
        onConfirm={() => {
          void (async () => {
            setBanner(null);
            try {
              await patchStatus({ id, status: 'CANCELLED' }).unwrap();
              setCancelOpen(false);
            } catch (e) {
              setBanner(parseApiError(e));
            }
          })();
        }}
      >
        <p>Status će biti postavljen na „Otkazana”. Ova radnja je dozvoljena samo iz statusa Nova ili Potvrđena.</p>
      </ConfirmModal>
    </div>
  );
}
