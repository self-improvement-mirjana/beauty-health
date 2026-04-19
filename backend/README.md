# beauty-health-api (B01 + B02 + B03 + B04 + B05 + B06 + B07 + B08 + B09 + B10 + B11 + B12)

Jedan Spring Boot monolit sa PostgreSQL-om i **vertical slice** strukturom paketa: kod koji pripada jednoj poslovnoj oblasti (npr. katalog, korpa) živi zajedno (API + domen + perzistencija kada stigne), umesto jednog globalnog “sve u service sloju” paketa.

## REST ugovor, greške, OpenAPI, CORS (B02)

- **Prefiks ruta**: `/api/v1/...`; kontroleri koriste `produces = APPLICATION_JSON_VALUE` gde ima smisla.
- **Greške**: jedinstveno telo `ApiError` — polja `code` (stabilan string), `message`, `details` (niz stringova, npr. polja validacije). Handler: `com.beautyhealth.common.error.GlobalExceptionHandler`.
  - Validacija (Bean Validation): **422** `VALIDATION_FAILED`.
  - Loš zahtev / tip parametra / neispravan JSON: **400** `BAD_REQUEST`.
  - Nije pronađeno (uklj. `NoResourceFoundException` / `NoHandlerFoundException` kada je uključeno bacanje): **404** `NOT_FOUND`.
  - Poslovni konflikt: **409** `CONFLICT` — baciti `ConflictException` iz slice-a.
  - Neočekivano: **500** `INTERNAL_ERROR`.
- **OpenAPI / Swagger UI**: zavisnost `springdoc-openapi-starter-webmvc-ui`. U `application.yml` je OpenAPI isključen; u profilu **`local`** uključen (vidi `application-local.yml`). UI putanja: `/swagger-ui` (OpenAPI JSON: `/v3/api-docs`).
- **CORS**: lista `app.cors.allowed-origins` (YAML); podrazumevano lokalni Vite portovi **5173** (storefront) i **5174** (moderator). U produkciji (`application-prod.yml`) lista je prazna — popuniti realnim domenima u deploy konfiguraciji.
- **Novac u API-ju**: obavezno čitaj [`docs/API_MONEY.md`](docs/API_MONEY.md) (string `amount` + `currency: "RSD"`). Primer u kodu: `GET /api/v1/catalog/money-format-example`.

## Autentikacija (B03) — JWT

- **Strategija**: stateless **JWT** (HS256), klijent šalje `Authorization: Bearer <accessToken>`. Nema server-side sesije u v1.
- **Konfiguracija**: `app.jwt.secret` (najmanje **32** UTF-8 bajta), `app.jwt.expiration-minutes`. U **prod** obavezno postaviti `APP_JWT_SECRET` (vidi `application-prod.yml`); prazan secret sprečava start.
- **Rute** (`com.beautyhealth.auth.api`):
  - `POST /api/v1/auth/register` — kreira korisnika sa ulogom **CUSTOMER**; lozinka se čuva kao **BCrypt** hash.
  - `POST /api/v1/auth/login` — vraća `accessToken`, `tokenType`, `expiresInSeconds`, `user` (bez hash-a).
  - `POST /api/v1/auth/logout` — za JWT bez sesije: odgovor **204**; klijent odbaci token lokalno.
  - `GET /api/v1/auth/me` — trenutni korisnik (zahteva Bearer token).
- **Javno bez tokena**: `POST /register`, `POST /login`, `GET /api/v1/catalog/**`, `GET /api/v1/products/**`, `POST /api/v1/products/*/reviews` (recenzije B08), `GET /api/v1/pages/**`, `GET /api/v1/locations/**`, `GET /api/v1/blog/**` (sadržaj B09), `GET|POST|PATCH|DELETE /api/v1/cart/**` (korpa i ping; `POST /cart/merge` vraća **401** bez JWT), Swagger (uz profil `local`), CORS preflight.
- **Moderacija**: `GET|POST|PUT|PATCH|DELETE /api/v1/admin/**` zahteva **ROLE_MODERATOR** (Spring `hasRole("MODERATOR")`). Primer: `GET /api/v1/admin/ping`; B10 dodaje CRUD rute pod istim prefiksom (vidi sekciju B10).
- **Greške**: neautorizovan pristup → **401** `UNAUTHORIZED`; zabranjena uloga → **403** `FORBIDDEN` (isti `ApiError` format kao u B02).
- **OpenAPI**: šema `bearer-jwt` u komponentama; operacije `me` / `logout` / admin nose `@SecurityRequirement`.
- **Seed moderator (samo lokalno)**: u `application-local.yml` je `spring.liquibase.contexts: local` da se izvrši changeset sa `context: local` u `03-auth.yaml`. Nalog **`moderator@local.test`** / lozinka **`ModeratorLocal1!`** (samo razvoj; ne koristiti u produkciji). U test/prod profilima taj changeset se **ne** izvršava.

