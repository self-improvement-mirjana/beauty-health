import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { ApiErrorBanner } from '@/components/ApiErrorBanner';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useListAdminBrandsQuery,
  useUpdateBrandMutation,
} from '@/features/api/catalogEndpoints';
import { parseApiError } from '@/lib/parseApiError';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const brandSchema = z.object({
  name: z.string().trim().min(1, 'Naziv je obavezan').max(255),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug je obavezan')
    .max(128)
    .regex(slugPattern, 'Slug: mala slova, brojevi i crtice'),
});

type BrandForm = z.infer<typeof brandSchema>;

export function BrandsPage() {
  const { data: brands, isLoading, refetch } = useListAdminBrandsQuery();
  const [createBrand, { isLoading: creating }] = useCreateBrandMutation();
  const [updateBrand, { isLoading: updating }] = useUpdateBrandMutation();
  const [deleteBrand, { isLoading: deleting }] = useDeleteBrandMutation();

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [initialSlug, setInitialSlug] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ message: string; details: string[] } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const saving = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: { name: '', slug: '' },
  });

  const slugValue = watch('slug');

  function openCreate() {
    setBanner(null);
    setEditingId(null);
    setInitialSlug(null);
    reset({ name: '', slug: '' });
    setModal('create');
  }

  function openEdit(b: { id: number; name: string; slug: string }) {
    setBanner(null);
    setEditingId(b.id);
    setInitialSlug(b.slug);
    reset({ name: b.name, slug: b.slug });
    setModal('edit');
  }

  function closeModal() {
    setModal(null);
    setEditingId(null);
    setInitialSlug(null);
  }

  async function onSubmit(values: BrandForm) {
    setBanner(null);
    try {
      if (modal === 'create') {
        await createBrand(values).unwrap();
      } else if (modal === 'edit' && editingId != null) {
        await updateBrand({ id: editingId, body: values }).unwrap();
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
      await deleteBrand(deleteTarget.id).unwrap();
      setDeleteTarget(null);
      void refetch();
    } catch (e) {
      setBanner(parseApiError(e));
      setDeleteTarget(null);
    }
  }

  const slugChanged = modal === 'edit' && initialSlug != null && slugValue !== initialSlug;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Brendovi</h1>
          <p className="mt-1 text-sm text-slate-400">
            CRUD preko B10. Polje za logo URL nije u v1 API-ju (samo <code className="text-amber-500/90">name</code>,{' '}
            <code className="text-amber-500/90">slug</code>).
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
        >
          Novi brend
        </button>
      </div>

      {banner ? <ApiErrorBanner {...banner} onDismiss={() => setBanner(null)} /> : null}

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700 text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Naziv</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Slug</th>
              <th className="px-4 py-3 text-right font-medium text-slate-300">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                  Učitavanje…
                </td>
              </tr>
            ) : (
              (brands ?? []).map((b) => (
                <tr key={b.id} className="hover:bg-slate-900/50">
                  <td className="px-4 py-3 font-medium text-white">{b.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{b.slug}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEdit(b)}
                      className="text-amber-400 hover:underline text-xs font-medium"
                    >
                      Uredi
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: b.id, name: b.name })}
                      className="text-red-400 hover:underline text-xs font-medium"
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
          <form
            className="w-full max-w-md space-y-4 rounded-xl border border-slate-600 bg-slate-900 p-6 shadow-xl"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h2 className="text-lg font-semibold text-white">
              {modal === 'create' ? 'Novi brend' : 'Izmena brenda'}
            </h2>
            {slugChanged ? (
              <p className="rounded-md border border-amber-800/60 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
                Menjate <strong>slug</strong> — javni URL brenda u storefrontu će se promeniti (SEO).
              </p>
            ) : null}
            <div>
              <label className="text-sm text-slate-300" htmlFor="brand-name">
                Naziv
              </label>
              <input
                id="brand-name"
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                {...register('name')}
              />
              {errors.name ? <p className="mt-1 text-xs text-red-400">{errors.name.message}</p> : null}
            </div>
            <div>
              <label className="text-sm text-slate-300" htmlFor="brand-slug">
                Slug
              </label>
              <input
                id="brand-slug"
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                {...register('slug')}
              />
              {errors.slug ? <p className="mt-1 text-xs text-red-400">{errors.slug.message}</p> : null}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                Otkaži
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
              >
                {saving ? 'Snimanje…' : 'Sačuvaj'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmModal
        open={!!deleteTarget}
        title="Brisanje brenda"
        confirmLabel="Obriši"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void onConfirmDelete()}
        busy={deleting}
      >
        {deleteTarget ? (
          <p>
            Potvrdite brisanje brenda <strong>{deleteTarget.name}</strong>. Ako brend još ima proizvode, server vraća{' '}
            <strong>409</strong>.
          </p>
        ) : null}
      </ConfirmModal>
    </div>
  );
}
