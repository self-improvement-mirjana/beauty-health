# B03 — Slice `auth`: registracija, prijava, JWT ili session, uloge

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljci 1.2, 1.3, 10 bezbednost

## Cilj

Obezbediti **autentikaciju** za storefront korisnike i osnovu za **uloge** (kupac vs moderator). Lozinke **hash** (BCrypt ili Argon2).

## Opseg

- Entiteti: `User`, opciono `Role` / enum; veza korisnik ↔ uloge.
- Registracija + login REST endpointi pod `/api/v1/auth/...`.
- Izbor strategije dogovoriti sa mentorom:
  - **JWT** (stateless) sa kratkim TTL + refresh, ili
  - **server session** + cookie (HttpOnly, Secure u produkciji).
- Spring Security konfiguracija: javne rute (katalog read-only, statički sadržaj) vs zaštićene (korpa za ulogovanog ako tako odlučite, moderacija uvek).
- Endpoint “trenutni korisnik” za front.

## Kriterijumi prihvatanja

- [ ] Registracija i prijava rade protiv PostgreSQL; lozinke nisu u čitljivom obliku u bazi.
- [ ] Postoji način da se korisnik označi kao **moderator** (seed skripta ili admin-only prvi korisnik — dokumentovati).
- [ ] Neautorizovan pristup zaštićenom moderatorskom ruti vraća **401/403** u dogovorenom JSON formatu (B02).
- [ ] Osnovni integracioni test ili `@WebMvcTest` za login i za odbijanje neautorizovanog pristupa.

## Zavisnosti

- B01, B02

## Za juniore

- Ne čuvati JWT u `localStorage` ako tim bira cookie pristup — to je odluka fronta uz backend ugovor.
- CSRF: ako su session cookies, uključiti zaštitu za state-menjanje (specifikacija 10).
