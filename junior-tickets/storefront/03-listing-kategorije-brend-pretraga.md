# F03 — Listing proizvoda, kategorije, brendovi, rezultati pretrage

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljci 3, 4

## Cilj

Povezati storefront sa **katalog API** (B04, B05): kartice proizvoda sa CTA pravilima, stranice brenda i kategorije, rezultati pretrage.

## Opseg

- Komponenta kartice proizvoda: naziv, regularna + akcijska cena, dugmad “Dodaj u korpu” / “Odaberite opcije” / disabled “Nema na zalihama” prema podacima API-ja.
- Stranice `/shop`, `/brand/:slug`, `/category/:slug` (tačan oblik URL dogovoriti sa B04 slug poljima).
- Pretraga: input u headeru vodi na stranicu rezultata ili inline dropdown — dogovor tima, ali mora koristiti B05.

## Kriterijumi prihvatanja

- [ ] Ponašanje kartice odgovara specifikaciji 3.1 za dev seed podatke.
- [ ] Pretraga sa praznim upitom ne lomi UI (validacija).
- [ ] Loading/skeleton za listing dok se čeka mreža.

## Zavisnosti

- F01, F02, B04, B05

## Za juniore

- SEO: koristiti semantičke naslove (`h1` na stranici brenda/kategorije).

## Plan za AI agenta

1. **RTK Query endpoints**: `getProducts`, `getProductsByBrand`, `getProductsByCategory`, `searchProducts` mapirani na B04/B05 URL-e; deljeni tip `ProductListItemDto`.
2. **Komponenta `ProductCard`**: prima DTO; mapiranje `ctaType` na tri stanja dugmeta; `formatRsd` za cene.
3. **Stranice**: `ShopPage`, `BrandPage`, `CategoryPage`, `SearchPage` — svaka koristi istu mrežu kartica + paginacija (komponenta `Pagination`).
4. **URL sync**: query parametri `page`, `size` u sync sa API pozivom.
5. **Prazna pretraga**: disable submit ili toast “Unesite pojam” — bez500 na backend ako je već zaštićeno.
6. **Loading/error**: skeleton + `ErrorState` komponenta koja čita B02 JSON greške.
7. **Veza sa ER**: prikazani podaci odgovaraju agregatu iz `product` + `product_variant` + cene (vidi [`DATA_MODEL.md`](../DATA_MODEL.md)).
