/** Apsolutni URL za <img src> — podržava pune URL-ove i relativne putanje ka backendu. */
export function resolveMediaUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) {
    return null;
  }
  const s = raw.trim();
  if (s.startsWith('https://') || s.startsWith('http://')) {
    return s;
  }
  if (s.startsWith('//')) {
    return `https:${s}`;
  }
  const explicit = import.meta.env.VITE_API_URL?.trim();
  const root = explicit
    ? explicit.replace(/\/$/, '')
    : import.meta.env.DEV
      ? ''
      : 'http://localhost:8080';
  if (s.startsWith('/')) {
    return root ? `${root}${s}` : s;
  }
  return s;
}
