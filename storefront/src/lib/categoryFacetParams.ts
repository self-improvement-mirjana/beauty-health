/** Parsiranje facet slug-ova iz URL-a: više istoimenih parametara ili jedan comma-separated vrednost. */
export function parseCategoryFacetSearchParams(searchParams: URLSearchParams): string[] {
  const raw = searchParams.getAll('categoryFacet').flatMap((s) =>
    s.split(',').map((x) => x.trim()).filter(Boolean),
  );
  return [...new Set(raw)];
}

/** Isti format kao zahtev ka API-ju: ponovljeni `categoryFacet` (bez zareza u jednoj vrednosti). */
export function setCategoryFacetOnParams(params: URLSearchParams, slugs: string[]): void {
  params.delete('categoryFacet');
  const unique = [...new Set(slugs.map((s) => s.trim()).filter(Boolean))];
  for (const u of unique) {
    params.append('categoryFacet', u);
  }
}
