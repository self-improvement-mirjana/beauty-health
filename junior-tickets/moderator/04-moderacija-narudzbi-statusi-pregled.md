# M04 — Pregled narudžbina i promena statusa

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 1.3 (uz B11)

## Cilj

Tabularni prikaz narudžbina sa filterima i **bezbednom** promenom statusa preko B11.

## Opseg

- Lista: broj narudžbine, datum, kupac (ime/email ako dozvoljeno), ukupan iznos, status.
- Detalj narudžbine: stavke, adresa ako postoji u modelu.
- Akcije: dropdown ili dugmad za dozvoljene prelaze statusa; disabled za nevalidne.

## Kriterijumi prihvatanja

- [ ] Ne prikazuje se osetljivi podatak van dozvoljenog opsega (usklađeno sa mentorom).
- [ ] Konflikt pri promeni statusa (npr. paralelna izmena) prikazuje se kao čitljiva greška.

## Zavisnosti

- M01, B11, B07

## Za juniore

- Razmotrite export CSV kao follow-up tiket, ne u MVP ako nije traženo.