## Katalog (B04) — čitanje proizvoda, kategorija, brendova

- **Liquibase**: `db/changelog/changes/04-catalog-schema.yaml` (šema) + `04-catalog-seed.yaml` (učitava `db/changelog/sql/catalog-seed.sql`). Posle seed-a se resetuju ID sekvence (`ALTER TABLE ... RESTART WITH ...`) radi lokalnog dodavanja redova.
- **Seed**: 55 aktivnih proizvoda, varijante (1–3 po proizvodu), opcije „Veličina“ za prvih 10, zalihe po 3 magacina; ponovo generisanje: `python3 scripts/generate_catalog_seed.py`.
- **Javni REST** (read-only, bez JWT):
  - `GET /api/v1/categories/tree` — stablo kategorija.
  - `GET /api/v1/brands` — lista brendova; `GET /api/v1/brands/{slug}/products` — proizvodi brenda (paginacija).
  - `GET /api/v1/products` — listing kartica; query: `categorySlug`, `brandSlug`, `featured` (boolean), `q` (deo naziva); paginacija Spring `page` / `size` (podrazumevano 20).
  - `GET /api/v1/products/search?q=...` — **B05** pretraga po nazivu (`ILIKE`/`LIKE` kroz isti JDBC kao listing); **isti JSON** kao `GET /api/v1/products` (`Page<ProductCardResponse>`). Opciono: `categorySlug`, `brandSlug`. Sort: `sort=id,asc` ili `sort=name,asc` (samo ta polja). **Prazan ili izostavljen `q` → 400** sa `ApiError` (B02).
  - `GET /api/v1/products/{slug}` — PDP (brend, kategorije, opcije, varijante, cene `MoneyResponse`, zaliha po varijanti, izabrane vrednosti opcija). JSON uključuje i **`id`**, **`brandId`**, **`active`**, **`categories[].id`** radi moderator UI-ja (M02) i alatki; admin čitanje neaktivnog proizvoda: `GET /api/v1/admin/products/detail?slug=…`.
- **Listing bez N+1**: agregacija u jednom JDBC upitu (`CatalogListingJdbcRepository` + `NamedParameterJdbcTemplate`), ne JPA `Page<Product>`.
- **DTO**: `ProductCardResponse` — `title`, `slug`, `brandName`, `brandSlug`, `moneyRegular`, `moneySale`, `ctaType` (`ADD_TO_CART` | `CHOOSE_OPTIONS` | `OUT_OF_STOCK`), `inStock`, `chooseOptionsRequired`, `primaryVariantId`.
- **Stari ping**: `GET /api/v1/catalog/ping` i primer novca ostaju pod `/api/v1/catalog/`.

## Korpa (B06)

