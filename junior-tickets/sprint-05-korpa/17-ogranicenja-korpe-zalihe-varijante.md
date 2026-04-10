# 17 — Ograničenja korpe: zalihe i varijante

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 6.4 Ograničenja dodavanja

## Cilj

Sistem **ne sme** ponuditi pogrešan add-to-cart za nedostupne proizvode i **ne sme** dodati varijabilni proizvod bez izabranih opcija.

## Opseg

- Out of stock: nema aktivnog „Dodaj u korpu“ na listingu i PDP-u (usklađeno sa tiketom 05/09).
- Varijabilni proizvod: sa listinga samo navigacija na PDP („Odaberite opcije“); blokirati direktan `add-to-cart` u URL-u bez varijante ili prikazati grešku — **dogovor sa mentorom** (preporuka: ignorisati ili toast „Izaberite opcije na stranici proizvoda“).
- Zaštita na nivou funkcije `addToCart` (assert/invariant).

## Kriterijumi prihvatanja

- [ ] Ni jedan out-of-stock proizvod ne ulazi u korpu kroz UI.
- [ ] Varijanta mora biti izabrana pre dodavanja varijabilnog proizvoda.
- [ ] Edge case `?add-to-cart` za varijabilni proizvod ima definisano ponašanje i dokumentovano u PR-u.

## Za juniore

- Testirajte ručno tri slučaja: simple in stock, simple out of stock, variable.

## Zavisnosti

- 10, 16
