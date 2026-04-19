import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';

import { CmsPageNotFound } from '@/components/CmsPageNotFound';
import { useGetCmsPageQuery } from '@/features/api/contentEndpoints';
import { isFetchBaseQueryError } from '@/lib/isFetchBaseQueryError';
import { stripHtmlToPlainText } from '@/lib/stripHtml';

export function CmsPage() {
  const { slug: slugParam } = useParams();
  const slug = slugParam ?? '';
  const { data, isLoading, isError, error } = useGetCmsPageQuery(slug, { skip: !slug });

  if (!slug) {
    return <p className="text-sm text-red-700">Nedostaje slug u URL-u.</p>;
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4" aria-busy="true">
        <div className="h-8 w-2/3 rounded bg-neutral-200" />
        <div className="h-40 w-full rounded bg-neutral-200" />
      </div>
    );
  }

  if (isError && isFetchBaseQueryError(error) && error.status === 404) {
    return <CmsPageNotFound slug={slug} />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900">
        <p>Stranica trenutno nije dostupna.</p>
        <Link to="/" className="mt-2 inline-block text-red-800 underline underline-offset-2">
          Na početnu
        </Link>
      </div>
    );
  }

  const plainPreview = stripHtmlToPlainText(data.bodyMarkdown.replace(/^#+\s+/gm, '')).slice(0, 200);

  return (
    <article>
      <Helmet>
        <title>{`${data.title} · Beauty Health`}</title>
        {plainPreview ? <meta name="description" content={plainPreview} /> : null}
      </Helmet>
      <nav className="mb-6 text-sm text-neutral-600" aria-label="Putanja">
        <Link to="/" className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600">
          Početna
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-neutral-500">{data.title}</span>
      </nav>
      <h1 className="text-2xl font-semibold text-neutral-900 md:text-3xl">{data.title}</h1>
      <div className="prose prose-sm mt-8 max-w-none text-neutral-800">
        <div className="whitespace-pre-wrap rounded-lg border border-neutral-200 bg-white p-6 text-sm leading-relaxed shadow-sm">
          {data.bodyMarkdown}
        </div>
      </div>
    </article>
  );
}