- **Liquibase**: `db/changelog/changes/06-cart.yaml` — tabele `cart` (jedna po `users.id` gde je `user_id` setovan; gost korpa po jedinstvenom `guest_cart_token` UUID), `cart_item` (unique `(cart_id, product_variant_id)`), snapshot cene `unit_price_snapshot` (efektivna cena u trenutku dodavanja/ažuriranja).
- **Gost**: prvi `GET /api/v1/cart` ili `POST /api/v1/cart/items` bez `X-Guest-Cart-Token` kreira korpu; server vraća token u headeru **`X-Guest-Cart-Token`** — front čuva (npr. `sessionStorage`) i šalje na svakom sledećem zahtevu. Nevažeći token → **404** `NOT_FOUND`.
- **CORS**: `BeautyHealthCorsBeans` izlaže **`X-Guest-Cart-Token`** u `Access-Control-Expose-Headers` da bi storefront na drugom originu (npr. Vite `:5173`) mogao da pročita token iz `fetch` odgovora.
- **Ulogovan korisnik**: korpa se vezuje za `user_id` (JWT); header gosta se **ignoriše** za identifikaciju korpe (ali se koristi pri merge-u).
- **REST** (`com.beautyhealth.cart.api`):
  - `GET /api/v1/cart` — lista stavki + `lineCount`, `totalQuantity`, `empty`, `subtotal` (`MoneyResponse`).
  - `GET /api/v1/cart/summary` — isti brojevi/subtotal za badge (bez liste stavki u telu).
  - `POST /api/v1/cart/items` — telo `{ "variantId", "quantity" }`. **Idempotentno u smislu agregacije**: isti `variantId` **uvećava** postojeću količinu; cena snapshot se tada osvežava na trenutnu efektivnu.
  - `PATCH /api/v1/cart/items/{id}` — `{ "quantity" }`.
  - `DELETE /api/v1/cart/items/{id}`.
  - `POST /api/v1/cart/merge` — **JWT obavezan**, telo `{ "guestCartToken" }`. Strategija: stavke gost korpe se ponovo dodaju u korisnikovu korpu (validacija zaliha i cene kao pri običnom dodavanju), zatim se gost korpa briše. Ako korisnik već ima istu varijantu, količine se sabiraju.
- **Pravila**: proizvod mora biti aktivan; ako proizvod ima grupe opcija, varijanta mora imati kompletan izbor opcija — inače **400**. Nema zalihe ili tražena količina premašuje zalihe → **409** `CONFLICT` (`ApiError` B02).

## Narudžbine / checkout (B07)

- **Liquibase**: `db/changelog/changes/07-orders.yaml` — tabele `orders` (snapshot adrese + `delivery_summary_text`), `order_item`, `payment_transaction` (stub **COD** / `PENDING`), `shipment` (stub bez kurira).
- **Konfiguracija**: `app.orders.delivery-summary-text` u `application.yml` — tekst se **snima na narudžbinu** pri kreiranju (kasnije B09/CMS).
- **Servis**: `OrderService.createFromCart` u jednoj `@Transactional` transakciji: učitava korpu korisnika, **pesimistički zaključava** redove `inventory` po varijanti (sortirano radi deadlock-a), proverava zalihe, umanjuje količine, kreira narudžbinu + plaćanje + isporuku, prazni korpu. Greška zalihe → **409**, ceo tok se rolluje.
- **REST** (`/api/v1/orders`, **JWT obavezan**):
  - `POST /api/v1/orders` — telo `CreateOrderRequest` (minimalno: primaoc, telefon, adresa, grad, poštanski broj, `countryCode`). Odgovor **201** sa `orderId`, `status` (`NEW`), `total` (`MoneyResponse`), `deliverySummaryText`.
  - `GET /api/v1/orders/{id}` — vlasnik narudžbine ili **MODERATOR** (JSON kao `OrderDetailResponse`; za `customerUserId` / `customerEmail` vidi B11 `GET /api/v1/admin/orders/{id}`).
- **Statusi narudžbine (B07 + B11)**: početni status pri checkout-u je **`NEW`**. Moderacija koristi workflow **`NEW` → `CONFIRMED` → `SHIPPED` → `COMPLETED`** i **`CANCELLED`** iz `NEW` ili `CONFIRMED`. Liquibase `11-order-status-migration.yaml` mapira starije vrednosti `PAID` → `CONFIRMED`, `FULFILLED` → `COMPLETED` ako postoje u bazi.
- **TBD (spec. 7.3)**: proširenje checkout forme (npr. napomena, alternativna adresa, firma/PIB) — trenutno samo polja iznad; proširenje = migracija + DTO bez lomljenja postojećih JSON ključeva gde je moguće.
- **Testovi**: `OrderApiIntegrationTest` (H2). `OrderCheckoutPostgresIT` — **Testcontainers** PostgreSQL (`disabledWithoutDocker = true`); ako Docker nije dostupan, test se **preskače**.

## Recenzije proizvoda (B08)

