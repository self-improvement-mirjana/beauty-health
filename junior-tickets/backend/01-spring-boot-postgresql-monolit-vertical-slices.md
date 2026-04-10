# B01 — Spring Boot monolit, PostgreSQL i kostur vertical slices

**Tip:** Epic / Story  
**Prioritet:** Must  
**Spec:** odjeljak 0.1

## Cilj

Podići **jedan** Spring Boot servis sa **PostgreSQL** i osnovnom strukturom paketa po **vertical slice**-u (ne klasičan “sve u `controller/service/repository` bez domene”).

## Opseg

- Gradle ili Maven (dogovor tima), Java 17+, Spring Boot 3.x.
- Zavisnosti: Web, Data JPA (ili JDBC ako tim tako odluči za deo slučajeva), Validation, Security (kasnije aktivacija u B03), PostgreSQL driver.
- Konfiguracija `application.yml` za lokalni PostgreSQL (profil `local`).
- Paketi npr. `com.beautyhealth.<app>.catalog`, `...cart`, `...orders`, `...auth`, `...moderation`, `...content`, `...review` — svaki slice ima svoje `@RestController` i domenske klase; **zajednički** paket za `config`, `common.error`, `common.money` (RSD konvencija u API odgovorima).
- Flyway ili Liquibase: prazan početni skript ili minimalna šema (npr. `schema_version`).

## Kriterijumi prihvatanja

- [ ] Aplikacija se podiže lokalno i uspešno se povezuje na PostgreSQL.
- [ ] Postoji bar **dva** slice paketa sa “placeholder” health ili ping endpointom koji dokumentuje konvenciju (npr. `/api/v1/catalog/...` i `/api/v1/cart/...`).
- [ ] README u backend modulu objašnjava **šta je vertical slice** u ovom repo-u i gde dodati novu funkcionalnost.
- [ ] Migracije su uključene u build; čista baza se podiže od nule bez ručnih koraka osim kreiranja prazne DB.

## Zavisnosti

- Nema.

## Za juniore

- Vertical slice ovde znači: **ne** kopirati isti obrazac “jedan globalni `ProductService` za sve”; grupisati kod oko poslovne sposobnosti (npr. sve za katalog u jednom modulu paketa).
- Dogovorite prefiks URL-a (`/api/v1/...`) i držite ga konzistentnim kroz sve tikete.
