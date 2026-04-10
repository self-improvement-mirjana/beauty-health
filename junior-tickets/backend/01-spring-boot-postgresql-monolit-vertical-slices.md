# B01 — Spring Boot monolit, PostgreSQL i kostur vertical slices

**Tip:** Epic / Story  
**Prioritet:** Must  
**Spec:** odjeljak 0.1

## Cilj

Podići **jedan** Spring Boot servis sa **PostgreSQL** i osnovnom strukturom paketa po **vertical slice**-u (ne klasičan “sve u `controller/service/repository` bez domene”).

## Opseg

- **Gradle** (preporuka: Kotlin DSL `build.gradle.kts`), Java 17+, Spring Boot 3.x.
- Zavisnosti: Web, Data JPA (ili JDBC ako tim tako odluči za deo slučajeva), Validation, Security (kasnije aktivacija u B03), PostgreSQL driver.
- Konfiguracija `application.yml` za lokalni PostgreSQL (profil `local`).
- Paketi npr. `com.beautyhealth.<app>.catalog`, `...cart`, `...orders`, `...auth`, `...moderation`, `...content`, `...review` — svaki slice ima svoje `@RestController` i domenske klase; **zajednički** paket za `config`, `common.error`, `common.money` (RSD konvencija u API odgovorima).
- **Liquibase** (Spring Boot starter): master changelog npr. `db/changelog/db.changelog-master.yaml` i početni **changeset** (može biti prazan tag ili minimalna šema po dogovoru tima).

## Kriterijumi prihvatanja

- [ ] Aplikacija se podiže lokalno i uspešno se povezuje na PostgreSQL.
- [ ] Postoji bar **dva** slice paketa sa “placeholder” health ili ping endpointom koji dokumentuje konvenciju (npr. `/api/v1/catalog/...` i `/api/v1/cart/...`).
- [ ] README u backend modulu objašnjava **šta je vertical slice** u ovom repo-u i gde dodati novu funkcionalnost.
- [ ] Migracije su uključene u build; čista baza se podiže od nule bez ručnih koraka osim kreiranja prazne DB.
- [ ] Projekat se pokreće standardnim Gradle zadacima (npr. `./gradlew bootRun`) i zavisnosti su u Gradle fajlovima, ne u `pom.xml`.

## Zavisnosti

- Nema.

## Za juniore

- Vertical slice ovde znači: **ne** kopirati isti obrazac “jedan globalni `ProductService` za sve”; grupisati kod oko poslovne sposobnosti (npr. sve za katalog u jednom modulu paketa).
- Dogovorite prefiks URL-a (`/api/v1/...`) i držite ga konzistentnim kroz sve tikete.

## Plan za AI agenta

1. **Repo kostur**: kreirati Gradle Kotlin DSL projekat (`settings.gradle.kts`, `build.gradle.kts`), Java 17 toolchain, `org.springframework.boot` plugin, grupa `com.beautyhealth` (ili dogovoreni base package).
2. **Zavisnosti**: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, `spring-boot-starter-security` (privremeno `permitAll` ili isključeno dok B03 ne aktivira pravila), `postgresql` JDBC, `spring-boot-starter-jdbc` ako treba, `liquibase-core` + Spring Boot Liquibase auto-config.
3. **Konfiguracija**: `src/main/resources/application.yml` (default) + `application-local.yml` sa `spring.datasource.url/username/password`, `spring.jpa.hibernate.ddl-auto=validate` (kad Liquibase vodi šemu), `spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml`.
4. **Liquibase**: fajl `src/main/resources/db/changelog/db.changelog-master.yaml` koji uključuje `changes/baseline.yaml` sa praznim ili `preConditions` + komentar; proveriti da se pri `bootRun` tabela `databasechangelog` kreira.
5. **Paketi (vertical slices)**: npr. `...catalog.api`, `...cart.api` — u svakom jedan `@RestController` sa `GET /api/v1/catalog/ping` i `GET /api/v1/cart/ping` koji vraćaju JSON `{ "slice": "...", "ok": true }`.
6. **Zajednički sloj**: prazan ili minimalan `...config` paket; **ne** uvoditi globalni “God service”.
7. **Dokumentacija**: `README.md` u backend modulu — šta je slice, mapa paketa, kako pokrenuti lokalni PostgreSQL i `./gradlew bootRun`.
8. **Verifikacija**: prazna baza + jedan `bootRun`; opciono `@SpringBootTest` koji proverava kontekst.
9. **ER referenca**: entiteti iz [`DATA_MODEL.md`](DATA_MODEL.md) **ne** uvode se u ovom tiketu — samo infrastruktura.
