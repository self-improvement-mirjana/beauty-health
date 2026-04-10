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

## Plan za AI agenta

1. **Liquibase**: changeset `NN-auth-users.yaml` — tabele usklađene sa ER [`DATA_MODEL.md`](../DATA_MODEL.md): `users` (id, email UK, password_hash, full_name, created_at, …), `roles` / `user_roles` ili enum kolona `role` za MVP; tabela `remember_me_token` (token_hash, user_id FK, expires_at) ako se koristi “remember me”.
2. **Entiteti JPA**: `User`, `RememberMeToken` (opciono), mapiranje bez eksponiranja lozinke u `toString`.
3. **Password**: `PasswordEncoder` bean (BCrypt); pri registraciji hash; validacija jačine lozinke (Bean Validation).
4. **API** (`slice auth`): `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me` — tačna putanja može biti `/api/v1/users/me` ako tim preferira, ali **jedinstveno**.
5. **Security**: `SecurityFilterChain` — javno: swagger (local), GET kataloga (kasnije), POST auth; zaštićeno: `/api/v1/admin/**` ROLE_MODERATOR; JWT filter **ili** `formLogin` + session — implementirati **jednu** izabranu strategiju i dokumentovati u README.
6. **Moderator seed**: Liquibase `loadUpdateData` ili SQL insert jednog korisnika `moderator@local.test` sa hash-om poznate lozinke **samo za dev** profil (uslov `context: local`).
7. **DTO**: `RegisterRequest`, `LoginRequest`, `AuthResponse` (token ili prazan ako cookie session), `UserResponse` (bez hash-a).
8. **Testovi**: `@SpringBootTest` + Testcontainers PostgreSQL ili `@DataJpaTest` za UserRepository; `@WebMvcTest` za login 401/200.
9. **OpenAPI**: security scheme (bearer ili cookie) da front zna kako da šalje zahteve.
