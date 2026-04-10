# 16 — Dodavanje u korpu: listing i `?add-to-cart=<id>`

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 6.3 Dodavanje u korpu (simple proizvodi)

## Cilj

Omogućiti dodavanje **jednostavnih** proizvoda u korpu sa listinga („Dodaj u korpu“) i podržati **URL parametar** `?add-to-cart=<productId>` (numerički id).

## Opseg

- Klik na „Dodaj u korpu“ na kartici jednostavnog proizvoda dodaje stavku i ažurira indikator korpe.
- Na PDP-u (jednostavan proizvod) primarno dugme dodaje u korpu.
- Na odgovarajućoj ruti (npr. shop ili PDP): ako URL sadrži `add-to-cart`, pri učitavanju stranice dodati proizvod (jednom po učitavanju — paziti na duplo u React strict mode; dogovor sa mentorom).

## Kriterijumi prihvatanja

- [ ] Simple proizvod sa zalihama se dodaje iz listinga.
- [ ] `?add-to-cart=123` dodaje proizvod 123 kada je validan i na zalihama.
- [ ] Nakon dodavanja, korisnik može videti promenu na `/cart-3/` (minimalno: broj stavki — pun prikaz korpe TBD u specifikaciji odjeljak 6.5).

## Za juniore

- Parsiranje query-ja: koristite ugrađene API-je routera.
- Za TBD linijske cene u korpi — prikažite bar **listu ID** ili naziva kao privremeno rešenje uz komentar.

## Zavisnosti

- 05, 09, 15
