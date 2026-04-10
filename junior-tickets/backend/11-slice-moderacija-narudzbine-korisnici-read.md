# B11 — Slice `moderation`: narudžbine i korisnički pregled

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 1.3

## Cilj

Omogućiti moderatoru da vidi **narudžbine**, menja status (u okviru dozvoljenog workflow-a), i radi ograničen **pregled korisnika** radi podrške (bez eksponiranja lozinki).

## Opseg

- GET lista narudžbina sa filterima (status, datum).
- PATCH statusa sa validnim prelazima (state machine minimalno).
- GET korisnik po ID/email za internu upotrebu — **PII** minimizacija; logovan pristup ako audit postoji.
- Nema javnog eksporta CSV osim ako eksplicitno traženo.

## Kriterijumi prihvatanja

- [ ] Neautorizovan pristup vraća 401/403 (B02).
- [ ] Nevalidan prelaz statusa vraća 409 ili400 sa jasnom porukom.
- [ ] Podaci u odgovoru ne uključuju hash lozinke niti osetljiva polja.

## Zavisnosti

- B07, B03, B02

## Za juniore

- Uskladiti sa GDPR očekivanjima: prikažite samo ono što je neophodno za operativu.

## Plan za AI agenta

1. **API**: `GET /api/v1/admin/orders?status=&from=&to=` paginirano; `GET /api/v1/admin/orders/{id}` sa stavkama i adresom; `PATCH /api/v1/admin/orders/{id}/status` sa telom `{ "status": "..." }`.
2. **State machine**: enum prelazi npr. `NEW→CONFIRMED→SHIPPED→COMPLETED` i `CANCELLED`; nevalidan prelaz → **409** (B02).
3. **Korisnik (support)**: `GET /api/v1/admin/users?email=` ili `/{id}` — response **bez** `passwordHash`, bez internih tokena; opciono maskiranje email-a.
4. **Autorizacija**: ista kao B10; logovati pristup PII ako audit postoji.
5. **Testovi**: matrica dozvoljenih prelaza; test zabrane za običnog korisnika.
6. **ER**: koristi `ORDER`, `ORDER_ITEM`, `USER` iz [`DATA_MODEL.md`](../DATA_MODEL.md).
