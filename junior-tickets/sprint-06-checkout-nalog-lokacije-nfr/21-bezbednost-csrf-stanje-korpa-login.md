# 21 — Bezbednost: CSRF za mutacije, zaštita login forme, hash lozinki

**Tip:** Story / Tech task  
**Prioritet:** Must  
**Spec:** dokument 10) Nefunkcionalni zahtevi (bezbednost)

## Cilj

Uskladiti implementaciju sa minimumom bezbednosti iz specifikacije:

- lozinke čuvane kao **hash**  
- **CSRF zaštita** za server-side zahteve koji menjaju stanje (korpa, checkout).  
- **Rate limiting** ili slična zaštita login forme.

## Opseg

- Backend (ili BFF): middleware za CSRF token na POST/PUT/PATCH koji diraju korpu ili narudžbine.
- Login: ograničenje pokušaja po IP/korisniku (broj i prozor — dogovor sa mentorom).
- Verifikacija da se lozinka nikad ne vraća u API odgovorima.

## Kriterijumi prihvatanja

- [ ] Postoji dokumentacija kako se CSRF koristi na frontu (header/cookie) za relevantne rute.
- [ ] Login endpoint odbija brute-force uz jasnu poruku korisniku.
- [ ] Pregled baze / user model: polje za lozinku je hash (+ salt ako je primenjeno).

## Za juniore

- Radite **par programiranja** sa iskusnijim developerom za prvu iteraciju CSRF-a.
- Ako je MVP samo front bez servera, eksplicitno napišite „N/A do uvodjenja API-ja“ i napravite checklist za kasnije.

## Zavisnosti

- 15–18, 19 (gde god postoji server-side auth i korpa)
