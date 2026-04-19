/** Predlog URL slug-a (mala slova, brojevi, crtice), za ručnu korekciju u formi. */
export function slugHintFromTitle(title: string, maxLen: number): string {
  const base = title
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const cut = base.slice(0, maxLen).replace(/-+$/g, '');
  return cut;
}
