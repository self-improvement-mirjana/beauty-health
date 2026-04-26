# Demo skripte za Beauty Health Moderator

Ovaj folder sadrži shell skripte koje pokreću ceo stack (Postgres + Spring Boot
backend + Vite dev server-i) i izvršavaju Playwright walkthrough kroz **moderator
aplikaciju**, sa ciljem da:

1. Naprave **screenshot dokaz** svakog ekrana (M01–M06 + bonus 403/forbidden).
2. Pokrenu **live demo** u vidljivom Chrome-u sa 2 sekunde pauze između koraka,
   tako da možeš da gledaš kako radi.

Sve skripte se oslanjaju na **Docker** (postgres + backend image se grade kroz
`docker compose` iz `beauty-health/`) i na Playwright web-server konfiguraciju
(automatski podiže `storefront` i `moderator` Vite dev servere).

---

## Brzi start

```bash
cd beauty-health/e2e

# Headless screenshot run (PNG fajlovi u e2e/screenshots/)
bash scripts/screenshots.sh

# Live demo (Chrome se otvori, 2s pauze, ~110s ukupno)
bash scripts/demo.sh
```

Posle prve uspešne `up.sh` invokacije, docker stack ostaje gore — sledeći
pozivi su brzi (nema rebuild-a).

---

## Skripte

### `up.sh` — pokreni Postgres + backend (Docker)

Pokreće `docker compose up -d` iz `beauty-health/` i čeka da `/api/v1/catalog/ping`
vrati OK (max 180s, podesivo `WAIT_MAX=240`).

```bash
bash scripts/up.sh
```

Idempotentno: ako je stack gore, samo proverava ping. Ako backend ne odgovori
u dato vreme, ispiše instrukciju da se pogledaju logovi: `docker compose logs backend`.

### `down.sh` — gasi Docker stack

```bash
bash scripts/down.sh
```

### `screenshots.sh` — headless screenshot run

Radi `up.sh` → `npm install` (e2e) → `playwright install chromium` (po potrebi)
→ pokrene Playwright spec **bez** prikaza prozora. Snimi 24 PNG fajla u
`beauty-health/e2e/screenshots/`.

```bash
bash scripts/screenshots.sh
```

Trajanje: ~22 sekunde nakon što je stack gore.

### `demo.sh` — live demo (headed Chrome, 2s pauze)

Isto kao `screenshots.sh`, ali pokreće Playwright sa `--headed` i postavlja
`WALKTHROUGH_PAUSE_MS=2000` (2s pauza između koraka) + `PLAYWRIGHT_SLOW_MO=400`
(usporenje akcija unutar koraka).

```bash
bash scripts/demo.sh
```

Trajanje: ~50–60 sekundi sa 2s pauzom po koraku.

Možeš podesiti tempo:

```bash
WALKTHROUGH_PAUSE_MS=3000 PLAYWRIGHT_SLOW_MO=600 bash scripts/demo.sh
```

---

## Šta walkthrough zapravo radi (24 koraka)

1. **Seed** kroz REST API: registruje novog kupca (`demo-<timestamp>@example.local`),
   napuni korpu sa proizvodom iz seed kataloga i checkout-uje (status `NEW`),
   pa pošalje recenziju (ostaje neodobrena dok je moderator ne odobri).

2. **M01 — Login & autentikacija** (4 screenshota):
   - prazna login forma
   - **bonus**: kupac sa `CUSTOMER` ulogom proba `/orders` → `/forbidden`
   - login forma sa popunjenim moderator kredencijalima
   - dashboard sa `Local Moderator · moderator@local.test`

3. **M02 — Proizvodi** (4 screenshota):
   - lista (1662 proizvoda iz seed kataloga, paginacija 84 stranice)
   - filter pretragom po nazivu
   - prazna forma "Novi proizvod"
   - "Uredi proizvod" sa sekcijama Osnovno + Cene + Zalihe po magacinu

4. **M03 — Brendovi & kategorije** (4 screenshota):
   - lista brendova
   - modal "Novi brend"
   - stablasti prikaz kategorija (full page)
   - modal "Nova kategorija"

5. **M04 — Narudžbine** (2 screenshota):
   - lista sa filterima (status, datum) — pokazuje sve test narudžbine
   - detalj narudžbine sa kupcem, stavkama, status dropdown-om i adresom

6. **M05 — Sadržaj** (6 screenshota):
   - CMS lista (10 seed stranica)
   - CMS modal sa **live markdown preview**
   - lista maloprodaja
   - modal "Nova lokacija"
   - lista blog članaka
   - modal "Novi članak"

7. **M06 — Korisnici i recenzije** (3 screenshota):
   - lista recenzija sa **GDPR/PII bannerom** + naša demo neodobrena recenzija
   - filter po slug-u proizvoda
   - tab "Podrška (korisnik)" sa pretragom po e-pošti i prikazom rezultata
     (ID, ime, broj narudžbina, uloge — bez password hash-a)

8. **Logout** (1 screenshot): odjava vraća na login formu.

Svi screenshoti idu u `e2e/screenshots/NN_nazivekrana.png`.

---

## Direktno preko `npm` script-ova

```bash
cd beauty-health/e2e

npm run stack:up                  # docker compose up + wait
npm run stack:down                # docker compose down
npm run walk:moderator            # samo Playwright headless
npm run walk:moderator:headed     # samo Playwright headed (2s pauze)
npm run screenshots:moderator     # full pipeline (up.sh + walk headless)
npm run demo:moderator            # full pipeline (up.sh + walk headed)
```

---

## Troubleshooting

**Backend ne dolazi do `ping`-a**: pogledaj `docker compose logs backend` — Liquibase
treba da završi sve changeset-ove. Ako Postgres image još uvek pulluje (prvi run),
povećaj `WAIT_MAX`:
```bash
WAIT_MAX=300 bash scripts/up.sh
```

**Playwright ne nalazi browser**: `cd beauty-health/e2e && npx playwright install chromium`.

**Vite dev server-i ne kreću**: Playwright config (`playwright.config.ts`) sam ih
podiže iz `storefront/` i `moderator/` foldera. Ako neka instanca već radi na 5173/5174,
Playwright je reuse-uje (`reuseExistingServer: true`).

**Vidim `Učitavanje liste nije uspelo` na narudžbinama**: znači imaš stari backend
image bez Specification-bazirane verzije `findAdminFiltered`. Rebuild:
```bash
cd beauty-health && docker compose build backend && docker compose up -d backend
```
