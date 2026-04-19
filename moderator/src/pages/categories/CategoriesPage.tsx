import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';

import { ApiErrorBanner } from '@/components/ApiErrorBanner';
import { ConfirmModal } from '@/components/ConfirmModal';
import type { AdminCategory } from '@/features/catalog/types';
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useListAdminCategoriesQuery,
  useUpdateCategoryMutation,
} from '@/features/api/catalogEndpoints';
import { buildCategoryTree, excludedParentIds, type CategoryTreeNode } from '@/lib/categoryTree';
import { parseApiError } from '@/lib/parseApiError';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const categoryFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Naziv je obavezan').max(255),
    slug: z
      .string()
      .trim()
      .min(1)
      .max(128)
      .regex(slugPattern, 'Slug: mala slova, brojevi i crtice'),
    description: z
      .string()
      .max(4000)
      .optional()
      .transform((s) => (s == null || s.trim() === '' ? null : s)),
    parentIdStr: z.string(),
    sortOrder: z.coerce.number().int(),
    active: z.coerce.boolean().default(true),
  })
  .refine((v) => v.parentIdStr === '' || /^\d+$/.test(v.parentIdStr), {
    message: 'Nevažeći roditelj',
    path: ['parentIdStr'],
  })
  .transform((v) => ({
    name: v.name,
    slug: v.slug,
    description: v.description ?? null,
    parentCategoryId: v.parentIdStr === '' ? null : Number(v.parentIdStr),
    sortOrder: v.sortOrder,
    active: v.active,
  }));

type CategoryFormInput = z.input<typeof categoryFormSchema>;
type CategoryFormValues = z.output<typeof categoryFormSchema>;

function hasChildCategories(flat: AdminCategory[], id: number): boolean {
  return flat.some((c) => c.parentCategoryId === id);
}

