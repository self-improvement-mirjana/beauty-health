import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { z } from 'zod';

import { ApiErrorBanner } from '@/components/ApiErrorBanner';
import { ConfirmModal } from '@/components/ConfirmModal';
import {
  useCreateBlogPostMutation,
  useDeleteBlogPostMutation,
  useGetBlogPostQuery,
  useListBlogPostsQuery,
  useUpdateBlogPostMutation,
} from '@/features/api/contentEndpoints';
import type { AdminBlogPostUpsertBody } from '@/features/content/types';
import { datetimeLocalValueToIsoOrNull, instantToDatetimeLocalValue } from '@/lib/instantLocalInput';
import { parseApiError } from '@/lib/parseApiError';
import { slugHintFromTitle } from '@/lib/slugHintFromTitle';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const blogSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Slug je obavezan')
    .max(255)
    .regex(slugPattern, 'Slug: mala slova, brojevi i crtice'),
  title: z.string().trim().min(1, 'Naslov je obavezan').max(255),
  excerpt: z.string().max(500),
  bodyMarkdown: z.string().min(1, 'Telo je obavezno'),
  published: z.boolean(),
  publishedAtLocal: z.string(),
});

type BlogForm = z.infer<typeof blogSchema>;

export function BlogPostsPage() {
  const { data: posts, isLoading, refetch } = useListBlogPostsQuery();
  const [createPost, { isLoading: creating }] = useCreateBlogPostMutation();
  const [updatePost, { isLoading: updating }] = useUpdateBlogPostMutation();
  const [deletePost, { isLoading: deleting }] = useDeleteBlogPostMutation();

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [initialSlug, setInitialSlug] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ message: string; details: string[] } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null);

  const { data: detail, isFetching: detailLoading } = useGetBlogPostQuery(editingId!, {
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
  } = useForm<BlogForm>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      slug: '',
      title: '',
      excerpt: '',
      bodyMarkdown: '',
      published: false,
      publishedAtLocal: '',
    },
  });

  const slugValue = watch('slug');
  const titleValue = watch('title');
  const bodyValue = watch('bodyMarkdown');
  const publishedVal = watch('published');

  useEffect(() => {
    if (modal === 'edit' && detail) {
      reset({
        slug: detail.slug,
        title: detail.title,
        excerpt: detail.excerpt ?? '',
        bodyMarkdown: detail.bodyMarkdown,
        published: detail.published,
        publishedAtLocal: instantToDatetimeLocalValue(detail.publishedAt),
      });
    }
  }, [modal, detail, reset]);

  function openCreate() {
    setBanner(null);
    setEditingId(null);
    setInitialSlug(null);
    reset({
      slug: '',
      title: '',
      excerpt: '',
      bodyMarkdown: '',
      published: false,
      publishedAtLocal: '',
    });
    setModal('create');
  }

  function openEdit(row: { id: number; slug: string; title: string; published: boolean }) {
    setBanner(null);
    setEditingId(row.id);
    setInitialSlug(row.slug);
    reset({
      slug: row.slug,
      title: row.title,
      excerpt: '',
      bodyMarkdown: '',
      published: row.published,
      publishedAtLocal: '',
    });
    setModal('edit');
  }

  function closeModal() {
    setModal(null);
    setEditingId(null);
    setInitialSlug(null);
  }

  function toApiBody(values: BlogForm): AdminBlogPostUpsertBody {
    const excerptTrim = values.excerpt.trim();
    return {
      slug: values.slug.trim(),
      title: values.title.trim(),
      excerpt: excerptTrim ? excerptTrim : null,
      bodyMarkdown: values.bodyMarkdown,
      published: values.published,
      publishedAt: values.published ? datetimeLocalValueToIsoOrNull(values.publishedAtLocal) : null,
    };
  }

  async function onSubmit(values: BlogForm) {
    setBanner(null);
    const body = toApiBody(values);
    try {
      if (modal === 'create') {
        await createPost(body).unwrap();
      } else if (modal === 'edit' && editingId != null) {
        await updatePost({ id: editingId, body }).unwrap();
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
      await deletePost(deleteTarget.id).unwrap();
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
          <h2 className="text-lg font-semibold text-white">Blog članci</h2>
          <p className="mt-1 text-sm text-slate-400">
            Javna lista: <code className="text-amber-500/90">GET /api/v1/blog</code>. Pri objavi bez datuma, server
            postavlja <code className="text-amber-500/90">published_at</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
        >
          Novi članak
        </button>
      </div>

      {banner ? (
        <ApiErrorBanner message={banner.message} details={banner.details} onDismiss={() => setBanner(null)} />
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="min-w-full divide-y divide-slate-700 text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Naslov</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Objavljeno</th>
              <th className="px-4 py-3 text-left font-medium text-slate-300">Datum objave</th>
              <th className="px-4 py-3 text-right font-medium text-slate-300">Akcije</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/40">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Učitavanje…
                </td>
              </tr>
            ) : !posts?.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Nema članaka.
                </td>
              </tr>
            ) : (
              posts.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-3 font-mono text-xs text-amber-400">{row.slug}</td>
                  <td className="px-4 py-3 text-slate-200">{row.title}</td>
                  <td className="px-4 py-3 text-slate-400">{row.published ? 'Da' : 'Ne'}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {row.publishedAt
                      ? new Date(row.publishedAt).toLocaleString('sr-RS', { dateStyle: 'short', timeStyle: 'short' })
                      : '—'}
                  </td>
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
        <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10">
          <div className="w-full max-w-5xl rounded-xl border border-slate-600 bg-slate-900 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">
                {modal === 'create' ? 'Novi blog članak' : 'Izmena blog članka'}
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
                    Menjate slug — ažurirajte linkove ka članku na storefront-u.
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
                      onClick={() => setValue('slug', slugHintFromTitle(titleValue, 255), { shouldValidate: true })}
                    >
                      Predlog slug-a iz naslova
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400">Slug</label>
                    <input
                      {...register('slug')}
                      className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-sm text-white"
                    />
                    {errors.slug ? <p className="mt-1 text-xs text-red-400">{errors.slug.message}</p> : null}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400">Izvod (opciono, do 500 znakova)</label>
                  <textarea
                    {...register('excerpt')}
                    rows={2}
                    className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white"
                  />
                  {errors.excerpt ? <p className="mt-1 text-xs text-red-400">{errors.excerpt.message}</p> : null}
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" {...register('published')} className="rounded border-slate-500 bg-slate-950" />
                  Objavljen
                </label>
                {publishedVal ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-400">
                      Datum i vreme objave (opciono — prazno = sada na serveru)
                    </label>
                    <input
                      type="datetime-local"
                      {...register('publishedAtLocal')}
                      className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white"
                    />
                  </div>
                ) : null}
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-400">Markdown telo</label>
                    <textarea
                      {...register('bodyMarkdown')}
                      rows={14}
                      className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-sm text-white"
                    />
                    {errors.bodyMarkdown ? (
                      <p className="mt-1 text-xs text-red-400">{errors.bodyMarkdown.message}</p>
                    ) : null}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400">Pregled</label>
                    <div className="mt-1 max-h-[24rem] overflow-auto rounded-md border border-slate-700 bg-slate-950/80 p-3 text-sm text-slate-200 [&_a]:text-amber-400 [&_code]:rounded [&_code]:bg-slate-900 [&_code]:px-1 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5">
                      {bodyValue?.trim() ? <ReactMarkdown>{bodyValue}</ReactMarkdown> : (
                        <p className="text-slate-500">Unesite markdown.</p>
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
        title="Brisanje blog članka"
        confirmLabel="Obriši"
        busy={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void onConfirmDelete()}
      >
        <p>Obrisati članak „{deleteTarget?.title}”?</p>
      </ConfirmModal>
    </div>
  );
}
