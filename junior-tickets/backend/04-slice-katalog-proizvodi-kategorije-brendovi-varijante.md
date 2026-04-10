# B04 — Slice `catalog`: proizvodi, kategorije, brendovi, varijante, zalihe

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljci 3, 5.1–5.2, 6.4

## Cilj

Model i **javni REST** za katalog: listing podataka potreban storefront-u (cene, akcije, zalihe, CTA pravila), hijerarhija kategorija, brendovi, varijante proizvoda.

## Opseg

- Entiteti (minimalno): `Brand`, `Category` (parent/child), `Product`, `ProductVariant` (ili ekvivalent za “opcije”), cene (regularna + akcijska ako postoji), `stock` po varijanti ili proizvodu — po dogovoru ali konzistentno sa UI pravilima (“Nema na zalihama”, “Odaberite opcije”).
- Read API:
  - lista proizvoda sa filterima (kategorija, brend, featured),
  - detalj proizvoda za PDP,
  - stabla kategorija za navigaciju.
- Mapiranje na DTO da se ne cure interni ID-evi ako nisu potrebni; slug-ovi za SEO URL (specifikacija 10 SEO).

## Kriterijumi prihvatanja

- [ ] Front može da sastavi listing karticu sa poljima iz specifikacije 3.1 (naziv, cene, akcija/CTA tip).
- [ ] PDP može da prikaže brend link, varijante, status zaliha prema podacima API-ja.
- [ ] Indeks/baza podržava realističan broj proizvoda za dev seed (npr. 50+) bez N+1 problema na listingu (projekcija ili join fetch plan).
- [ ] Liquibase changeset-i za celu šemu kataloga.

## Zavisnosti

- B01, B02

## Za juniore

- “Vertical slice” završava ovde za **čitanje** kataloga; pisanje kataloga ide kroz moderaciju (B10).
- Dogovorite da li je “proizvod bez varijanti” jedna implicitna varijanta — pojednostavljuje korpu.

## Plan za AI agenta

1. **Mapiranje na ER**: implementirati tabele i veze iz [`DATA_MODEL.md`](../DATA_MODEL.md): `brand`, `category` (kolone kao u dijagramu za CATEGORY), `product`, `product_category` (PK kompozit ili surrogate), `product_option`, `product_option_value`, `product_variant`, `product_variant_option` (veza varijante na izabrane vrednosti opcija), `inventory` (variant_id, store_location_id, quantity), `store_location` (magacin — ne mešati sa CMS lokacijama prodavnica ako su odvojene u B09).
2. **Liquibase**: jedan ili više changeset fajlova numerisanih posle auth (npr. `030-catalog-core.yaml`); indeksi na `slug`, `product(name)`, FK-ovi; seed podaci za 50+ proizvoda sa varijantama.
3. **JPA entiteti** u paketu `...catalog.domain` + `...catalog.api` za kontrolere; izbegavati N+1: `@EntityGraph` ili DTO projekcije za listing.
4. **Javni REST** (read-only): npr. `GET /api/v1/categories/tree`, `GET /api/v1/products` (filteri: `categorySlug`, `brandSlug`, paginacija), `GET /api/v1/products/{slug}`, `GET /api/v1/brands`, `GET /api/v1/brands/{slug}/products`.
5. **DTO za front**: listing kartica — `title`, `slug`, `brandName`, `brandSlug`, `moneyRegular`, `moneySale` (nullable), `ctaType` enum (`ADD_TO_CART` | `CHOOSE_OPTIONS` | `OUT_OF_STOCK`), `primaryVariantId` ako je jednostavan proizvod.
6. **Pravila zaliha**: agregirati `inventory` po varijanti za “ukupno na skladištu” ili jedno default skladište za MVP; eksponirati `inStock: boolean` i `chooseOptionsRequired: boolean`.
7. **MapStruct ili ručno mapiranje** — konzistentno sa timom.
8. **Testovi**: `@DataJpaTest` za složene upite; `@WebMvcTest` za jedan listing endpoint; integracioni test listing performansi (opciono).
