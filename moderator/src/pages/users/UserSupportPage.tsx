import { useState } from 'react';

import { ApiErrorBanner } from '@/components/ApiErrorBanner';
import { useLazyGetAdminUserByEmailQuery, useLazyGetAdminUserByIdQuery } from '@/features/api/supportEndpoints';
import type { AdminUserSupport } from '@/features/support/types';
import { parseApiError } from '@/lib/parseApiError';

function formatInstant(iso: string): string {
  return new Date(iso).toLocaleString('sr-RS', { dateStyle: 'short', timeStyle: 'short' });
}

export function UserSupportPage() {
  const [emailDraft, setEmailDraft] = useState('');
  const [idDraft, setIdDraft] = useState('');
  const [result, setResult] = useState<AdminUserSupport | null>(null);
  const [banner, setBanner] = useState<{ message: string; details: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const [lookupEmail, { isFetching: loadingEmail }] = useLazyGetAdminUserByEmailQuery();
  const [lookupId, { isFetching: loadingId }] = useLazyGetAdminUserByIdQuery();

  const busy = loadingEmail || loadingId;

  async function onSearchEmail() {
    setBanner(null);
    setCopied(false);
    const q = emailDraft.trim();
    if (!q) {
      setBanner({ message: 'Unesite e-adresu', details: [] });
      setResult(null);
      return;
    }
    try {
      const u = await lookupEmail(q).unwrap();
      setResult(u);
    } catch (e) {
      setResult(null);
      setBanner(parseApiError(e));
    }
  }

  async function onSearchId() {
    setBanner(null);
    setCopied(false);
    const n = Number.parseInt(idDraft.trim(), 10);
    if (!Number.isFinite(n) || n <= 0) {
      setBanner({ message: 'Unesite pozitivan numerički ID', details: [] });
      setResult(null);
      return;
    }
    try {
      const u = await lookupId(n).unwrap();
      setResult(u);
    } catch (e) {
      setResult(null);
      setBanner(parseApiError(e));
    }
  }

  async function copyId() {
    if (!result) {
      return;
    }
    try {
      await navigator.clipboard.writeText(String(result.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setBanner({ message: 'Kopiranje u clipboard nije uspelo', details: [] });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Pregled korisnika (podrška)</h2>
        <p className="mt-1 text-sm text-slate-400">
          Pretraga po e-pošti ili po ID naloga. Odgovor ne sadrži lozinku ni tokene (B11).
        </p>
      </div>

      {banner ? (
        <ApiErrorBanner message={banner.message} details={banner.details} onDismiss={() => setBanner(null)} />
      ) : null}

      <div className="grid gap-6 rounded-lg border border-slate-700 bg-slate-900/50 p-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-400">E-pošta</label>
          <div className="mt-1 flex gap-2">
            <input
              type="email"
              value={emailDraft}
              onChange={(e) => setEmailDraft(e.target.value)}
              placeholder="korisnik@example.com"
              className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void onSearchEmail()}
              className="shrink-0 rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-40"
            >
              {loadingEmail ? '…' : 'Traži'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400">ID korisnika</label>
          <div className="mt-1 flex gap-2">
            <input
              value={idDraft}
              onChange={(e) => setIdDraft(e.target.value)}
              placeholder="npr. 42"
              className="w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-sm text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void onSearchId()}
              className="shrink-0 rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-40"
            >
              {loadingId ? '…' : 'Traži'}
            </button>
          </div>
        </div>
      </div>

      {result ? (
        <div className="rounded-lg border border-slate-600 bg-slate-950/50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h3 className="text-base font-semibold text-white">Rezultat</h3>
            <button
              type="button"
              onClick={() => void copyId()}
              className="rounded-md border border-slate-600 px-2 py-1 text-xs text-amber-400 hover:bg-slate-800"
            >
              {copied ? 'Kopirano' : 'Kopiraj ID'}
            </button>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">ID</dt>
              <dd className="font-mono text-slate-200">{result.id}</dd>
            </div>
            <div>
              <dt className="text-slate-500">E-pošta</dt>
              <dd className="break-all text-slate-200">{result.email}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Ime</dt>
              <dd className="text-slate-200">{result.fullName || '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Registracija</dt>
              <dd className="text-slate-200">{formatInstant(result.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Broj narudžbina</dt>
              <dd className="text-slate-200">{result.orderCount}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Uloge</dt>
              <dd className="text-slate-200">{result.roles.join(', ') || '—'}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}
