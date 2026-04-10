# 19 — Moj nalog: prijava i registracija (minimalan flow)

**Tip:** Story  
**Prioritet:** Must  
**Spec:** dokument 1.2 Registrovan korisnik, 1.1 Gost (kontrast)

## Cilj

Omogućiti korisniku da se **registruje i prijavi** preko zone „Moj nalog“, i da post‑login postoji **korisnička zona** (minimalno: pozdrav / osnovni dashboard placeholder).

## Opseg

- Stranice: login, registracija, zaštićena ruta „moj nalog“ (tačan URL po dogovoru).
- Gost može i dalje da koristi katalog i korpu prema specifikaciji.
- Lozinke na backendu: **hash** (povezati sa tiketom 21 ako je odvojen backend task).

## Kriterijumi prihvatanja

- [ ] Korisnik može kreirati nalog i prijaviti se.
- [ ] Nakon prijave, link „Moj nalog“ vodi na sadržaj dostupan samo ulogovanom korisniku.
- [ ] Ne čuvati plain-text lozinku u bazi ili logovima.

## Za juniore

- Specifikacija **11** traži screenshot „Moj nalog“ za proširenje — dokumentujte šta je privremeno (npr. samo „Izloguj se“).

## Zavisnosti

- 02 (link u headeru)
