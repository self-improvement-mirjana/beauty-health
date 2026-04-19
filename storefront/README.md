# Storefront (F01)

Korisnički **Vite + React + TypeScript** SPA: **Redux Toolkit** i **RTK Query** za server stanje, **Tailwind CSS**, **ESLint** + **Prettier**. Razvoj na portu **5173** (usklađeno sa CORS listom u backend `application.yml`).

## Zahtevi

- Node 20+ (preporuka), npm
- Pokrenut Spring Boot API (`./gradlew bootRun` iz `backend/`, profil `local`)

## Konfiguracija

```bash
cp .env.example .env
```

- **`VITE_API_URL`** — koren backend-a **bez** putanje `/api` (npr. `http://localhost:8080`). Isti dogovor kao za [moderator](../moderator/README.md).

## Komande

```bash
cd storefront
npm install
npm run dev
```

Aplikacija: `http://localhost:5173`. Početna strana poziva **`GET /api/v1/catalog/ping`** (B04) i prikazuje loading / grešku / uspeh (F01 primer feature modula u `src/features/api/systemEndpoints.ts`).

```bash
npm run build   # tsc + vite build
npm run lint
npm run format  # Prettier
npm run test    # Vitest (npr. formatRsd)
```

## Tiket F01

- Jedinstveni API klijent: `src/features/api/baseApi.ts` + `systemEndpoints.ts` (RTK Query `fetchBaseQuery`).
- `ErrorBoundary` oko aplikacije u `src/main.tsx`.
- Obrasci **loading** i **error** (i „empty” kada `ok !== true`) na `HomePage`.

## Tiket F02

- **`MainLayout`**: globalni **zaglavlje** (navigacija, „Products search” → `/search?q=`, **Korpa** sa brojačem), **futer** sa linkovima na `/pages/{slug}` (stub slugovi iz specifikacije 9).
- **Rute**: `/shop`, `/brands`, `/brand/:slug`, `/category/:slug`, `/blog`, `/locations`, `/login`, `/register`, `/account` (F06), `/cart`, `/checkout` (F07), `/search`, `/pages/:slug` + početna `/`.
- **`formatRsd`** u `src/lib/money.ts` — prikaz `3.600,00 RSD`; **Vitest** `npm run test`.
- **Responsive** meni (hamburger), **skip link** na sadržaj, `focus-visible` obrubi na linkovima/dugmadima/inputima.

Dalji tiketi (F08+): dodatni checkout / SEO / i18n proširenja.

## Tiket F03

- **RTK Query** (`src/features/api/catalogEndpoints.ts`): `listProducts`, `searchProducts`, `listBrandProducts`, `listBrands`, `categoryTree` → B04/B05.
- **`ProductCard`**: cene preko `formatRsd`, CTA po `ctaType` (`ADD_TO_CART` / `CHOOSE_OPTIONS` / `OUT_OF_STOCK`); „Odaberite opcije” vodi na PDP (F05: `ADD_TO_CART` šalje B06).
- **Stranice**: `/shop` (listing + stablo kategorija), `/brand/:slug`, `/category/:slug`, `/search?q=`, `/brands` (lista brendova); **`/p/:slug`** PDP (F04).
- **Paginacija**: URL parametri `page`, `size` (`useListingPagination`).
- **Pretraga**: prazan upit ne zove API; dugmad u headeru disabled dok nema teksta.
- **Skeleton / greške**: `ProductGridSkeleton`, `ErrorState` + `parseApiError` (B02 telo greške).

## Tiket F04

- **PDP** (`ProductPage`, `GET /api/v1/products/{slug}`): brend kao link, cene i zalihe po izabranoj varijanti, izbor opcija / varijante, CTA „Dodaj u korpu“ samo uz varijantu na zalihama.
- **Tabovi** (`ProductPdpTabs`): Opis, Dodatne informacije (kategorije), Recenzije (`GET .../reviews`), Isporuka i Napomena (statički tekst po spec. 5.5); tastatura (strelice, Home/End).
- **SEO**: `document.title` i `<meta name="description">` iz naziva i kratkog opisa.
- **Pomoćni modul** `pdpVariantSelection` + Vitest.

