# B07 — Slice `orders`: kreiranje narudžbine iz korpe (minimum dok se odjeljak 7.3 ne dopuni — TBD)

**Tip:** Story  
**Prioritet:** Should  
**Spec:** odjeljak 7

## Cilj

Omogućiti **checkout** tok u meri u kojoj je specifikacija definisana: korpa kao ulaz, kreiranje narudžbine, status, prikaz rokova isporuke (tekst konfigurabilan ili iz sadržaja).

## Opseg

- Entitet `Order`, `OrderLine`, statusi (npr. `NEW`, `PAID`, `FULFILLED` — minimalno).
- Transakcija: iz korpe → narudžbina; smanjenje zaliha (ili rezervacija — dogovor tima).
- REST: `POST /api/v1/orders` (za ulogovanog korisnika) sa adresnim poljima koje front prikupi kada TBD 7.3 bude zatvoren; do tada **minimalan** DTO i feature flag u dokumentaciji.
- Slanje potvrde emailom — **opciono** u ovom tiketu (TBD).

## Kriterijumi prihvatanja

- [ ] Jedna kompletna “happy path” narudžbina prolazi u integracionom testu sa test kontejnerom PostgreSQL (Testcontainers preporučeno) ili in-memory ako mentor odobri — ali produkcijski kod mora biti validan za PostgreSQL.
- [ ] Neuspeh (npr. nedovoljno zaliha) rolluje transakciju.
- [ ] Moderator API (B11) može kasnije da čita istu narudžbinu.

## Zavisnosti

- B06, B04

## Za juniore

- Ne implementirati plaćanje karticom dok nema specifikacije i pravnog okvira — stub “plaćanje pouzećem” je dovoljno za MVP ako je tako odlučeno.

## Plan za AI agenta

1. **Liquibase**: tabele prema ER: `orders` (id, user_id FK, status enum, total_amount, currency, created_at), `order_item` (order_id, variant_id, quantity, unit_price), `customer_address` (id, order_id FK ili snapshot polja unutar order), `payment_transaction` (id, order_id, provider, status, amount — stub), `shipment` (id, order_id, carrier, tracking — opciono stub); kasnije `coupon`, `order_discount` ako proizvod traži.
2. **Servis**: `OrderService.createFromCart(userId, checkoutDto)` u `@Transactional` — učitaj korpu, validiraj zalihe, kreiraj order + lines, umanji `inventory`, obriši/prazni korpu.
3. **API**: `POST /api/v1/orders` — zahtev telo sa poljima iz minimalnog checkout DTO (adresa, kontakt); vratiti `201` + `orderId` + `status`.
4. **Rollback**: pri `PessimisticLockException` ili nedovoljnoj zalihi — rollback cele transakcije; jasna 409 poruka.
5. **Konfiguracija isporuke**: konstanta ili `cms_page` ključ za tekst rokova (vezati na B09 kada bude spremno).
6. **Testovi**: Testcontainers test happy path; test insuficijentne zalihe posle paralelnog “checkout” (opciono).
7. **Dokumentacija**: označiti u README šta je TBD iz specifikacije 7.3 (polja forme).
