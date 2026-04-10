# 08 — Rezultati pretrage: listing kao katalog

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 4.1 „Products search“

## Cilj

Stranica rezultata pretrage koja prikazuje proizvode kao **listing sa istim pravilima** kao katalog (cena, akcija, zalihe, CTA).

## Opseg

- Čitanje query parametra sa rute definisane u tiketu 03.
- Poziv pretrage (API ili client-side filter nad mock podacima na početku).
- Prikaz „nema rezultata“ kada je upit validan ali prazan skup.

## Kriterijumi prihvatanja

- [ ] Ista kartica/listing logika kao odjeljak 3.1 (tiket 05).
- [ ] Upit iz URL-a određuje rezultate (refresh stranice zadržava upit).
- [ ] Performantno na mobilnom u smislu: nema blokirajućeg rendera hiljada kartica bez paginacije (dogovoriti paginaciju ili infinite scroll sa mentorom).

## Za juniore

- Izbegavajte dupliranje: izdvojite `ProductGrid` koji prima niz proizvoda.

## Zavisnosti

- 03, 05
