# B12 — NFR: bezbednost, rate limiting, osnovno logovanje

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 10

## Cilj

Završiti zaštitu koja se odnosi na backend: **CSRF** gde je primenjivo, **rate limit** na login i write endpoint-e gde je rizik, strukturisano logovanje grešaka.

## Opseg

- Ako se koriste session cookies za web front: uključiti CSRF za state-changing metode ili koristiti token strategiju dokumentovanu u B03.
- Rate limiting: npr. Bucket4j ili gateway — bar za `/auth/login` i `POST` recenzije.
- Helmet-slične HTTP zaglavlja gde Spring Security dozvoljava (HSTS u produkciji uz HTTPS).
- Ne logovati telo zahteva sa lozinkama.

## Kriterijumi prihvatanja

- [ ] Brute force na login je otežan (limit se može demonstrirati testom ili ručno).
- [ ] CSRF politika je dokumentovana za oba fronta.
- [ ] Produkcijski profil isključuje Swagger ako je to politika tima.

## Zavisnosti

- B02, B03

## Za juniore

- Ne mešati “security headers” sa CORS — različiti problemi; oba moraju biti ispravna za dev i prod konfiguracije.

## Plan za AI agenta

1. **CSRF**: ako je session-based auth, uključiti Spring Security CSRF i dokumentovati da front šalje token (cookie ili header); za JWT stateless CSRF tipično nije potreban — eksplicitno navesti u README.
2. **Rate limiting**: integrisati Bucket4j (in-memory za dev, Redis za prod ako treba) — filter na `POST /api/v1/auth/login` (npr. 10/min po IP) i `POST .../reviews` (npr.5/h).
3. **Security headers**: `Content-Security-Policy` može biti preširoko za API; za statički hosting fronta rešavati na CDN-u; za Spring dodati `Referrer-Policy`, `X-Content-Type-Options` gde ima smisla.
4. **Logging**: strukturisani logovi (JSON) u prod profilu; maskirati `Authorization` i polja sa lozinkom; nivo `WARN` za poslovne konflikte.
5. **Swagger u prod**: `springdoc.swagger-ui.enabled=false` kada je `spring.profiles.active=prod`.
6. **Testovi**: jednostavan test koji šalje N+1 login zahteve i očekuje **429** posle praga (ako je Bucket4j lako mockovati).
