/** Stil oznake statusa porudžbine (backend vrednosti mogu varirati). */
export function orderStatusBadgeClass(status: string): string {
  const s = status.toUpperCase();
  if (s.includes('CANCEL') || s.includes('OTKAZ')) {
    return 'bg-red-50 text-red-900 ring-1 ring-inset ring-red-100';
  }
  if (s.includes('DELIVER') || s.includes('DONE') || s.includes('COMPLET') || s.includes('ZAVRŠ')) {
    return 'bg-emerald-50 text-emerald-900 ring-1 ring-inset ring-emerald-100';
  }
  if (s.includes('PEND') || s.includes('WAIT') || s.includes('NEW') || s.includes('PLAC')) {
    return 'bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-100';
  }
  return 'bg-neutral-100 text-neutral-800 ring-1 ring-inset ring-neutral-200';
}

export function formatPaymentLabel(provider: string): string {
  const t = provider.trim();
  if (!t) {
    return '—';
  }
  return t
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Čitljiv prikaz statusa plaćanja (npr. PAID → Paid). */
export function formatPaymentStatus(status: string): string {
  return formatPaymentLabel(status);
}
