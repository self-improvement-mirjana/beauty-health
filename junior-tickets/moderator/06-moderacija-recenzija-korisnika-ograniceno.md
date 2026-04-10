# M06 — Moderacija recenzija i ograničen pregled korisnika

**Tip:** Story  
**Prioritet:** Should  
**Spec:** odjeljci 5.4, 1.3

## Cilj

Omogućiti moderatoru da **odobri/sakrije** recenzije (ako backend podržava flag) i da uradi minimalni **pregled korisnika** radi podrške (B11).

## Opseg

- Lista recenzija po proizvodu ili globalno sa filterom; akcije approve/reject.
- Korisnik: pretraga po email (interno); prikaz osnovnih podataka bez lozinke.

## Kriterijumi prihvatanja

- [ ] Akcije idu kroz API sa autorizacijom; 403 za običnog korisnika.
- [ ] Promena vidljivosti utiče na storefront PDP bez ručnog čišćenja keša (ili je keš TTL dokumentovan).

## Zavisnosti

- M01, B08, B11

## Za juniore

- GDPR: prikažite upozorenje u UI da se pristupa PII samo u svrhu podrške.
