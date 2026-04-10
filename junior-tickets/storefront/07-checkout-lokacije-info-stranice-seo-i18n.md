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
- [ ] 404 stranica za nepoznat slug sadržaja.
- [ ] Dokumentovana politika SR/EN stringova (specifikacija 10).

## Zavisnosti

- F05, F06, B07, B09

## Za juniore

- Ne blokirati MVP na savršenom checkout-u — eksplicitno labelirati “phase 2” polja dok proizvod ne dostavi TBD.

## Plan za AI agenta

1. **Checkout stranica**: korak “Pregled korpe” → “Podaci” → “Potvrda” ako je potrebno; MVP: jedna forma koja šalje DTO iz B07; disabled submit dok nisu obavezna polja popunjena.
2. **Rokovi isporuke**: prikazati tekst iz konfiguracije (`GET /pages/shipping` ili statički ključ) — uskladiti sa B09.
3. **Lokacije**: `LocationsPage` grid kartica iz `GET /api/v1/locations` (retail lokacije, ne inventar).
4. **CMS stranice**: `ContentPage` dinamički učitava `GET /api/v1/pages/{slug}`; 404 komponenta za nepoznat slug.
5. **Helmet**: dinamički `title` iz CMS `title` polja.
6. **i18n**: ako nije u opsegu, kreirati `docs/I18N.md` sa odlukom “SR only za sada”; inače pripremiti `react-i18next` stub.
7. **Happy path E2E (opciono)**: Playwright login → dodaj u korpu → checkout (ako stabilno u CI).
