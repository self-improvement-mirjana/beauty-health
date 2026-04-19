type MoneyInput = string | number | { amount: string };

/**
 * Parsira iznos iz API-ja (B02 `MoneyResponse.amount` je string sa tačkom kao decimalnim separatorom).
 */
function toNumber(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.');
  return Number.parseFloat(normalized);
}

function groupThousands(intDigits: string): string {
  const sign = intDigits.startsWith('-') ? '-' : '';
  const abs = intDigits.replace(/^-/, '');
  const grouped = abs.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return sign + grouped;
}

/**
 * Prikaz cene u RSD po specifikaciji: hiljade `.`, decimale `,`, sufiks ` RSD` (npr. `3.600,00 RSD`).
 */
export function formatRsd(value: MoneyInput): string {
  const amount = typeof value === 'object' && value !== null && 'amount' in value ? value.amount : value;
  const n = toNumber(amount);
  if (!Number.isFinite(n)) {
    return '—';
  }
  const rounded = Math.round(n * 100) / 100;
  const [intRaw, dec = '00'] = rounded.toFixed(2).split('.');
  return `${groupThousands(intRaw)},${dec} RSD`;
}
