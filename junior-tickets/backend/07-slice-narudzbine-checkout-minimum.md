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
