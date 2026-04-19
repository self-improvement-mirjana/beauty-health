import { type FormEvent, useEffect, useState } from 'react';

import { useAppSelector } from '@/app/hooks';
import { ErrorState } from '@/components/ErrorState';
import { useCreateProductReviewMutation } from '@/features/api/catalogEndpoints';
import { selectAuthUser } from '@/features/auth/authSlice';

const LS_NAME = 'beautyhealth_review_author_name';
const LS_EMAIL = 'beautyhealth_review_author_email';

type Props = {
  slug: string;
};

export function ProductReviewForm({ slug }: Props) {
  const authUser = useAppSelector(selectAuthUser);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [remember, setRemember] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [body, setBody] = useState('');
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  const [createReview, { isLoading, isError, error, reset }] = useCreateProductReviewMutation();

  useEffect(() => {
    try {
      const n = localStorage.getItem(LS_NAME);
      const e = localStorage.getItem(LS_EMAIL);
      if (n) {
        setAuthorName(n);
      }
      if (e) {
        setAuthorEmail(e);
        setRemember(true);
      }
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    if (!authUser) {
      return;
    }
    setAuthorName((prev) => (prev.trim() ? prev : authUser.fullName.trim()));
    setAuthorEmail((prev) => (prev.trim() ? prev : authUser.email.trim().toLowerCase()));
  }, [authUser]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setDoneMessage(null);
    reset();
    try {
      await createReview({
        slug,
        body: {
          authorName: authorName.trim(),
          authorEmail: authorEmail.trim(),
          rating,
          body: body.trim(),
          publicEmail: false,
        },
      }).unwrap();
      if (remember) {
        try {
          localStorage.setItem(LS_NAME, authorName.trim());
          localStorage.setItem(LS_EMAIL, authorEmail.trim());
        } catch {
          /* ignore */
        }
      } else {
        try {
          localStorage.removeItem(LS_NAME);
          localStorage.removeItem(LS_EMAIL);
        } catch {
          /* ignore */
        }
      }
      setBody('');
      setDoneMessage('Hvala! Recenzija je poslata i čeka odobrenje moderatora pre objave.');
    } catch {
      /* RTK sets error */
    }
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <h3 className="text-sm font-semibold text-neutral-900">Dodaj recenziju</h3>
      <p className="mt-2 text-xs text-neutral-600">
        Vaša e-adresa se čuva radi verifikacije i{' '}
        <span className="font-medium text-neutral-700">ne prikazuje se javno</span> na listi recenzija.
      </p>

      {doneMessage ? (
        <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {doneMessage}
        </p>
      ) : null}

      {isError ? (
        <div className="mt-3">
          <ErrorState error={error} onRetry={() => reset()} />
        </div>
      ) : null}

      <form onSubmit={(e) => void onSubmit(e)} className="mt-4 space-y-4">
        <div>
          <label htmlFor={`review-name-${slug}`} className="block text-xs font-medium text-neutral-700">
            Ime
          </label>
          <input
            id={`review-name-${slug}`}
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            required
            maxLength={120}
            autoComplete="name"
            className="mt-1 w-full max-w-md rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          />
        </div>
        <div>
          <label htmlFor={`review-email-${slug}`} className="block text-xs font-medium text-neutral-700">
            E-pošta
          </label>
          <input
            id={`review-email-${slug}`}
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            required
            maxLength={255}
            autoComplete="email"
            className="mt-1 w-full max-w-md rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          />
        </div>

        <fieldset>
          <legend className="text-xs font-medium text-neutral-700">Ocena (1–5)</legend>
          <div className="mt-2 flex flex-wrap items-center gap-0.5" role="radiogroup" aria-label="Ocena proizvoda">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} od 5 zvezdica`}
                onClick={() => setRating(n)}
                className={`rounded p-0.5 text-xl leading-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
                  n <= rating ? 'text-neutral-900' : 'text-neutral-300 hover:text-neutral-500'
                }`}
              >
                {'\u2605'}
              </button>
            ))}
            <span className="ml-2 text-xs text-neutral-500">{rating} / 5</span>
          </div>
        </fieldset>

        <div>
          <label htmlFor={`review-body-${slug}`} className="block text-xs font-medium text-neutral-700">
            Tekst recenzije
          </label>
          <textarea
            id={`review-body-${slug}`}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            maxLength={4000}
            rows={5}
            className="mt-1 w-full max-w-xl rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="mt-1 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
          />
          <span>Sačuvaj moje podatke u ovom pregledaču (ime i e-pošta, bez lozinke).</span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
        >
          {isLoading ? 'Slanje…' : 'Pošalji recenziju'}
        </button>
      </form>
    </div>
  );
}
