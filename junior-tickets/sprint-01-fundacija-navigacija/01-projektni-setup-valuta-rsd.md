# 01 — Projektni setup i format valute (RSD)

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 0 Opseg, odjeljak 10 Nefunkcionalni (delimično)

## Cilj

Postaviti osnovu projekta (stack koji tim bira) i **konvenciju prikaza cena** u formatu kao na referentnom sajtu: npr. `3.600,00 RSD`.

## Opseg

- Inicijalni projekat (frontend + po potrebi backend/API ugovor).
- Pomoćna funkcija ili komponenta za formatiranje iznosa u RSD (separator hiljada `.`, decimala `,`).
- Dokumentovati u README projekta kako se cena formatira (jedan izvor istine).

## Kriterijumi prihvatanja

- [ ] Postoji zajednički način da se bilo koji broj prikaže kao cena u RSD konzistentno kroz aplikaciju.
- [ ] Primer: `3600` → prikaz koji odgovara specifikaciji (hiljade + dve decimale + sufiks valute).
- [ ] Nema dupliranja logike formatiranja na svakoj stranici.

## Za juniore

- Prvo dogovorite sa mentorom **framework** (npr. Next.js, React + Vite) — ovaj tiket pretpostavlja da već imate repozitorijum.
- Ako koristite `Intl.NumberFormat`, proverite da locale i opcije daju željeni izlaz za srpski/RSD.

## Zavisnosti

- Nema (prvi tiket u sprintu).
