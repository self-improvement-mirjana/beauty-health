/**
 * Mapira Spring `FieldError` stringove (`email: must not be blank`) na imena polja za `react-hook-form`.
 */
export function mapApiDetailsToFieldErrors(details: string[]): Partial<Record<string, string>> {
  const out: Partial<Record<string, string>> = {};
  for (const line of details) {
    const sep = ': ';
    const i = line.indexOf(sep);
    if (i === -1) {
      continue;
    }
    const field = line.slice(0, i).trim();
    const message = line.slice(i + sep.length).trim();
    if (field && message) {
      out[field] = message;
    }
  }
  return out;
}
