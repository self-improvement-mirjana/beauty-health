import { Link } from 'react-router-dom';

import { FOOTER_INFO_LINKS } from '@/layouts/footerLinks';

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-900">Beauty Health</p>
            <p className="mt-3 text-sm text-neutral-600">
              Tvoje omiljeno mesto za kupovinu kozmetike i skincare rituale koji daju rezultat.
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Korisne informacije</p>
            <ul className="mt-3 columns-1 gap-x-8 text-sm sm:columns-2">
              {FOOTER_INFO_LINKS.map((item) => (
                <li key={item.slug} className="mb-2 break-inside-avoid">
                  <Link
                    to={`/pages/${encodeURIComponent(item.slug)}`}
                    className="text-neutral-700 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-8 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Beauty Health • Online prodavnica kozmetike
        </p>
      </div>
    </footer>
  );
}
