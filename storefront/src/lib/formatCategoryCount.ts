/** Broj proizvoda pored naziva kategorije (sr-Latn, npr. 1.234). */
export function formatCategoryCount(n: number): string {
  return new Intl.NumberFormat('sr-Latn').format(n);
}
