# 22 — Lokalizacija, SEO URL-ovi i mobilne performanse (listing + PDP)

**Tip:** Story  
**Prioritet:** Must  
**Spec:** dokument 10) Nefunkcionalni zahtevi

## Cilj

- Definisati **politiku lokalizacije** (SR-only vs. mešano sa EN stringovima kao „You can save“) i uskladiti ključne stringove.  
- Obezbediti **čitljive URL-ove** za proizvode, kategorije i brendove (provera konzistentnosti).  
- Osigurati da **listing i PDP** rade stabilno na mobilnom (nema layout pucanja, razumna količina slika lazy-load).

## Opseg

- Kratak `docs/i18n-policy.md` ili komentar u `README` projekta (jedan izvor).
- Prolazak kroz glavne rute: meta title/description gde ima smisla.
- Lighthouse ili ručna provera na malom ekranu; ispraviti očigledne probleme (slike bez dimenzija, blokirajući fontovi — po mentoru).

## Kriterijumi prihvatanja

- [ ] Dokumentovana politika jezika i primer kako dodati novi string.
- [ ] URL-ovi za PDP, kategoriju i brend su čitljivi i ne menjaju se nasumično.
- [ ] Na mobilnom uređaju ili emulatoru: shop listing i PDP su upotrebljivi bez horizontalnog scroll-a osim gde je namerno (tabele).

## Za juniore

- Ne prevodite ceo sajt u ovom tiketu — fokus na **pravilo** i **konzistentnost** na kritičnim ekranima.

## Zavisnosti

- 06, 07, 09 (SEO rute), 05 (listing)