- **Liquibase**: `db/changelog/changes/08-reviews.yaml` — tabela `review` (`product_id`, opciono `user_id`, `rating` 1–5, `body` do 4000 znakova, `author_name`, `author_email`, `is_public_email`, `is_approved`).
- **Javni API** (`com.beautyhealth.review.api`): `GET /api/v1/products/{slug}/reviews` — stranica (`Page`) samo **odobrenih** recenzija, sort **najnovije prve**; JSON polja: `id`, `authorName`, `rating`, `body`, `createdAt` — **bez** `authorEmail` (ni kada je `is_public_email=true` u v1). `POST /api/v1/products/{slug}/reviews` — nova recenzija se čuva kao **neodobrena** (`is_approved=false`) dok moderator ne odobri preko admin API-ja; validacija (**422** za ocenu van 1–5 ili predugačak tekst); gost ili JWT (ako je JWT, vezuje se `user_id`). **Rate limit** na `POST` recenzije: vidi **B12**.
- **Moderacija**: polje `is_approved` za kasnije M06/B10; GET prikazuje samo `is_approved=true`.

## Sadržaj: informativne stranice, maloprodaja, blog (B09)

- **Liquibase**: `09-content-schema.yaml` (tabele `cms_page`, `retail_location`, `blog_post`) + `09-content-seed.yaml` (učitava `db/changelog/sql/content-seed.sql`, zatim restart ID kolona za H2).
- **Dva pojma „lokacije“**:
  - **`retail_location`** (B09): fizičke maloprodaje za korisnike (adresa, telefon, radno vreme) — `GET /api/v1/locations`.
  - **`store_location`** (B04): interni magacini za zalihe (`inventory`) — nisu isti entitet.
- **Javni REST** (`com.beautyhealth.content`), read-only, telo stranica/članaka je **markdown** (front render bez HTML sanitizer-a u v1):
  - `GET /api/v1/pages/{slug}` — samo `published=true`; nepoznat slug → **404** `ApiError` (B02).
  - `GET /api/v1/locations` — aktivne maloprodaje, sort `sort_order`, zatim `id`.
  - `GET /api/v1/blog` — objavljeni članci (`published=true` i `published_at` postoji), sort **najnoviji prvi**, Spring paginacija (`page` / `size`, podrazumevano 20).
  - `GET /api/v1/blog/{slug}` — detalj sa `bodyMarkdown`.
- **Seed slug-ovi za footer (mapiranje)**: `cesto-postavljana-pitanja`, `kako-poruciti`, `nacini-placanja`, `uslovi-kupovine`, `isporuka`, `odustanak-od-ugovora`, `pravilnik-o-reklamaciji`, `ostecenje-robe`, `politika-privatnosti-i-kolacici`, `kontakt` (u telu stranice `kontakt` je stub email za online podršku).

## Moderacija: katalog i sadržaj (B10)

- **Bez nove šeme**: koriste se iste tabele kao u B04 (katalog) i B09 (sadržaj); moderacija dodaje **write** REST ispod **`/api/v1/admin/...`** (već zaštićeno u B03: **`ROLE_MODERATOR`** + JWT).
- **OpenAPI**: operacije nose tag **`moderation`** (vidi i `OpenApiConfiguration` za opis taga).
- **Katalog (write)** — `com.beautyhealth.moderation.api` + `ModerationCatalogWriteService`:
  - `GET/POST/PUT/DELETE /api/v1/admin/brands` — CRUD brenda; brisanje odbijeno ako postoji proizvod brenda (**409**).
  - `GET/POST/PUT/DELETE /api/v1/admin/categories` — CRUD kategorije (uklj. `parentCategoryId`, `sortOrder`, `active`); brisanje odbijeno ako kategorija ima **podkategorije** ili je vezana za proizvod (**409**); dodela roditelja koja bi napravila **ciklus** u stablu → **400** `BAD_REQUEST`.
  - `POST /api/v1/admin/products` — kreiranje proizvoda sa **jednom ili više varijanti** (SKU, cene ≥ 0, zalihe ≥ 0 po `store_location_id`), tačno **jedna** varijanta `defaultVariant: true`, kategorije opcione.
  - `PUT /api/v1/admin/products/{id}` — izmena marketing polja, brenda i liste `categoryIds` (varijante se ovim putem ne menjaju).
  - `PATCH /api/v1/admin/products/{productId}/variants/{variantId}/prices` — izmena `regularPrice` / `salePrice` (vidljivo na javnom PDP u sledećem GET, bez posebnog keša).
  - `PATCH /api/v1/admin/products/{productId}/variants/{variantId}/inventory` — telo `{ "lines": [ { "storeLocationId", "quantity" } ] }` zamenjuje zalihe po magacinima.
  - `GET /api/v1/admin/products/detail?slug=` — isti oblik kao javni PDP, uključuje i **neaktivne** proizvode (M02).
  - `GET /api/v1/admin/products/{productId}/variants/{variantId}/inventory` — trenutne zalihe po magacinima (M02).
  - `GET /api/v1/admin/store-locations` — lista magacina (`store_location`) za forme zaliha (M02).
