import type { CategoryTreeNodeDto } from '@/features/catalog/types';

/** Podela dece kategorije u N kolona (za mega-meni), ravnomerno po redu. */
export function chunkCategoryChildren(
  node: CategoryTreeNodeDto | null | undefined,
  columnCount: number,
): CategoryTreeNodeDto[][] {
  if (!node?.children?.length || columnCount < 1) {
    return [];
  }
  const sorted = [...node.children].sort((a, b) =>
    a.name.localeCompare(b.name, 'sr', { sensitivity: 'base' }),
  );
  const cols: CategoryTreeNodeDto[][] = Array.from({ length: columnCount }, () => []);
  sorted.forEach((c, i) => {
    cols[i % columnCount].push(c);
  });
  return cols.filter((c) => c.length > 0);
}
