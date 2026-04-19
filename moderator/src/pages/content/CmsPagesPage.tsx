import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { z } from 'zod';

import { ApiErrorBanner } from '@/components/ApiErrorBanner';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  useCreateCmsPageMutation,
  useDeleteCmsPageMutation,
  useGetCmsPageQuery,
  useListCmsPagesQuery,
  useUpdateCmsPageMutation,
} from '@/features/api/contentEndpoints';
import { parseApiError } from '@/lib/parseApiError';
import { slugHintFromTitle } from '@/lib/slugHintFromTitle';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const cmsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Slug je obavezan')
    .max(128)
    .regex(slugPattern, 'Slug: mala slova, brojevi i crtice'),
  title: z.string().trim().min(1, 'Naslov je obavezan').max(255),
  bodyMarkdown: z.string().min(1, 'Markdown telo je obavezno'),
  published: z.boolean(),
});

type CmsForm = z.infer<typeof cmsSchema>;

type Filter = 'all' | 'published' | 'draft';

export function CmsPagesPage() {
  const { data: pages, isLoading, refetch } = useListCmsPagesQuery();
  const [createPage, { isLoading: creating }] = useCreateCmsPageMutation();
  const [updatePage, { isLoading: updating }] = useUpdateCmsPageMutation();
  const [deletePage, { isLoading: deleting }] = useDeleteCmsPageMutation();

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [initialSlug, setInitialSlug] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ message: string; details: string[] } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const { data: detail, isFetching: detailLoading } = useGetCmsPageQuery(editingId!, {
    skip: !editingId || modal !== 'edit',
  });

  const saving = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CmsForm>({
    resolver: zodResolver(cmsSchema),
    defaultValues: { slug: '', title: '', bodyMarkdown: '', published: false },
  });

  const slugValue = watch('slug');
  const titleValue = watch('title');
  const bodyValue = watch('bodyMarkdown');

  useEffect(() => {
    if (modal === 'edit' && detail) {
      reset({
        slug: detail.slug,
        title: detail.title,
        bodyMarkdown: detail.bodyMarkdown,
        published: detail.published,
      });
    }
  }, [modal, detail, reset]);

  const rows = useMemo(() => {
    const list = pages ?? [];
    if (filter === 'published') {
      return list.filter((p) => p.published);
    }
    if (filter === 'draft') {
      return list.filter((p) => !p.published);
    }
    return list;
  }, [pages, filter]);

  function openCreate() {
    setBanner(null);
    setEditingId(null);
    setInitialSlug(null);
    reset({ slug: '', title: '', bodyMarkdown: '', published: false });
    setModal('create');
  }

  function openEdit(row: { id: number; slug: string; title: string; published: boolean }) {
    setBanner(null);
    setEditingId(row.id);
    setInitialSlug(row.slug);
    reset({ slug: row.slug, title: row.title, bodyMarkdown: '', published: row.published });
    setModal('edit');
  }

  function closeModal() {
    setModal(null);
    setEditingId(null);
    setInitialSlug(null);
  }

  async function onSubmit(values: CmsForm) {
    setBanner(null);
    try {
      if (modal === 'create') {
        await createPage(values).unwrap();
      } else if (modal === 'edit' && editingId != null) {
        await updatePage({ id: editingId, body: values }).unwrap();
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
      await deletePage(deleteTarget.id).unwrap();
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
          <h2 className="text-lg font-semibold text-white">CMS stranice</h2>
          <p className="mt-1 text-sm text-slate-400">
            Javni prikaz: <code className="text-amber-500/90">/api/v1/pages/{'{slug}'}</code> (objavljene). Markdown
            pregled je lokalni; sanitizacija ostaje na serveru.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
        >
          Nova stranica
        </button>
      </div>

      {banner ? (
        <ApiErrorBanner message={banner.message} details={banner.details} onDismiss={() => setBanner(null)} />
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs font-medium text-slate-400">Filter</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Filter)}
          className="rounded-md border border-slate-600 bg-slate-950 px-3 py-1.5 text-sm text-white"
        >
          <option value="all">Sve</option>
          <option value="published">Objavljene</option>
          <option value="draft">Nacrti</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700 text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Naslov</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Status</th>
              <th className="px-4 py-3 text-right font-medium text-slate-300">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Učitavanje…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Nema stranica za prikaz.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-mono text-xs text-amber-400">{row.slug}</td>
                  <td className="px-4 py-3 text-slate-200">{row.title}</td>
                  <td className="px-4 py-3 text-slate-400">{row.published ? 'Objavljena' : 'Nacrt'}</td>
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
                      onClick={() => setDeleteTarget({ id: row.id, title: row.title })}
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
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-12">
          <div className="w-full max-w-5xl rounded-xl border border-slate-600 bg-slate-900 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">
                {modal === 'create' ? 'Nova CMS stranica' : 'Izmena CMS stranice'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-slate-600 px-2 py-1 text-sm text-slate-300 hover:bg-slate-800"
              >
                Zatvori
              </button>
            </div>

            {modal === 'edit' && detailLoading ? (
              <p className="mt-6 text-sm text-slate-500">Učitavanje detalja…</p>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                {slugChanged ? (
                  <p className="rounded-md border border-amber-700/60 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
                    Menjate slug — proverite da li postoje linkovi (npr. u futeru) koji još pokazuju na stari URL.
                  </p>
                ) : null}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400">Naslov</label>
                    <input
                      {...register('title')}
                      className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white"
                    />
                    {errors.title ? <p className="mt-1 text-xs text-red-400">{errors.title.message}</p> : null}
                    <button
                      type="button"
                      className="mt-2 text-xs text-amber-400 hover:underline"
                      onClick={() => setValue('slug', slugHintFromTitle(titleValue, 128), { shouldValidate: true })}
                    >
                      Predlog slug-a iz naslova
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400">Slug (URL)</label>
                    <input
                      {...register('slug')}
                      className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-sm text-white"
                    />
                    {errors.slug ? <p className="mt-1 text-xs text-red-400">{errors.slug.message}</p> : null}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" {...register('published')} className="rounded border-slate-500 bg-slate-950" />
                  Objavljena
                </label>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400">Markdown</label>
                    <textarea
                      {...register('bodyMarkdown')}
                      rows={16}
                      className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-sm text-white"
                    />
                    {errors.bodyMarkdown ? (
                      <p className="mt-1 text-xs text-red-400">{errors.bodyMarkdown.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400">Pregled</label>
                    <div className="mt-1 max-h-[28rem] overflow-auto rounded-md border border-slate-700 bg-slate-950/80 p-3 text-sm text-slate-200 [&_a]:text-amber-400 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-slate-600 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-slate-900 [&_code]:px-1 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-4 [&_ol]:list-decimal [&_p]:mb-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-slate-900 [&_pre]:p-2 [&_ul]:list-disc">
                      {bodyValue?.trim() ? <ReactMarkdown>{bodyValue}</ReactMarkdown> : (
                        <p className="text-slate-500">Unesite markdown za pregled.</p>
                      )}
                    </div>
                  </div>
                </div>
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
                    disabled={saving || (modal === 'edit' && detailLoading)}
                    className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-40"
                  >
                    {saving ? 'Snimanje…' : 'Sačuvaj'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={deleteTarget != null}
        title="Brisanje CMS stranice"
        confirmLabel="Obriši"
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void onConfirmDelete()}
      >
        <p>
          Obrisati stranicu „{deleteTarget?.title}”? Javni URL više neće vraćati ovu stranicu (posle osvežavanja keša u
          browseru).
        </p>
      </ConfirmModal>
    </div>
  );
}
