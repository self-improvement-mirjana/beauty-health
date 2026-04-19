# Liquibase, seed i Docker

## Checksum greška nakon izmene `catalog-seed.sql`

Ako se **`catalog-seed.sql`** izmeni *posle* što je migracija koja ga učitava već jednom prošla na bazi, Liquibase pri startu aplikacije prijavi **Validation Failed / checksum mismatch** za changeset (npr. `b04-seed-catalog-sql`).

### Rešenje u kodu

U `backend/src/main/resources/db/changelog/changes/04-catalog-seed.yaml` dodati **`validCheckSum`** za **staru** sumu koju Liquibase čuva u tabeli `databasechangelog`, tako da je izmena seed-a priznata kao namerna.

### Posle izmene backend Java/resursa

Iz korena repoa:

```bash
docker compose build backend && docker compose up -d backend
```

Konfiguracija: `docker-compose.yml` — Postgres volumen za perzistentne podatke.

## Zašto je kontejner „udio“ sa portom 8080

Ako Spring ne prođe Liquibase (ili drugi bean init), proces se ugasi — **`curl localhost:8080`** neće odgovarati dok backend ne startuje čisto.

## Profil

`SPRING_PROFILES_ACTIVE=local` u Compose servisu za backend (povezivanje na Postgres iz istog stack-a).
