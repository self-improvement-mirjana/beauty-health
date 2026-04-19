import type { AdminCategory } from '@/features/catalog/types';

export type CategoryTreeNode = AdminCategory & { children: CategoryTreeNode[] };

/** Gradi šumu od ravne liste (parentCategoryId). Koren = parentCategoryId === null. */
export function buildCategoryTree(flat: AdminCategory[]): CategoryTreeNode[] {
  const byId = new Map<number, CategoryTreeNode>();
  for (const c of flat) {
    byId.set(c.id, { ...c, children: [] });
  }
  const roots: CategoryTreeNode[] = [];
  for (const c of flat) {
    const node = byId.get(c.id)!;
    if (c.parentCategoryId == null) {
      roots.push(node);
    } else {
      const p = byId.get(c.parentCategoryId);
      if (p) {
        p.children.push(node);
      } else {
        roots.push(node);
      }
    }
  }
  const sortRecursive = (nodes: CategoryTreeNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
    for (const n of nodes) {
      sortRecursive(n.children);
    }
  };
  sortRecursive(roots);
  return roots;
}

/** Svi ID-jevi potomaka (ne uključuje `rootId`). */
export function descendantIds(flat: AdminCategory[], rootId: number): Set<number> {
  const byParent = new Map<number, AdminCategory[]>();
  for (const c of flat) {
    const pid = c.parentCategoryId;
    if (pid == null) {
      continue;
    }
    const arr = byParent.get(pid) ?? [];
    arr.push(c);
    byParent.set(pid, arr);
  }
  const out = new Set<number>();
  const walk = (id: number) => {
    for (const ch of byParent.get(id) ?? []) {
      if (!out.has(ch.id)) {
        out.add(ch.id);
        walk(ch.id);
      }
    }
  };
  walk(rootId);
  return out;
}

/** ID kategorije + svi potomci — isključiti iz izbora roditelja pri izmeni `categoryId`. */
export function excludedParentIds(flat: AdminCategory[], categoryId: number | null): Set<number> {
  if (categoryId == null) {
    return new Set();
  }
  const ex = descendantIds(flat, categoryId);
  ex.add(categoryId);
  return ex;
}
