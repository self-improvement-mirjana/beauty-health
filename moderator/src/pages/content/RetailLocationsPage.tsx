import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ApiErrorBanner } from '@/components/ApiErrorBanner';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  useCreateRetailLocationMutation,
  useDeleteRetailLocationMutation,
  useListRetailLocationsQuery,
  useUpdateRetailLocationMutation,
} from '@/features/api/contentEndpoints';
import { parseApiError } from '@/lib/parseApiError';

const retailSchema = z.object({
  name: z.string().trim().min(1, 'Naziv je obavezan').max(255),
  address: z.string().trim().min(1, 'Adresa je obavezna').max(500),
  phone: z.string().trim().min(1, 'Telefon je obavezan').max(64),
  hoursText: z.string().trim().min(1, 'Radno vreme je obavezno').max(500),
  sortOrder: z.coerce.number().int().min(0),
  active: z.boolean(),
});

type RetailForm = z.infer<typeof retailSchema>;

export function RetailLocationsPage() {
  const { data: locations, isLoading, refetch } = useListRetailLocationsQuery();
  const [createLoc, { isLoading: creating }] = useCreateRetailLocationMutation();
  const [updateLoc, { isLoading: updating }] = useUpdateRetailLocationMutation();
  const [deleteLoc, { isLoading: deleting }] = useDeleteRetailLocationMutation();

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ message: string; details: string[] } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const saving = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RetailForm>({
    resolver: zodResolver(retailSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      hoursText: '',
      sortOrder: 0,
      active: true,
    },
  });

  function openCreate() {
    setBanner(null);
    setEditingId(null);
    reset({ name: '', address: '', phone: '', hoursText: '', sortOrder: 0, active: true });
    setModal('create');
  }

  function openEdit(row: {
    id: number;
    name: string;
    address: string;
    phone: string;
    hoursText: string;
    sortOrder: number;
    active: boolean;
  }) {
    setBanner(null);
    setEditingId(row.id);
    reset({
      name: row.name,
      address: row.address,
      phone: row.phone,
      hoursText: row.hoursText,
      sortOrder: row.sortOrder,
      active: row.active,
    });
    setModal('edit');
  }

  function closeModal() {
    setModal(null);
    setEditingId(null);
  }

  async function onSubmit(values: RetailForm) {
    setBanner(null);
    try {
      if (modal === 'create') {
        await createLoc(values).unwrap();
      } else if (modal === 'edit' && editingId != null) {
        await updateLoc({ id: editingId, body: values }).unwrap();
      }
      closeModal();
      void refetch();
    } catch (e) {
      setBanner(parseApiError(e));
    }
  }

  async function onConfirmDelete() {
    if (!deleteTarget) {
      return;
    }
    setBanner(null);
    try {
      await deleteLoc(deleteTarget.id).unwrap();
      setDeleteTarget(null);
      void refetch();
    } catch (e) {
      setBanner(parseApiError(e));
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Maloprodajne lokacije</h2>
          <p className="mt-1 text-sm text-slate-400">
            Entitet <code className="text-amber-500/90">retail_location</code> — prikaz na storefront-u kroz javni B09
            read API.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
        >
          Nova lokacija
        </button>
      </div>

      {banner ? (
        <ApiErrorBanner message={banner.message} details={banner.details} onDismiss={() => setBanner(null)} />
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700 text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Redosled</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Naziv</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Adresa</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Telefon</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Aktivna</th>
              <th className="px-4 py-3 text-right font-medium text-slate-300">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Učitavanje…
                </td>
              </tr>
            ) : !locations?.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Nema lokacija.
                </td>
              </tr>
            ) : (
              locations.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-mono text-slate-400">{row.sortOrder}</td>
                  <td className="px-4 py-3 font-medium text-white">{row.name}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-slate-300" title={row.address}>
                    {row.address}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{row.phone}</td>
                  <td className="px-4 py-3 text-slate-400">{row.active ? 'Da' : 'Ne'}</td>
                  <td className="space-x-2 px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="rounded-md border border-slate-600 px-2 py-1 text-xs font-medium text-amber-400 hover:bg-slate-800"
                    >
                      Uredi
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: row.id, name: row.name })}
                      className="rounded-md border border-slate-600 px-2 py-1 text-xs text-red-300 hover:bg-slate-800"
                    >
                      Obriši
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-600 bg-slate-900 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">
                {modal === 'create' ? 'Nova lokacija' : 'Izmena lokacije'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-slate-600 px-2 py-1 text-sm text-slate-300 hover:bg-slate-800"
              >
                Zatvori
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400">Naziv</label>
                <input
                  {...register('name')}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white"
                />
                {errors.name ? <p className="mt-1 text-xs text-red-400">{errors.name.message}</p> : null}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">Adresa</label>
                <input
                  {...register('address')}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white"
                />
                {errors.address ? <p className="mt-1 text-xs text-red-400">{errors.address.message}</p> : null}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">Telefon</label>
                <input
                  {...register('phone')}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white"
                />
                {errors.phone ? <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p> : null}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">Radno vreme (tekst)</label>
                <textarea
                  {...register('hoursText')}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white"
                />
                {errors.hoursText ? <p className="mt-1 text-xs text-red-400">{errors.hoursText.message}</p> : null}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400">Redosled (sortOrder)</label>
                <input
                  type="number"
                  {...register('sortOrder')}
                  className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white"
                />
                {errors.sortOrder ? <p className="mt-1 text-xs text-red-400">{errors.sortOrder.message}</p> : null}
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" {...register('active')} className="rounded border-slate-500 bg-slate-950" />
                Aktivna
              </label>
              <div className="flex justify-end gap-2 border-t border-slate-700 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-slate-600 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
                >
                  Otkaži
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-40"
                >
                  {saving ? 'Snimanje…' : 'Sačuvaj'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={deleteTarget != null}
        title="Brisanje lokacije"
        confirmLabel="Obriši"
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void onConfirmDelete()}
      >
        <p>Obrisati lokaciju „{deleteTarget?.name}”?</p>
      </ConfirmModal>
    </div>
  );
}
