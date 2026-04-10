# 13 — PDP: recenzije — forma „Dodaj recenziju“ i pravila privatnosti

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 5.4 Recenzije („Dodaj recenziju“)

## Cilj

Omogućiti unos recenzije sa poljima: **ocena**, **tekst**, **ime**, **email**, **checkbox „sačuvaj moje podatke“** (lokalno u browseru), i prikaz poruke da email **neće biti javno objavljen**.

## Opseg

- Forma sa validacijom (email format, obavezna ocena).
- Checkbox: kada je uključen, čuvati ime/email u `localStorage` (ili slično) za sledeći poset.
- Lista postojećih recenzija na PDP-u (mock ili API).
- Prikaz disclaimer-a pored email polja.

## Kriterijumi prihvatanja

- [ ] Sva polja iz specifikacije su prisutna i funkcionalna.
- [ ] Nakon submit-a korisnik vidi potvrdu ili novu stavku u listi (po implementaciji backenda; mock OK za front-only fazu).
- [ ] „Sačuvaj moje podatke“ zaista persistira podatke lokalno.
- [ ] Vidljiva je poruka da email ne ide u javni prikaz.

## Za juniore

- Ne šaljite lozinke u localStorage — samo ime/email ako je eksplicitno traženo.
- Razmislite o **rate limiting** na backendu kasnije (odjeljak 10); front samo priprema UX.

## Zavisnosti

- 11
