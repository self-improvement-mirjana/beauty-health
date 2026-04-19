# Category facet i javni API

## Problem

Na PLP-u (npr. `/category/lice`) sidebar filteri šalju **`categoryFacet`** u query stringu, ali broj rezultata se nekada nije menjao — kao da backend ignoriše facet-e.

## Razlike u odnosu na navigaciju u headeru

- **Mega-menu / kategorija u putanji**: menja se samo **`categorySlug`** (jedna kategorija u stablu). Backend filtrira po toj grani.
- **Facet „Tip kože“ itd.**: šalju se **dodatni** parametri **`categoryFacet`** (više vrednosti = OR). Backend ih mora parsirati i u SQL-u kombinovati sa glavnom kategorijom (AND).

## Backend

- Kontroler: `backend/src/main/java/com/beautyhealth/catalog/api/PublicProductController.java`
- Lista: **`GET /api/v1/products`** sa opcionim `categorySlug`, ponovljenim **`categoryFacet`**, `brandSlug`, `sort`, itd.
- Faceti se čitaju iz servlet zahteva (`HttpServletRequest`) da bi više istoimenih parametara bilo pouzdano obrađeno.

## Storefront

- Gradnja URL-a: `storefront/src/features/api/catalogEndpoints.ts` — **`categoryFacet`** kao više `append('categoryFacet', slug)`.
- Parsiranje iz URL-a: `storefront/src/lib/categoryFacetParams.ts`.
- Stranice: `CategoryPage.tsx`, `ShopPage.tsx` — sinhronizacija sa `searchParams`.

## Smoke test (curl)

```bash
curl -sS "http://127.0.0.1:8080/api/v1/products?categorySlug=lice&page=0&size=1"
curl -sS "http://127.0.0.1:8080/api/v1/products?categorySlug=lice&categoryFacet=SLUG1&categoryFacet=SLUG2&page=0&size=1"
```

Uporediti **`totalElements`** — sa facet-ima treba da bude manji kad facet-i imaju smisla u podacima.

## Napomena o stablu kategorija

Ako facet-kategorija (npr. „tip kože“) nije hijerarhijski vezana za roditelja u bazi, rezultati mogu izgledati pogrešno. To se rešava migracijama / seed-om / ručnim `UPDATE` u dev okruženju — zavisno od konkretnog Liquibase changeseta.
