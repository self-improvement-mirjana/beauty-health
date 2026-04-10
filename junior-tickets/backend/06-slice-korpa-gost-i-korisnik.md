# B06 — Slice `cart`: korpa za gosta i ulogovanog korisnika

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljci 6.1–6.4 (delimično dok TBD 6.5 ne bude zatvoren)

## Cilj

Perzistentna ili polu-perzistentna **korpa** sa REST operacijama: dodaj/ažuriraj/ukloni, vezivanje za **guest token** ili **user** nakon prijave.

## Opseg

- Model stavki: referenca na varijantu, količina, snapshot cene (opciono ali korisno za istoriju).
- Pravila: ne dodavati ako nema zaliha; varijabilni proizvod samo sa izabranom varijantom (usklađeno sa B04).
- Podrška za `?add-to-cart=<id>` na frontu znači da backend ima idempotentan “dodaj” endpoint koji front poziva pri učitavanju (dogovor sa F05).
- Endpoint za **broj stavki** ili količinu za badge “Korpa0”.

## Kriterijumi prihvatanja

- [ ] Gost može imati korpu pre identifikacije; nakon logina korpa se spaja (ili je definisano drugačije — ali mora biti dokumentovano ponašanje).
- [ ] Pokušaj dodavanja nedostupne varijante vraća jasnu grešku (B02 format).
- [ ] Prazna korpa se može detektirati na API za empty state (specifikacija 6.2).

## Zavisnosti

- B02, B03 (za merge), B04

## Za juniore

- Dok specifikacija 6.5 ostaje TBD, implementirajte minimalno (lista stavki + linijski iznos) ili stub sa flagom “TBD pricing rules” — ali **ne** ostavljati nedefinisane JSON ključeve bez README napomene.

## Plan za AI agenta

1. **Liquibase**: tabele `cart` (id, user_id nullable, guest_cart_token UK nullable, created_at, updated_at), `cart_item` (id, cart_id, product_variant_id FK, quantity, unit_price_snapshot optional); unique constraint `(cart_id, product_variant_id)`.
2. **ER usklađenje**: veze `CART ||--o{ CART_ITEM`, `PRODUCT_VARIANT ||--o{ CART_ITEM` iz [`DATA_MODEL.md`](../DATA_MODEL.md).
3. **Identifikacija gosta**: generisati UUID pri prvom `GET/POST` korpe; vratiti u headeru `X-Guest-Cart-Id` ili telu odgovora; front čuva u `sessionStorage`/cookie (dokumentovati).
4. **API**: `GET /api/v1/cart`, `POST /api/v1/cart/items` (body: `variantId`, `quantity`), `PATCH /api/v1/cart/items/{id}`, `DELETE /api/v1/cart/items/{id}`, `GET /api/v1/cart/summary` (broj stavki / ukupna količina za badge).
5. **Pravila**: pre dodavanja učitati varijantu + zalihu (B04); ako nema zaliha → 409 sa B02 kodom; ako opcije nisu kompletne za varijantu (ne bi smelo) → 400.
6. **Merge pri loginu**: transakcija koja pronalazi `guest_cart` po tokenu i prebacuje stavke u `user`-korpu (ili obrnuto — **jedna** strategija, dokumentovana u README).
7. **Idempotencija**: `POST` sa istim `variantId` može uvećati količinu ili vratiti 409 — izabrati i dokumentovati.
8. **Testovi**: integracioni test merge scenarija; test odbijanja pri nedostatku zaliha.
