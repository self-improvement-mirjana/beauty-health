---
name: Preferencije profila (DB→BE→FE)
overview: Uvesti poseban domenski model za korisničke beauty preference (grupa kao „Negu kože“, kategorije kao „Tip kože“, opcije sa načinom izbora), per-user izbore u PostgreSQL-u, REST u novom backend slice-u sa JWT zaštitom, zatim stranicu sa akordeonima i povezivanje progress bara u nalog meniju — uz opciono mapiranje na postojeće katalog-facete radi filtera na PLP-u.
todos:
  - id: db-schema-seed
    content: "Liquibase: preference_scope / preference_category / preference_option / user_preference_selection + seed za prvi scope (negu kože) + opcioni catalog_category_id"
    status: pending
  - id: backend-slice
    content: "Spring slice: entiteti, repo, servis (SINGLE/MULTI, progress), GET javni takson, GET/PUT me/preferences pod JWT, SecurityConfiguration, WebMvcTest"
    status: pending
  - id: storefront-ui
    content: Stranica akordeona + RTK Query; AccountMenuPopover progress sa API; opciono PLP „Primeni preference“
    status: pending
isProject: false
---

# Preferencije profila (Sephora-style) — baza, backend, frontend

## Kontekst u repou

- Korisnik je u tabeli [`users`](backend/src/main/resources/db/changelog/changes/03-auth.yaml) (`id`, `email`, `full_name`, …).
- Katalog već ima **stablo kategorija** koje se koriste kao facet filteri preko `categoryFacet` u [`PublicProductController`](backend/src/main/java/com/beautyhealth/catalog/api/PublicProductController.java) (npr. „tip kože“ kao roditelj, list kao deca — vidi migraciju [`14-tip-koze-under-lice.yaml`](backend/src/main/resources/db/changelog/changes/14-tip-koze-under-lice.yaml)).
- UI trenutno ima **statičan** progress u [`AccountMenuPopover.tsx`](storefront/src/components/AccountMenuPopover.tsx) (`w-[36%]`) i placeholder „Vaše beauty preference“ u [`ShopListingFilters.tsx`](storefront/src/components/ShopListingFilters.tsx).

**Ključna arhitektonska odluka:** preference profila nisu isto što i navigacija kataloga (Sephora ima npr. starosnu grupu, shopping preference, brendove — sve to ne mora biti isto kao facet čvor u stablu). Zato uvodimo **poseban takson** u bazi, sa **opcionim** FK ka `category.id` tamo gde opcija odgovara postojećem facet listu (npr. „Masna koža“) — tako se preporuke i „primeni moj tip kože na filter“ mogu povezati bez mešanja domena.

---

## 1) Dizajn baze (PostgreSQL / Liquibase)

Predložene tabele (snake_case, kao u ostatku projekta):

| Tabela | Svrha |

|--------|--------|

| `preference_scope` | „Nivo“ kao Sephora URL segment: npr. `skin_care` (Negu kože / Lice), kasnije `makeup`, `hair`. Polja: `id`, `code` (UK), `slug`, `title`, `sort_order`, `is_active`. |

| `preference_category` | Akordeon sekcija unutar scope-a (Tip kože, Brige, Uzrast, …): FK `scope_id`, `code`, `title`, `selection_type` (`SINGLE` \| `MULTI`), `sort_order`, `counts_toward_progress` (bool), `is_active`. |

| `preference_option` | Izbori unutar kategorije: FK `category_id`, `code`, `label`, `sort_order`, opciono `icon_url`, **opciono** `catalog_category_id` → `category(id)` (nullable) kada opcija = isti koncept kao facet u katalogu. |

| `user_preference_selection` | `(user_id, preference_option_id)` sa PK ili UNIQUE par; za `SINGLE` kategorije validacija u servisu (zameniti prethodne opcije iste kategorije). Kolona `updated_at` (opciono) za sortiranje. |

**Napredak (npr. 3/6):** za jedan `scope`, broj kategorija gde je `counts_toward_progress = true` i gde korisnik ima **bar jedan** izabrani `preference_option` iz te kategorije, podeljeno sa ukupnim brojem takvih kategija. Isto pravilo kao Sephora „completed section“.

**Indeksi:** `(user_id)`, `(preference_option_id FK)`, `(user_id) + join na category` za brz pregled.

**Seed:** poseban Liquibase SQL/YAML (kao [`catalog-seed.sql`](backend/src/main/resources/db/changelog/sql/catalog-seed.sql)) koji puni scope „Negu kože“, kategorije i opcije (Tip kože: kombinovana, suva, …). Gde postoji odgovarajući čvor u `category`, popuniti `catalog_category_id` iz seed-a (jednokratan lookup po `slug`).

