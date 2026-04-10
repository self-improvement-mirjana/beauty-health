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
- [ ] Flyway migracije za celu šemu kataloga.

## Zavisnosti

- B01, B02

## Za juniore

- “Vertical slice” završava ovde za **čitanje** kataloga; pisanje kataloga ide kroz moderaciju (B10).
- Dogovorite da li je “proizvod bez varijanti” jedna implicitna varijanta — pojednostavljuje korpu.
