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

## Plan za AI agenta

1. **Brendovi**: stranica sa tabelom + modal za create/edit; polja `name`, `slug`, opciono `logoUrl`; pozivi B10.
2. **Kategorije**: tree view komponenta (recursive) ili flat lista sa indentom; forma sa `parentId` select (filter aktivnih); `sortOrder` numerički input.
3. **Validacija**: zabraniti izbor sopstvenog čvora kao roditelja; sprečiti cikluse (backend već treba da odbije — prikazati poruku).
4. **Slug preview**: prikaz budućeg URL-a `/category/{slug}` za kupca.
5. **ER**: mapiranje na `BRAND`, `CATEGORY`, `PRODUCT_CATEGORY` iz [`DATA_MODEL.md`](../DATA_MODEL.md).
6. **Optimistic locking (opciono)**: ako backend doda `version` polje kasnije, prikazati konflikt poruku.