```mermaid
erDiagram
  users ||--o{ user_preference_selection : picks
  preference_option ||--o{ user_preference_selection : chosen
  preference_scope ||--o{ preference_category : groups
  preference_category ||--o{ preference_option : offers
  category |o--o{ preference_option : optionalFacetLink

  preference_scope {
    bigint id PK
    varchar code UK
    varchar title
  }
  preference_category {
    bigint id PK
    bigint scope_id FK
    varchar selection_type
    boolean counts_toward_progress
  }
  preference_option {
    bigint id PK
    bigint category_id FK
    bigint catalog_category_id FK_null
  }
  user_preference_selection {
    bigint user_id FK
    bigint preference_option_id FK
  }
```

---

## 2) Backend (Spring Boot, vertical slice)

**Paket:** npr. `com.beautyhealth.preferences` (ili `profilepreferences`) — po uzoru na [`com.beautyhealth.catalog.api`](backend/src/main/java/com/beautyhealth/catalog/api/) i [`com.beautyhealth.auth`](backend/src/main/java/com/beautyhealth/auth/).

**Servis:**

- Učitavanje taksona po `scope` (`code` ili `slug`).
- Čitanje izbora ulogovanog korisnika; spajanje u DTO: kategorija + označene opcije.
- **Upsert:** `PUT`/`PATCH` po scope-u ili po kategoriji — body sa listom `optionId` po `categoryId`; za `SINGLE` zadržati najviše jednu opciju po kategoriji.
- **Progress:** izračunati u servisu i vratiti u odgovoru (`completedCount`, `totalCount`, opciono `percent`).

**REST (predlog putanja, usklađeno sa postojećim `/api/v1/auth/...`):**

| Metoda | Putanja | Pristup |

|--------|---------|---------|

| GET | `/api/v1/preferences/scopes/{scopeCode}` | **Javno** — samo definicija kategorija/opcija (bez korisničkih izbora). |

| GET | `/api/v1/auth/me/preferences?scope={scopeCode}` | **JWT** — izbori + napredak za scope. |

| PUT | `/api/v1/auth/me/preferences/{scopeCode}` | **JWT** — zamena izbora za ceo scope (ili varianta PATCH po kategoriji). |

**Bezbednost:** proširiti [`SecurityConfiguration`](backend/src/main/java/com/beautyhealth/config/SecurityConfiguration.java) da `GET /api/v1/preferences/**` bude `permitAll`, a `/api/v1/auth/me/preferences/**` zahteva autentikaciju (drugi put koristi isti prefiks kao postojeći `/me`).

**DTO:** stabilni `id` (Long) za opcije u JSON-u; bez eksponiranja internih joined tabela.

**Testovi:** bar jedan `@WebMvcTest` kontrolera (kao u [`PublicProductControllerWebMvcTest`](backend/src/test/java/com/beautyhealth/catalog/api/PublicProductControllerWebMvcTest.java)) + repository/service test za pravilo `SINGLE` i napredak.

---

## 3) Frontend (React / RTK Query)

**Stranica „Beauty preference“** (Sephora-paritet): breadcrumbs, naslov scope-a, **progress** `x/y`, lista **akordeona** po `preference_category`, unutra opcije kao kartice ili checkbox liste u zavisnosti od `selection_type`; dugme „Sačuvaj i nastavi“ koje čuva i otvara sledeći akordeon (lokalni state + poziv API-ja).

- **Rute:** npr. `/account/preferencije/:scopeCode` ili `/account/beauty-preferences/:scopeCode`; link iz [AccountMenuPopover](storefront/src/components/AccountMenuPopover.tsx) bloka „Preferencije i profil“.
- **API sloj:** proširenje [authEndpoints](storefront/src/features/api/authEndpoints.ts) ili novi `preferencesEndpoints.ts` sa `useGetPreferenceScopeQuery`, `useGetMePreferencesQuery`, `usePutMePreferencesMutation` (Bearer iz [authSession](storefront/src/lib/authSession.ts) / Redux token).
- **AccountMenuPopover:** zameniti fiksni `w-[36%] `**stvarnim** `percent` iz `GET .../auth/me/preferences` (ili kompaktnim `GET` samo za summary napretka ako želite manji payload — može biti isti endpoint sa `?summary=1`).

**Opciono (faza 2):** u [`ShopListingFilters.tsx`](storefront/src/components/ShopListingFilters.tsx) „Vaše beauty preference“ — kada korisnik ima sačuvan tip kože i `catalog_category_id`, predložiti checkbox „Primeni moje preference“ i mapirati na `categoryFacet` u URL-u listinga.

---

## Redosled isporuke

1. Liquibase šema + seed za jedan scope (npr. negu kože) + opcioni link ka `category` za tip kože.
2. Backend slice: entiteti, repozitorijumi, servis, kontroleri, bezbednost, testovi.
3. Storefront: stranica sa akordeonima, API, povezivanje progress bara u meniju naloga.

Ovime dobijate proširiv sistem (nove kategorije/opcije iz baze bez deploy-a fronta, osim ikona/UX copy-ja), jasno pravilo napretka kao na Sephori, i kasnije preporuke / filtere usklađene sa katalogom gde ima smisla.