- **Sadržaj (write)** — `ModerationContentWriteService`:
  - `GET/POST/PUT/DELETE /api/v1/admin/cms-pages` — CRUD `cms_page` (markdown, `published`); `GET /api/v1/admin/cms-pages/{id}` — detalj sa `bodyMarkdown` (moderator M05).
  - `GET/POST/PUT/DELETE /api/v1/admin/retail-locations` — CRUD `retail_location`.
  - `GET/POST/PUT/DELETE /api/v1/admin/blog-posts` — CRUD `blog_post` (pri `published=true` bez `publishedAt` u zahtevu, server postavlja `published_at`); `GET /api/v1/admin/blog-posts/{id}` — detalj sa `excerpt` i `bodyMarkdown` (moderator M05).
- **Validacija**: Bean Validation na admin DTO (`@Valid`); konflikt jedinstvenog slug-a/SKU-a i DB greške → **409** (`ConflictException` ili `DataIntegrityViolationException` → `ApiError`).
- **Nije u opsegu v1**: audit log / Envers za „ko je menjao cenu“; **admin CRUD za `product_option` / `product_option_value` i mapiranje varijanta na opcije** — predviđeno kao sledeće proširenje (javni katalog već čita opcije iz B04 seed-a).

## Moderacija: narudžbine i korisnici (B11)

- **Narudžbine** (`com.beautyhealth.moderation.api.AdminOrderController` + `ModerationOrderService`):
  - `GET /api/v1/admin/orders` — paginacija (`page`, `size`, `sort`); opcioni filteri `status` (enum ime), `from` / `to` (**ISO-8601** `Instant`, filtrira `created_at`, `to` je **isključiv** gornja granica).
  - `GET /api/v1/admin/orders/{id}` — telo `AdminOrderDetailResponse`: `customerUserId`, `customerEmail`, ugnježdeni `order` istog oblika kao `OrderDetailResponse` (stavke, adresa, plaćanje) — **bez** password hash-a.
  - `PATCH /api/v1/admin/orders/{id}/status` — telo `{ "status": "CONFIRMED" }`; nevalidan prelaz → **409** `CONFLICT` + jasna poruka; nepoznat status string → **400**.
- **Korisnici (support)** (`AdminUserController` + `ModerationUserSupportService`):
  - `GET /api/v1/admin/users?email=` — lookup po emailu (case-insensitive); prazan `email` → **400**.
  - `GET /api/v1/admin/users/{id}` — po ID.
  - Odgovor `AdminUserResponse`: `id`, `email`, `fullName`, `roles`, `createdAt`, `orderCount` — bez `passwordHash` i bez tokena.
- **Recenzije (moderacija)** (`AdminReviewController` + `ModerationReviewService`):
  - `GET /api/v1/admin/reviews` — paginacija (`page`, `size`, `sort`); opcioni filteri `slug` (proizvod), `approved` (`true` / `false`); telo stavke uključuje `authorEmail` (PII, samo za moderatore).
  - `PATCH /api/v1/admin/reviews/{id}/approval` — telo `{ "approved": true|false }`; posle odobrenja recenzija ulazi u javni `GET /api/v1/products/{slug}/reviews` (nema posebnog PDP keša u v1 — odmah vidljivo u sledećem GET).
- **State machine**: `OrderStatusTransitions` u `com.beautyhealth.order.domain` (unit testovi u `OrderStatusTransitionsTest`).
- **Audit log PII**: nije implementiran (tiket: „ako audit postoji“).

## NFR: bezbednost, rate limit, logovanje (B12)

