import type { CategoryTreeNodeDto } from '@/features/catalog/types';

export function findCategoryBySlug(
  nodes: CategoryTreeNodeDto[],
  slug: string,
): CategoryTreeNodeDto | null {
  const target = slug.trim().toLowerCase();
  for (const n of nodes) {
    if (n.slug.toLowerCase() === target) {
      return n;
    }
    const inChildren = findCategoryBySlug(n.children ?? [], slug);
    if (inChildren) {
      return inChildren;
    }
  }
  return null;
}

/** Lanac od korena do čvora sa datim slug-om (uključujući i taj čvor). Prazno ako nije u stablu. */
export function getCategoryPath(nodes: CategoryTreeNodeDto[], slug: string): CategoryTreeNodeDto[] {
  const target = slug.trim().toLowerCase();
  for (const n of nodes) {
    if (n.slug.toLowerCase() === target) {
      return [n];
    }
    const rest = getCategoryPath(n.children ?? [], slug);
    if (rest.length > 0) {
      return [n, ...rest];
    }
  }
  return [];
}
