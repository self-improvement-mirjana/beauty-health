# Moderator (M01)

Odvojena **Vite + React + TypeScript** aplikacija za moderatore: Redux Toolkit, RTK Query, Tailwind, `react-router-dom` (`createBrowserRouter`). Port razvoja **5174** (isti kao u CORS listi backend-a za moderator UI).

## Zahtevi

- Node 20+ (preporuka), npm
- Pokrenut backend (`./gradlew bootRun` iz `backend/`, profil `local`)

## Konfiguracija

Kopiraj `.env.example` u `.env` i prilagodi:

- **`VITE_API_URL`** — koren backend-a **bez** `/api` (npr. `http://localhost:8080`). Isti dogovor kao za storefront (F01).

## Komande

```bash
cd moderator
npm install
npm run dev
```

Aplikacija: `http://localhost:5174`. Prijava ide na `POST /api/v1/auth/login` (B03); JWT se čuva u `localStorage` i šalje kao `Authorization: Bearer …`.

## Uloge i zaštita ruta

- **Moderator** (`MODERATOR` u `user.roles` iz login odgovora): pristup `/` i modulima u navigaciji.
- **Kupac** (samo `CUSTOMER`): posle uspešnog logina ide na **`/forbidden`** („Nemate pristup”); ručan unos moderatorskih putanja ne otvara modul — klijentski guard + backend i dalje vraća **403** na `/api/v1/admin/**`.

## Tiket M01

Login (`/login`), dashboard (`/`), layout (sidebar + top bar + odjava). Moduli **`/orders`** (M04), **`/content`** (M05) i **`/users`** (M06) su implementirani.

## Tiket M02 — katalog (proizvodi)

- **`/products`** — lista (`GET /api/v1/products`) sa filterima i paginacijom.
- **`/products/new`** — kreiranje (`POST /api/v1/admin/products`), `react-hook-form` + **Zod**; zalihe po magacinima iz `GET /api/v1/admin/store-locations`.
- **`/products/:slug/edit`** — osnovno (`PUT /api/v1/admin/products/{id}`), cene (`PATCH .../prices`), zalihe (`PATCH .../inventory`), čitanje detalja i neaktivnih: `GET /api/v1/admin/products/detail?slug=…`; deaktivacija (bez brisanja u B10).
- **Testovi**: `npm run test` (Vitest + RTL, mock API za kreiranje).

Backend mora izlagati prošireni PDP (`id`, `brandId`, `active`, `categories[].id`) i admin GET-ove iznad — vidi `backend/README.md` (B04/B10).

## Tiket M03 — brendovi i kategorije

- **`/brands`** — tabela brendova, modal kreiranje/izmena (`name`, `slug`); potvrda pre brisanja; SEO upozorenje pri promeni slug-a; konflikt slug-a preko `ApiError` (**409**).
- **`/categories`** — stablasti prikaz (sklapanje čvorova), CRUD sa `parentCategoryId`, `sortOrder`, `active`, `description`; izbor roditelja samo među **aktivnim** (osim trenutnog roditelja pri izmeni); isključeni su čvor i potomci da se na frontu ne bi birao ciklus; pregled URL-a `/category/{slug}`; brisanje onemogućeno ako postoje deca (backend i dalje štiti).

## Tiket M04 — narudžbine (pregled i status)

- **`/orders`** — lista (`GET /api/v1/admin/orders`) sa filterom statusa, opsegom datuma (`from` / `to` kao ISO instant; `to` je **isključivo** na serveru) i paginacijom.
- **`/orders/:id`** — detalj (`GET /api/v1/admin/orders/{id}`): kupac (e-pošta, ID naloga), stavke, adresa, plaćanje (stub polja iz API-ja); promena statusa `PATCH .../status` sa istom matricom prelaza kao na backendu; modal pre otkazivanja; greške **409** kroz `ApiErrorBanner` / `parseApiError`.
- **Test**: `src/lib/orderStatusTransitions.test.ts` (Vitest).

## Tiket M05 — sadržaj (CMS, lokacije, blog)

- **`/content`** — podrazumevano preusmerenje na **`/content/cms`**; zajednički layout sa karticama CMS / Lokacije / Blog.
- **`/content/cms`** — lista CMS stranica (`GET /api/v1/admin/cms-pages`) sa filterom (sve / objavljene / nacrti); kreiranje/izmena/brisanje; učitavanje tela za izmenu: `GET /api/v1/admin/cms-pages/{id}`; forma **react-hook-form + Zod** (slug regex kao backend); **react-markdown** pregled pored textarea; upozorenje pri promeni slug-a.
- **`/content/locations`** — CRUD maloprodajnih lokacija (`/api/v1/admin/retail-locations`).
- **`/content/blog`** — CRUD blog članaka (`/api/v1/admin/blog-posts`); detalj `GET /api/v1/admin/blog-posts/{id}`; opciono `publishedAt` (`datetime-local` → ISO; prazno pri objavi = server `Instant.now()`); predlog slug-a iz naslova.
- Zavisnost: **`react-markdown`** (`npm install` u `moderator/`).

## Tiket M06 — recenzije i podrška (korisnik)

- **`/users`** — preusmerenje na **`/users/reviews`**; zajednički layout sa GDPR/PII upozorenjem i karticama **Recenzije** / **Podrška**.
- **`/users/reviews`** — lista recenzija (`GET /api/v1/admin/reviews`) sa filterom slug proizvoda i statusa odobrenja; paginacija; **Odobri** / **Sakrij** preko `PATCH /api/v1/admin/reviews/{id}/approval`. Nova kupčeva recenzija ostaje van PDP dok moderator ne odobri (B08 + backend).
- **`/users/support`** — pretraga korisnika po e-pošti ili ID (`GET /api/v1/admin/users?email=`, `GET /api/v1/admin/users/{id}`); prikaz: id, ime, e-pošta, registracija, **broj narudžbina**, uloge; dugme **Kopiraj ID**.
