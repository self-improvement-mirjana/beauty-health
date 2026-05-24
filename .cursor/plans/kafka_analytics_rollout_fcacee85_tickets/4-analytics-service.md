# Ticket 4: Analytics mikroservis (Kafka consumer + read API)

## Cilj

Napraviti novi `analytics-service` koji konzumira events iz Kafke, cuva raw event-e i pravi agregate za izvestaje.

## Arhitektonska odluka za MVP

- Baza: **PostgreSQL**
- Slojevi podataka:
  - raw event tabela (audit + dedup)
  - agregatne tabele (sat/dan)

## Predlog strukture novog servisa

- `analytics-service/build.gradle`
- `analytics-service/src/main/java/...`
- `analytics-service/src/main/resources/application.yml`
- `analytics-service/src/main/resources/db/changelog/...`

## Obavezni novi elementi

1. Kafka consumer konfiguracija.
2. API key auth filter/interceptor:
   - header: `X-API-Key`
3. Tabele:
   - `analytics_events_raw`
   - `analytics_kpi_daily`
   - `analytics_payments_daily`
   - `analytics_funnel_daily`
4. Idempotencija:
   - unique na `event_id`
   - duplikat event ne sme duplo da menja agregate
5. Endpoint-i:
   - `GET /api/v1/reports/kpi-summary`
   - `GET /api/v1/reports/payments`
   - `GET /api/v1/reports/funnel`

## Implementacioni guideline

1. Prvo napravi shemu baze i migracije.
2. Zatim napravi raw event persist logiku.
3. Tek onda agregacionu logiku po eventType.
4. Na kraju read endpoint-e i API key auth.

## Agregaciona pravila (minimum)

- `order_created`:
  - povecaj order count
  - dodaj revenue (amount)
- `payment_authorized`:
  - povecaj payment success count
- `payment_failed` i `payment_expired`:
  - povecaj payment failure count
- `checkout_started`:
  - povecaj funnel step checkout_start

## Acceptance kriterijumi

- Servis startuje lokalno.
- Consumer cita poruke sa `bh.analytics.events.v1`.
- Raw event upis radi.
- Duplikat poruka ne pravi dupli agregat.
- API key auth radi (401 bez kljuca, 200 sa validnim kljucem).
- Report endpoint-i vracaju podatke iz agregata.

## Komande za proveru

- `cd analytics-service && ./gradlew test`
- `cd analytics-service && ./gradlew bootRun`

## Ne raditi u ovom ticketu

- Ne menjati moderator UI.
- Ne uvoditi napredni BI/warehouse.
