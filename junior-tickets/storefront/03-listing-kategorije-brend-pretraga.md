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