- **CSRF i oba fronta (storefront + moderator)**: autentikacija je **stateless JWT** (B03) — nema server-side sesije ni CSRF cookie strategije na API-ju. Klijenti šalju `Authorization: Bearer …` za zaštićene rute. Ako se u budućnosti uvede **session cookie** auth za bilo koji front, tada treba uključiti Spring Security CSRF za state-changing metode ili dokumentovati alternativni token pristup (kao u planu B03).
- **Rate limiting** (Bucket4j + Caffeine, po **IP** adresi): `com.beautyhealth.config.RateLimitingFilter` na **POST** za `POST /api/v1/auth/login` (podrazumevano **10/min**) i `POST /api/v1/products/{slug}/reviews` (podrazumevano **5/h**). Konfiguracija: `app.rate-limit.enabled`, `login-per-minute`, `review-posts-per-hour` u `application.yml`. Kada je limit prekoračen: **429** `ApiError` sa kodom `RATE_LIMITED` i zaglavlje **`Retry-After`** (sekunde). U test profilu je limiter **isključen** (`application-test.yml`) da integracioni testovi ne padaju na throttling-u; demonstacija **429**: `RateLimitingIntegrationTest`.
- **HTTP zaglavlja (Spring Security)**: uključeni su `X-Content-Type-Options: nosniff` i `Referrer-Policy: strict-origin-when-cross-origin`. **HSTS** (`Strict-Transport-Security`) uključuje se samo kada je aktivan Spring profil **`prod`** (pretpostavka HTTPS-a ispred aplikacije). CSP za API nije podešavano — statički front tipično na CDN-u/hostingu.
- **Logovanje**: u **`prod`** profilu je `logging.structured.format.console: ecs` (strukturisani konzolni log). Poslovni konflikti (`ConflictException`) se loguju na **WARN** u `GlobalExceptionHandler`. **Ne logovati** sirova tela zahteva koja sadrže lozinke ili druge tajne; login endpoint ne treba snimati u access logu puno telo zahteva ako ga konfigurišete spolja.
- **Swagger u produkciji**: `springdoc.api-docs.enabled` i `swagger-ui.enabled` su **false** u `application-prod.yml` (kao i u podrazumevanom `application.yml`; UI se uključuje uz profil **`local`**).

## Šta je vertical slice u ovom repozitorijumu?

- Prefiks HTTP ruta: `/api/v1/<oblast>/...` (npr. `/api/v1/catalog/...`).
- Paket po oblasti: `com.beautyhealth.<oblast>...` — npr. `com.beautyhealth.catalog.api` za REST kontrolere kataloga.
- Zajednički prečaci: `com.beautyhealth.config`, `com.beautyhealth.common.*` (greške, novac/RSD konvencija), bez “God” servisa koji pokriva ceo domen.

Gde dodati novu funkcionalnost: izaberi slice (ili predloži novi pod `com.beautyhealth.<ime>`), dodaj kontroler/servis/entitet u tom paketu i novi Liquibase changeset u `src/main/resources/db/changelog/changes/`.

## Pokretanje

Preduslov: PostgreSQL lokalno, prazna baza i korisnik (primer):

```sql
create database beauty_health;
create user beauty_health with password 'beauty_health';
grant all privileges on database beauty_health to beauty_health;
```

Zatim iz `backend/`:

```bash
./gradlew bootRun
```

`bootRun` podrazumevano aktivira profil `local` (vidi `build.gradle`). Konekcija je u `application-local.yml`.

Health provere slice-ova (JSON):

- `GET http://localhost:8080/api/v1/catalog/ping`
- `GET http://localhost:8080/api/v1/cart/ping`

Swagger (samo uz profil `local`): `http://localhost:8080/swagger-ui/index.html` (ili redirekcija sa `/swagger-ui`).

## Migracije

Liquibase master: `src/main/resources/db/changelog/db.changelog-master.yaml`. Nova šema = novi fajl u `changes/` + `include` u masteru. Čista baza: samo pokreni aplikaciju — kreira se `databasechangelog`.

## Testovi

```bash
./gradlew test
```

Test profil koristi ugrađeni H2 (bez lokalnog PostgreSQL-a). Opcioni `OrderCheckoutPostgresIT` koristi Testcontainers + `postgresql` na classpathu.

## Gradle

Projekat koristi **Groovy** `build.gradle` / `settings.gradle` (Java 25 + Gradle **Kotlin DSL** trenutno padaju pri parsiranju verzije JDK u ugrađenom Kotlin kompajleru). Tiket B01 i dalje preporučuje Kotlin DSL — možete preći na `.kts` kada vaš Gradle/Kotlin podrži JDK koji koristite, ili držati Groovy varijantu.

Bytecode je podešen na **Java 17** (`release = 17`); Gradle može raditi na novijem JDK (npr. 21 ili 25) ako je instaliran. Spring Boot 3.5.x.
