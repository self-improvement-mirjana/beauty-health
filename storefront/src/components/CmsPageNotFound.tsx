import { Link } from 'react-router-dom';

type Props = {
  slug: string;
};

export function CmsPageNotFound({ slug }: Props) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-neutral-200 bg-white px-6 py-12 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-neutral-900">Stranica nije pronađena</h1>
      <p className="mt-2 text-sm text-neutral-600">
        Nema objavljenog sadržaja za slug <span className="font-mono text-neutral-800">{slug}</span>.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block text-sm text-neutral-900 underline underline-offset-2 hover:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
      >
        Na početnu
      </Link>
    </div>
  );
}