## Tiket F05

- **Korpa (B06)**: `src/features/api/cartEndpoints.ts` + tipovi u `src/features/cart/types.ts` — `GET /cart`, `GET /cart/summary`, `POST /cart/items`, `PATCH` / `DELETE` stavke.
- **`baseApi`**: `prepareHeaders` šalje `X-Guest-Cart-Token` iz `sessionStorage`; nakon odgovora upis tokena iz istog headera (zahteva **CORS exposed header** na backendu).
- **`CartPage`**: stavke sa `formatRsd`, izmena količine, uklanjanje, međuzbir; prazna korpa + CTA na `/shop` (spec. 6.2).
- **`Header`**: badge `totalQuantity` sa `/cart/summary`, `refetchOnFocus` + kratki poll.
- **`AddToCartSearchParamsBanner`** u `MainLayout`: `?add-to-cart=<variantId>` (B06 očekuje **variantId**, ne productId iz starog teksta specifikacije 6.3).
- **Recenzije**: `ProductReviewForm` (POST B08), poruka da email nije javan, čekboks + `localStorage` za ime/email; lista se osvežava preko RTK taga `Reviews`.

**TBD (spec. 6.5)**: linijski prikaz regular vs akcijska cena u korpi, kuponi i dostava u korpi — šta API još ne izlaže u potpunosti, ostaje za kasnije.

## Tiket F06

- **B03 JWT**: `sessionStorage` (`beautyhealth_auth_session` — `accessToken` + `user`); `Authorization: Bearer` u `baseApi.prepareHeaders` (`src/lib/authSession.ts`).
- **Redux** `authSlice` + `authEndpoints` (`login`, `register`, `getAuthMe`, `logout`); `AuthBootstrap` osvežava `/auth/me` i čisti istekao token (gost korpa ostaje).
- **Stranice**: `LoginPage`, `RegisterPage` — **react-hook-form** + **Zod**; greške iz B02 `details` mapirane na polja (`mapApiFieldErrors`); prijava 401 → čitljiva poruka bez curenja detalja.
- **Zaštićene rute**: `RequireAuth` + ugnježdeni `AccountLayout` → `/account` (pregled, placeholder „Porudžbine”); redirect na `/login?next=…`.
- **Korpa posle prijave**: ako postoji gost token, `POST /cart/merge` (B06); uspešan merge briše gost token u `mergeCart` lifecycle-u.
- **Odjava**: `POST /auth/logout` (204) + `clearCredentials`, brisanje gost korpe iz `sessionStorage`, invalidacija cart tagova (`useLogoutAction`).
- **Zavisnosti npm**: `react-hook-form`, `@hookform/resolvers`, `zod`.

## Tiket F07

- **Checkout** (`/checkout`, `RequireAuth`): forma po B07 `CreateOrderRequest` (react-hook-form + Zod); `POST /api/v1/orders`; potvrda sa `orderId`, status, `total`, `deliverySummaryText`; korpa se prazni preko invalidacije tagova.
- **Rokovi isporuke (7.2)**: uvod iz CMS stranice slug `isporuka` (`GET /api/v1/pages/isporuka`) ako postoji; inače statički fallback + link na punu stranicu.
- **Korpa**: CTA „Nastavi na poručivanje” za ulogovanog; gost → link na `/login?next=/checkout`.
- **Lokacije**: `GET /api/v1/locations` — kartice sa adresom, telefonom, radnim vremenom (`LocationsPage`).
- **CMS** (`/pages/:slug`): `GET /api/v1/pages/{slug}`; **404** (`CmsPageNotFound`) za nepoznat slug; telo kao običan tekst (`whitespace-pre-wrap`).
- **SEO**: `react-helmet-async` (`HelmetProvider` u `main.tsx`); dinamički `title` / `meta description` na CMS i checkout potvrdi.
- **i18n**: politika u `storefront/docs/I18N.md` — **SR only** za sada.
- **Npm**: `react-helmet-async`.