function CategoryTreeRow({
  node,
  depth,
  flat,
  collapsed,
  toggle,
  onEdit,
  onDelete,
}: {
  node: CategoryTreeNode;
  depth: number;
  flat: AdminCategory[];
  collapsed: Set<number>;
  toggle: (id: number) => void;
  onEdit: (c: AdminCategory) => void;
  onDelete: (c: AdminCategory) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isCollapsed = collapsed.has(node.id);
  const blocked = hasChildCategories(flat, node.id);

  return (
    <div className="border-b border-slate-800/80">
      <div
        className="flex flex-wrap items-center gap-2 py-2 pr-2 text-sm"
        style={{ paddingLeft: 12 + depth * 20 }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-expanded={!isCollapsed}
            onClick={() => toggle(node.id)}
            className="w-6 shrink-0 text-center text-slate-400 hover:text-white"
          >
            {isCollapsed ? '▶' : '▼'}
          </button>
        ) : (
          <span className="inline-block w-6 shrink-0" />
        )}
        <span className="min-w-0 flex-1 font-medium text-white">{node.name}</span>
        <span className="font-mono text-xs text-slate-500">{node.slug}</span>
        <span
          className={
            node.active ? 'rounded bg-emerald-950/50 px-2 py-0.5 text-xs text-emerald-300' : 'rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400'
          }
        >
          {node.active ? 'aktivna' : 'neaktivna'}
        </span>
        <span className="text-xs text-slate-500">sort {node.sortOrder}</span>
        <div className="ml-auto flex gap-2">
          <button type="button" onClick={() => onEdit(node)} className="text-xs font-medium text-amber-400 hover:underline">
            Uredi
          </button>
          <button
            type="button"
            disabled={blocked}
            title={
              blocked
                ? 'Kategorija sa podkategorijama ne može biti obrisana dok postoje deca (backend + UI).'
                : 'Obriši kategoriju'
            }
            onClick={() => onDelete(node)}
            className="text-xs font-medium text-red-400 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            Obriši
          </button>
        </div>
      </div>
      {hasChildren && !isCollapsed
        ? node.children.map((ch) => (
            <CategoryTreeRow
              key={ch.id}
              node={ch}
              depth={depth + 1}
              flat={flat}
              collapsed={collapsed}
              toggle={toggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        : null}
    </div>
  );
}

export function CategoriesPage() {
  const { data: flat, isLoading, refetch } = useListAdminCategoriesQuery();
  const [createCategory, { isLoading: creating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: deleting }] = useDeleteCategoryMutation();

  const tree = useMemo(() => buildCategoryTree(flat ?? []), [flat]);

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [initialSlug, setInitialSlug] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<number>>(() => new Set());
  const [banner, setBanner] = useState<{ message: string; details: string[] } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);

  const saving = creating || updating;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema) as Resolver<CategoryFormInput, unknown, CategoryFormValues>,
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentIdStr: '',
      sortOrder: 0,
      active: true,
    },
  });

  const slugValue = watch('slug');

  function toggleCollapse(id: number) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function openCreate() {
    setBanner(null);
    setEditingId(null);
    setInitialSlug(null);
    reset({ name: '', slug: '', description: '', parentIdStr: '', sortOrder: 0, active: true });
    setModal('create');
  }

  function openEdit(c: AdminCategory) {
    setBanner(null);
    setEditingId(c.id);
    setInitialSlug(c.slug);
    reset({
      name: c.name,
      slug: c.slug,
      description: c.description ?? '',
      parentIdStr: c.parentCategoryId == null ? '' : String(c.parentCategoryId),
      sortOrder: c.sortOrder,
      active: c.active,
    });
    setModal('edit');
  }

  function closeModal() {
    setModal(null);
    setEditingId(null);
    setInitialSlug(null);
  }

  const excluded = useMemo(
    () => (flat && editingId != null ? excludedParentIds(flat, editingId) : new Set<number>()),
    [flat, editingId],
  );

  const parentOptions = useMemo(() => {
    if (!flat) {
      return [];
    }
    const currentParent =
      editingId == null ? null : flat.find((c) => c.id === editingId)?.parentCategoryId ?? null;
    return flat.filter(
      (c) => !excluded.has(c.id) && (c.active || c.id === currentParent),
    );
  }, [flat, excluded, editingId]);

  async function onSubmit(values: CategoryFormValues) {
    setBanner(null);
    try {
      if (modal === 'create') {
        await createCategory(values).unwrap();
      } else if (modal === 'edit' && editingId != null) {
        await updateCategory({ id: editingId, body: values }).unwrap();
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
      await deleteCategory(deleteTarget.id).unwrap();
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
          <h1 className="text-2xl font-semibold text-white">Kategorije</h1>
          <p className="mt-1 text-sm text-slate-400">
            Hijerarhija (roditelj / dete). Roditelj u formi: samo <strong>aktivne</strong> kategorije, bez čvora koji
            pravi ciklus.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
        >
          Nova kategorija
        </button>
      </div>

      {banner ? <ApiErrorBanner {...banner} onDismiss={() => setBanner(null)} /> : null}

      <div className="rounded-lg border border-slate-700 bg-slate-900/40">
        {isLoading ? (
          <p className="p-6 text-slate-500">Učitavanje…</p>
        ) : tree.length === 0 ? (
          <p className="p-6 text-slate-500">Nema kategorija.</p>
        ) : (
          tree.map((n) => (
            <CategoryTreeRow
              key={n.id}
              node={n}
              depth={0}
              flat={flat ?? []}
              collapsed={collapsed}
              toggle={toggleCollapse}
              onEdit={openEdit}
              onDelete={(c) => setDeleteTarget(c)}
            />
          ))
        )}
      </div>

      {modal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <form
            className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-xl border border-slate-600 bg-slate-900 p-6 shadow-xl"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h2 className="text-lg font-semibold text-white">
              {modal === 'create' ? 'Nova kategorija' : 'Izmena kategorije'}
            </h2>
            {slugChanged ? (
              <p className="rounded-md border border-amber-800/60 bg-amber-950/30 px-3 py-2 text-xs text-amber-200">
                Menjate <strong>slug</strong> — javni URL u storefrontu (npr. filter{' '}
                <code className="text-amber-100/90">?categorySlug=…</code>) i putanja tipa{' '}
                <code className="text-amber-100/90">/category/slug</code> zavise od ove vrednosti (SEO).
              </p>
            ) : null}
            <p className="text-xs text-slate-500">
              Pregled URL-a (kupac):{' '}
              <span className="font-mono text-amber-200/90">/category/{slugValue || '…'}</span>
            </p>
            <div>
              <label className="text-sm text-slate-300" htmlFor="cat-name">
                Naziv
              </label>
              <input
                id="cat-name"
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                {...register('name')}
              />
              {errors.name ? <p className="mt-1 text-xs text-red-400">{String(errors.name.message)}</p> : null}
            </div>
            <div>
              <label className="text-sm text-slate-300" htmlFor="cat-slug">
                Slug
              </label>
              <input
                id="cat-slug"
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                {...register('slug')}
              />
              {errors.slug ? <p className="mt-1 text-xs text-red-400">{String(errors.slug.message)}</p> : null}
            </div>
            <div>
              <label className="text-sm text-slate-300" htmlFor="cat-desc">
                Opis (opciono)
              </label>
              <textarea
                id="cat-desc"
                rows={3}
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                {...register('description')}
              />
            </div>
            <div>
              <label className="text-sm text-slate-300" htmlFor="cat-parent">
                Roditeljska kategorija
              </label>
              <select
                id="cat-parent"
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                {...register('parentIdStr')}
              >
                <option value="">Koren (nema roditelja)</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name} ({c.slug})
                  </option>
                ))}
              </select>
              {errors.parentIdStr ? (
                <p className="mt-1 text-xs text-red-400">{String(errors.parentIdStr.message)}</p>
              ) : null}
            </div>
            <div>
              <label className="text-sm text-slate-300" htmlFor="cat-sort">
                Redosled (sortOrder)
              </label>
              <input
                id="cat-sort"
                type="number"
                className="mt-1 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                {...register('sortOrder', { valueAsNumber: true })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" {...register('active')} className="rounded border-slate-500 text-amber-500" />
              Aktivna
            </label>
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
        title="Brisanje kategorije"
        confirmLabel="Obriši"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void onConfirmDelete()}
        busy={deleting}
      >
        {deleteTarget ? (
          <p>
            Brisanje kategorije <strong>{deleteTarget.name}</strong>. Ako postoje <strong>podkategorije</strong> ili{' '}
            <strong>proizvodi</strong> u vezi, server vraća <strong>409</strong>.
          </p>
        ) : null}
      </ConfirmModal>
    </div>
  );
}
