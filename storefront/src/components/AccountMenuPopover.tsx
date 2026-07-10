import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

import { useAppSelector } from '@/app/hooks';
import { useGetMePreferencesQuery } from '@/features/api/preferencesEndpoints';
import { selectAccessToken } from '@/features/auth/authSlice';
import { usePopoverDock } from '@/hooks/usePopoverDock';
import type { UserDto } from '@/features/auth/types';
import { readAuthSession } from '@/lib/authSession';

type Item = {
  to: string;
  title: string;
  description: string;
  icon: 'repeat' | 'box' | 'heart' | 'user' | 'users';
};

const items: Item[] = [
  {
    to: '/account/ponovo-kupi',
    title: 'Ponovo kupi',
    description: 'Brzi ponovni nalozi iz ranijih kupovina.',
    icon: 'repeat',
  },
  {
    to: '/account/porudzbine',
    title: 'Istorija porudžbina',
    description: 'Pregled i praćenje porudžbina.',
    icon: 'box',
  },
  {
    to: '/lista-zelja',
    title: 'Moje liste',
    description: 'Sačuvani proizvodi na ovom uređaju.',
    icon: 'heart',
  },
  {
    to: '/account/informacije',
    title: 'Podešavanja naloga',
    description: 'Podaci o nalogu, odjava i bezbednost.',
    icon: 'user',
  },
  {
    to: '/blog',
    title: 'Blog i inspiracija',
    description: 'Saveti, trendovi i novosti.',
    icon: 'users',
  },
];

