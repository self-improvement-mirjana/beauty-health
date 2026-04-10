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
