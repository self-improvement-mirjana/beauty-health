import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useListBrandsQuery } from '@/features/api/catalogEndpoints';
import { ErrorState } from '@/components/ErrorState';
import type { BrandSummaryDto } from '@/features/catalog/types';

type BrandListItem = {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  unavailable?: boolean;
};

const SHOP_STYLE_BRAND_NAMES = [
  'Abib',
  'About Tone',
  'Active Nine',
  'Acwell',
  'Aestura',
  'Anua',
  'Apieu',
  'APLB',
  'Aprilskin',
  'Arensia',
  'Aromatica',
  'Atopalm',
  'Axis-Y',
  'A.H.C',
  'Banila Co',
  'Baren',
  'BB Lab',
  'Biodance',
  'Bioheal Boh',
  'Be the Skin',
  'Boto',
  'Branden',
  'Celimax',
  'Celdyque',
  'Centellian24',
  'Cerave',
  'Cetaphil',
  'CKD',
  'CNP',
  'Colorgram',
  'Coreana N:Ample',
  'Cos de Baha',
  'Cosrx',
  'Coyu',
  'CP-1',
  "D'Alba",
  'Danongwon',
  'Dear Klairs',
  'Derma:B',
  'Dr.Althea',
  'Dr.Ceuracle',
  'Dr.G',
] as const;

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function slugFromName(value: string): string {
  return normalizeText(value).replace(/\s+/g, '-');
}

function mergeBrandList(brands: BrandSummaryDto[]): BrandListItem[] {
  const used = new Set<number>();
  const featured = SHOP_STYLE_BRAND_NAMES.map((name, index) => {
    const normalized = normalizeText(name);
    const match = brands.find(
      (item) => normalizeText(item.name) === normalized || normalizeText(item.slug) === normalized,
    );
    if (match) {
      used.add(match.id);
      return { ...match, name };
    }
    return {
      id: -(index + 1),
      name,
      slug: slugFromName(name),
      unavailable: true,
    };
  });

  const remaining = brands.filter((item) => !used.has(item.id));
  return [...featured, ...remaining];
}

export function BrandsIndexPage() {
  const [letter, setLetter] = useState<string>('ALL');
  const { data, isLoading, isError, error, refetch } = useListBrandsQuery();
  const merged = useMemo(() => mergeBrandList(data ?? []), [data]);
  const letters = useMemo(() => ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), '#'], []);
  const filtered = useMemo(() => {
    if (letter === 'ALL') {
      return merged;
    }
    if (letter === '#') {
      return merged.filter((b) => !/^[A-Za-z]/.test(b.name));
    }
    return merged.filter((b) => b.name.toUpperCase().startsWith(letter));
  }, [merged, letter]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">Brendovi</h1>
      <p className="mt-1 text-sm text-neutral-600">A-Z listing brendova, sa stilom kao na referentnom sajtu.</p>

      <div className="mt-8">
        {isLoading ? <p className="text-sm text-neutral-500">Učitavanje…</p> : null}
        {isError ? <ErrorState error={error} onRetry={() => void refetch()} /> : null}
        {merged.length ? (
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="flex flex-wrap gap-2 border-b border-neutral-200 px-4 py-3">
              {letters.map((entry) => {
                const active = entry === letter;
                return (
                  <button
                    key={entry}
                    type="button"
                    onClick={() => setLetter(entry)}
                    className={[
                      'rounded px-2 py-1 text-sm font-medium transition-colors',
                      active ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100',
                    ].join(' ')}
                  >
                    {entry === 'ALL' ? 'Svi A-Z' : entry}
                  </button>
                );
              })}
            </div>
            <ul className="grid gap-1 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((b) => (
                <li key={b.id}>
                  {b.unavailable ? (
                    <div className="rounded-md px-2 py-1.5 text-sm text-neutral-500">
                      {b.name} <span className="text-xs text-neutral-500">(uskoro)</span>
                    </div>
                  ) : (
                    <Link
                      to={`/brand/${encodeURIComponent(b.slug)}`}
                      className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm text-neutral-800 hover:bg-neutral-100"
                    >
                      {b.logoUrl ? (
                        <img
                          src={b.logoUrl}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="h-9 w-9 shrink-0 rounded-md border border-neutral-200 bg-white object-contain p-0.5"
                          loading="lazy"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dashed border-neutral-300 bg-neutral-50 text-[10px] text-neutral-500">
                          —
                        </span>
                      )}
                      <span className="min-w-0 truncate">{b.name}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {!isLoading && !isError && !merged.length ? (
          <p className="text-sm text-neutral-500">Nema brendova u katalogu.</p>
        ) : null}
        {!isLoading && !isError && merged.length && !filtered.length ? (
          <p className="mt-4 text-sm text-neutral-500">Nema brendova za izabrano slovo.</p>
        ) : null}
        {!isLoading && !isError && !data?.length ? (
          <p className="mt-4 text-xs text-neutral-500">
            Prikazane su i referentne stavke sa sajta. Dodaj brendove u backend da postanu aktivni linkovi.
          </p>
        ) : null}
      </div>
    </div>
  );
}