function ProfileAvatar({ className }: { className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white ring-2 ring-white ${className ?? ''}`.trim()}
    >
      <svg className="h-[55%] w-[55%]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </span>
  );
}

function MenuIcon({ kind, className }: { kind: Item['icon']; className?: string }) {
  const c = className ?? 'h-5 w-5 shrink-0 text-neutral-600';
  switch (kind) {
    case 'repeat':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.35} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case 'box':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.35} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      );
    case 'heart':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.35} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      );
    case 'users':
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.35} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      );
    default:
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.35} aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      );
  }
}

/** Prvo ime sa ispravnim početnim slovom (npr. mirjana → Mirjana). */
function formatFirstNameForGreeting(fullName: string): string {
  const first = fullName.trim().split(/\s+/)[0] ?? '';
  if (!first || first.toLowerCase() === 'gost') {
    return first || 'gost';
  }
  return first.charAt(0).toLocaleUpperCase('sr-Latn') + first.slice(1).toLocaleLowerCase('sr-Latn');
}

function greetingHeadline(): string {
  const d = new Date();
  const day = d.getDay();
  const h = d.getHours();
  if (day === 0 || day === 6) {
    return h < 17 ? 'Lep vikend' : 'Prijatno veče';
  }
  if (h < 12) {
    return 'Dobro jutro';
  }
  if (h < 18) {
    return 'Dobar dan';
  }
  return 'Dobro veče';
}

type Props = {
  user: UserDto | null;
  onLogout: () => void;
  flyoutOpen: boolean;
  onFlyoutOpen: () => void;
  onFlyoutScheduleClose: () => void;
  onFlyoutCancelClose: () => void;
  onFlyoutCloseNow: () => void;
};

export function AccountMenuPopover({
  user,
  onLogout,
  flyoutOpen: open,
  onFlyoutOpen,
  onFlyoutScheduleClose,
  onFlyoutCancelClose,
  onFlyoutCloseNow,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dock = usePopoverDock(open, triggerRef);
  const effectiveUser = user ?? readAuthSession()?.payload.user ?? null;
  const accessToken = useAppSelector(selectAccessToken);
  const { data: prefsMe } = useGetMePreferencesQuery('skin_care', {
    skip: !accessToken?.trim(),
  });
  const profilePercent = prefsMe?.progress?.percent ?? 0;

  const handleRootLeave = (e: React.MouseEvent) => {
    const next = e.relatedTarget as Node | null;
    if (next && rootRef.current?.contains(next)) {
      return;
    }
    onFlyoutScheduleClose();
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onFlyoutCloseNow();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onFlyoutCloseNow]);

  if (!effectiveUser) {
    return null;
  }

  const displayName = effectiveUser.fullName?.trim() || effectiveUser.email?.split('@')[0] || 'gost';
  const isModerator = Boolean(effectiveUser.roles?.some((r) => r === 'MODERATOR'));
  const firstName = formatFirstNameForGreeting(displayName);

  return (
    <div
      className="relative"
      ref={rootRef}
      onMouseEnter={() => {
        onFlyoutCancelClose();
        onFlyoutOpen();
      }}
      onMouseLeave={handleRootLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        className="group flex shrink-0 max-w-[16rem] items-center gap-2 rounded-md py-1 pl-0.5 pr-1.5 text-left transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2 sm:max-w-[18rem] sm:pr-2 md:max-w-[20rem]"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Nalog: ${effectiveUser.fullName?.trim() || effectiveUser.email}`}
        title={effectiveUser.fullName?.trim() || effectiveUser.email}
      >
        <ProfileAvatar className="h-8 w-8" />
        <span className="min-w-0 leading-tight">
          <span className="block text-[13px] text-neutral-900 sm:text-[14px]">
            <span className="font-normal text-neutral-700">Zdravo, </span>
            <span className="font-semibold tracking-tight text-neutral-900">{firstName}</span>
          </span>
          {isModerator ? (
            <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-600">
              Moderator
            </span>
          ) : null}
        </span>
        <svg
          className={`ml-0.5 h-4 w-4 shrink-0 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open ? (
        <div
          className="pointer-events-auto fixed z-[100] w-[min(24rem,calc(100vw-1.5rem))]"
          style={{ top: dock.top, right: dock.right }}
          role="presentation"
        >
          <div
            className="overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)]"
            role="dialog"
            aria-label="Meni naloga"
          >
          <div className="border-b border-neutral-100 bg-white px-4 pb-4 pt-4">
            <div className="flex items-start gap-3">
              <ProfileAvatar className="h-14 w-14" />
              <div className="min-w-0 pt-1">
                <p className="text-[0.95rem] font-semibold leading-snug text-neutral-900">
                  {greetingHeadline()}, {firstName}.{' '}
                  <span className="inline-block" aria-hidden>
                    {'\u{1F64C}'}
                  </span>
                </p>
                {effectiveUser.email ? (
                  <p className="mt-1 truncate text-xs text-neutral-500" title={effectiveUser.email}>
                    {effectiveUser.email}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-neutral-50 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Preferencije i profil</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600">
                Dopunite profil za bolje preporuke i brži pristup porudžbinama.
              </p>
              <Link
                to="/account/preferencije"
                className="mt-2 inline-block text-xs font-semibold text-[rgb(0,76,151)] hover:underline"
                onClick={() => onFlyoutCloseNow()}
              >
                Preferencije lepote — podesite profil
              </Link>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-emerald-600/90 transition-[width] duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, profilePercent))}%` }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-neutral-400">
                Ime i lozinku menjate u podešavanjima; telefon i adrese uskoro.
              </p>
            </div>

            <Link
              to="/shop"
              className="mt-3 block rounded-md bg-[rgb(0,76,151)] px-3 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-95"
              onClick={() => onFlyoutCloseNow()}
            >
              Pogledajte asortiman u prodavnici
            </Link>
          </div>

          <nav className="max-h-[min(22rem,65vh)] overflow-y-auto overscroll-contain px-1.5 py-2" aria-label="Stavke naloga">
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              Brzi izbor
            </p>
            <ul className="divide-y divide-neutral-100">
              {items.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-neutral-50"
                    onClick={() => onFlyoutCloseNow()}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-100">
                      <MenuIcon kind={item.icon} className="h-5 w-5 text-neutral-700" />
                    </span>
                    <span className="min-w-0 py-0.5">
                      <span className="block text-sm font-semibold text-neutral-900">{item.title}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-neutral-500">{item.description}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-neutral-100 bg-neutral-50/80 px-2 py-2">
            <button
              type="button"
              className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-neutral-700 transition-colors hover:bg-white hover:text-neutral-900"
              onClick={() => {
                onFlyoutCloseNow();
                void onLogout();
              }}
            >
              Odjava
            </button>
          </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
