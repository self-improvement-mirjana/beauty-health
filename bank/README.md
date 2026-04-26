# Mock Bank API

Edukativni mock PSP/banka servis za simulaciju kartičnog plaćanja u beauty-health projektu.

## Stack

- Java 17, Spring Boot 3.5, PostgreSQL, Liquibase, JPA, JWT
- Signing: RSA-SHA256 / HMAC-SHA256 (bez Bouncy Castle-a)
- Port: **8090**

## Pokretanje (Docker)

```bash
# Iz beauty-health/ root-a:
docker compose up -d postgres-bank bank
```

## Pokretanje (lokalno)

```bash
cd bank
./gradlew bootRun
```

Zahteva PostgreSQL na `localhost:5433` sa bazom `mock_bank` (videti `application-local.yml`).

## Seed podaci

Liquibase automatski ubacuje:

| Entitet | Detalji |
|---------|---------|
| Bank admin | `admin@banka.local` / `admin123` |
| Demo klijent | `demo@korisnik.rs` |
| Demo kartica | PAN `4242424242424242`, exp 12/2028, balans 100.000 RSD |
| Demo merchant | `beauty-health`, RSA mode |

CVV za demo karticu se loguje prilikom seed-a (default: `123` pre hash-ovanja).

## Izdavanje sertifikata

```bash
chmod +x bank/scripts/demo-issue-cert.sh
./bank/scripts/demo-issue-cert.sh
```

Skripta ispisuje privatni i javni ključ za kopiranje u shop backend konfiguraciju.

## API struktura

| Grupa | Prefix | Auth |
|-------|--------|------|
| Admin | `/api/v1/admin/*` | JWT (BANK_ADMIN role) |
| S2S Payment | `/api/v1/payments/*` | Signed headers (X-Signature) |
| Hosted page | `/api/v1/hosted/*` | Public |
| Auth | `/api/v1/auth/*` | Public |

## PCI napomena

Ovo je **edukativni** servis. PAN se čuva bez enkripcije u bazi. U produkciji bi bio potreban PCI DSS compliance, tokenizacija, HSM itd.
