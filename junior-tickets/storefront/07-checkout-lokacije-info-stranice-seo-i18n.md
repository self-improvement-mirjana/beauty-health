# F07 — Checkout (minimum), lokacije, informativne stranice, SEO/i18n

**Tip:** Story  
**Prioritet:** Should  
**Spec:** odjeljci 7, 8, 9, 10

## Cilj

Završiti **kupčki** tok do nivoa definisanog specifikacijom: checkout ulaz iz korpe, prikaz rokova isporuke; stranica **lokacija**; **footer** info stranice iz B09; osnovni SEO i odluka o jeziku.

## Opseg

- Checkout: forma sa poljima koje backend trenutno prihvata (TBD 7.3); prikaz teksta o rokovima (7.2).
- Lokacije: lista iz API-ja.
- Dinamičke stranice po `slug` za sadržaj iz B09.
- `react-helmet-async` ili slično za title/description; čitljivi URL-ovi.

## Kriterijumi prihvatanja

- [ ] Uspešno kreiranje narudžbine (happy path) kada je B07 spreman.
- [ ]404 stranica za nepoznat slug sadržaja.
- [ ] Dokumentovana politika SR/EN stringova (specifikacija 10).

## Zavisnosti

- F05, F06, B07, B09

## Za juniore

- Ne blokirati MVP na savršenom checkout-u — eksplicitno labelirati “phase 2” polja dok proizvod ne dostavi TBD.
