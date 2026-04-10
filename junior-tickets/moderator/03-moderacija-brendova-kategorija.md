# M03 — Moderacija brendova i hijerarhije kategorija

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 3.3, 3.2

## Cilj

Omogućiti moderatoru da održava **brendove** i **drvo kategorija** koje storefront koristi za navigaciju i URL-ove.

## Opseg

- CRUD brendova (naziv, slug, logo opciono).
- CRUD kategorija sa roditeljem; zabrana ciklusa u stablu (validacija front + backend).
- Pregled stabla (collapsible) ili tabela sa indentom.

## Kriterijumi prihvatanja

- [ ] Slug kolizije prijavljuju se kroz API grešku i prikazuju se korisniku.
- [ ] Kategorija sa decom ne može biti obrisana bez dogovorenog ponašanja (backend pravilo + UI poruka).

## Zavisnosti

- M01, B10

## Za juniore

- UX: pri promeni slug-a upozoriti da se menja javni URL (SEO).
