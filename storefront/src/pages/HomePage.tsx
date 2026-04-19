import { useGetCatalogPingQuery } from '@/features/api/systemEndpoints';
import { formatRsd } from '@/lib/money';
import { Link } from 'react-router-dom';

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="h-4 w-1/3 rounded bg-neutral-200" />
      <div className="mt-4 h-3 w-full rounded bg-neutral-200" />
      <div className="mt-2 h-3 w-5/6 rounded bg-neutral-200" />
    </div>
  );
}

const categoryCards = [
  {
    title: 'Nega lica',
    subtitle: 'Čišćenje, serumi i SPF za svaki tip kože.',
    image: '/images/home/category-face.webp',
  },
  {
    title: 'Nega tela',
    subtitle: 'Hidratacija, piling i svakodnevna zaštita kože tela.',
    image: '/images/home/category-body.webp',
  },
  {
    title: 'Nega kose',
    subtitle: 'Šamponi, maske i tretmani za zdrav sjaj i volumen.',
    image: '/images/home/category-hair.jpg',
  },
] as const;

const featuredProducts = [
  {
    name: 'Hydra Repair Serum',
    price: '3150.00',
    image: '/images/home/product-serum.jpg',
  },
  {
    name: 'Daily Glow Cream',
    price: '2490.00',
    image: '/images/home/product-cream.jpg',
  },
  {
    name: 'Scalp Balance Shampoo',
    price: '1890.00',
    image: '/images/home/product-shampoo.webp',
  },
  {
    name: 'SPF 50+ Fluid',
    price: '2790.00',
    image: '/images/home/product-spf.webp',
  },
] as const;

const benefits = [
  'Besplatna dostava iznad 5.000 RSD',
  'Poklon testeri u svakom paketu',
  'Pažljivo odabrani bestseller proizvodi',
  'Podrška i personalizovane preporuke',
] as const;

const blogHighlights = [
  {
    title: 'Kako složiti večernju rutinu bez preterivanja',
    excerpt: 'Praktični vodič kroz 3 koraka koji daju rezultat bez iritacije kože.',
  },
  {
    title: 'SPF tokom cele godine: šta, kada i koliko',
    excerpt: 'Jasno objašnjenje pravilnog nanošenja i kombinovanja sa makeup-om.',
  },
] as const;

export function HomePage() {
  const { data, isLoading, isError, isFetching, refetch } = useGetCatalogPingQuery();

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br from-white via-neutral-50 to-brand-bg shadow-sm">
        <div className="grid gap-8 p-8 md:grid-cols-2 md:p-10">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700">
              Beauty & Health
            </span>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-neutral-900 md:text-5xl">
              Lepota rutine počinje pravim izborom nege
            </h1>
            <p className="mt-4 max-w-lg text-sm text-neutral-600 md:text-base">
              Estetski, čist i moderan storefront sa fokusom na proizvode, kategorije i iskustvo kupovine inspirisano
              premium online kozmetičkim prodavnicama.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
              >
                Kreni u kupovinu
              </Link>
              <Link
                to="/blog"
                className="rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-neutral-900"
              >
                Skincare saveti
              </Link>
            </div>
          </div>
          <div className="relative min-h-72 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <img
              src="/images/home/hero.webp"
              alt="Elegantna kolekcija kozmetike na svetloj podlozi"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">Istraži po kategorijama</h2>
            <p className="mt-1 text-sm text-neutral-600">Vizuelno jače kategorije koje vode direktno ka kupovini.</p>
          </div>
          <Link to="/shop" className="text-sm font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600">
            Pogledaj sve
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {categoryCards.map((category) => (
            <article key={category.title} className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="h-44 overflow-hidden bg-neutral-50">
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-neutral-900">{category.title}</h3>
                <p className="mt-1 text-sm text-neutral-600">{category.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">Bestseleri ove nedelje</h2>
            <p className="mt-1 text-sm text-neutral-600">Kombinacija premium nege i konkurentnih cena.</p>
          </div>
          <Link to="/shop" className="text-sm font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600">
            U korpu odmah
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <article key={product.name} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <img src={product.image} alt={product.name} className="h-52 w-full object-cover bg-neutral-50" loading="lazy" />
              <div className="p-4">
                <h3 className="text-sm font-medium text-neutral-900">{product.name}</h3>
                <p className="mt-2 text-lg font-semibold text-neutral-900">{formatRsd(product.price)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
        <div>
          <h2 className="text-2xl font-semibold text-neutral-900">Zašto kupci biraju nas</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Kombinujemo proverene proizvode, dobar UX i jasne informacije kako bi kupovina bila prijatna i sigurna.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-neutral-800">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-neutral-900" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
          <img
            src="/images/home/benefits.webp"
            alt="Kozmetički proizvodi i laptop na stolu"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Novo sa bloga</h2>
          <Link to="/blog" className="text-sm font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600">
            Svi članci
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {blogHighlights.map((post) => (
            <article key={post.title} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-neutral-900">{post.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{post.excerpt}</p>
              <Link to="/blog" className="mt-4 inline-flex text-sm font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600">
                Pročitaj više
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-neutral-900">Status backend konekcije</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Health-check za <code className="rounded bg-neutral-100 px-1 text-sm text-neutral-800">GET /api/v1/catalog/ping</code>.
        </p>

        <div className="mt-6">
          {isLoading ? <LoadingCard /> : null}

          {isError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900">
              <p className="font-medium">Nije moguće kontaktirati server</p>
              <p className="mt-2 text-red-800/90">
                Proverite backend i <code className="rounded bg-red-100 px-1 text-red-900">VITE_API_URL</code>.
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-4 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-900 hover:bg-red-100"
              >
                Pokušaj ponovo
              </button>
            </div>
          ) : null}

          {!isLoading && !isError && data && !data.ok ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
              <p className="font-medium">Neočekivan odgovor</p>
              <p className="mt-1 text-amber-900/90">Polje „ok” nije true.</p>
            </div>
          ) : null}

          {!isLoading && !isError && data && data.ok ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
              <p className="text-sm font-medium text-emerald-900">Katalog API je dostupan</p>
              <dl className="mt-3 grid gap-2 font-mono text-sm text-neutral-800 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase text-neutral-500">slice</dt>
                  <dd>{data.slice}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-neutral-500">ok</dt>
                  <dd>{String(data.ok)}</dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-4 text-xs text-neutral-900 underline underline-offset-2 hover:text-neutral-600"
              >
                Osveži podatke
              </button>
              {isFetching ? <span className="ml-2 text-xs text-neutral-500">· osvežavanje…</span> : null}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
