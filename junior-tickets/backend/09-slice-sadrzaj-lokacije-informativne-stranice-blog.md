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
