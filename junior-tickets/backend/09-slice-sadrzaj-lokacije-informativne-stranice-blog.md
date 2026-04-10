# B09 — Slice `content`: lokacije, informativne stranice, blog (read)

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljci 8, 9, 2 (footer linkovi)

## Cilj

REST za **sadržaj** koji nije katalog: lokacije prodavnica, statičke/info stranice (FAQ, uslovi, privatnost…), blog listing/detalj ako postoji u opsegu.

## Opseg

- Entiteti ili markdown/storage strategija — dogovor tima; minimalno `Location`, `ContentPage` (slug, naslov, HTML ili markdown).
- Javni GET po `slug` za stranice iz footera (specifikacija 9).
- `GET /locations` za listu (specifikacija 8).

## Kriterijumi prihvatanja

- [ ] Svi linkovi iz specifikacije 9 mogu da se mapiraju na `slug` koji vraća sadržaj (seed podaci za dev).
- [ ] Lokacije sadrže naziv, adresu, telefon, radno vreme.
- [ ] Moderacija može menjati sadržaj kroz B10/B11 ako je tako podeljeno — ili poseban content admin u B10.

## Zavisnosti

- B01, B02

## Za juniore

- Ne hardkodirati tekst u frontu za pravno bitne stranice ako treba menjati bez deploy-a fronta — držati u bazi.

## Plan za AI agenta

1. **Liquibase**: minimalno `cms_page` (id, slug UK, title, body_markdown ili body_html, published boolean, updated_at); `blog_post` (id, slug, title, excerpt, body, published_at) ako je blog u opsegu; `cms_page_category` kao M:N ako ER zahteva grupisanje.
2. **Lokacije prodavnica (spec 8)**: odvojena tabela `retail_location` (naziv, adresa, telefon, hours_text) — **ne mešati** sa `store_location` iz inventara (ER `STORE_LOCATION`) osim ako tim eksplicitno spoji koncepte; u README objasniti dve uloge.
3. **API (read)**: `GET /api/v1/pages/{slug}`, `GET /api/v1/locations` (retail), `GET /api/v1/blog` + `GET /api/v1/blog/{slug}` ako postoji blog.
4. **Seed**: Liquibase ili SQL sa slug-ovima iz `SPECIFIKACIJA_ZAHTEVA.md` odjeljak 9 (FAQ, kontakt, …).
5. **Sanitizacija**: ako je HTML, backend koristi sanitajzer pri čuvanju (moderacija) ili čuva markdown i front renderuje bezopasno.
6. **Testovi**: `@WebMvcTest` za nepoznat slug → 404 po B02 formatu.
