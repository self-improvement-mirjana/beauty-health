# Analytics failure playbook

## 1. Outbox rows stuck in PENDING

**Simptom:** `analytics_outbox` ima mnogo redova sa `status=PENDING`, Kafka topic prazan.

**Mogući uzrok:** Kafka nije dostupna, pogrešan `KAFKA_BOOTSTRAP_SERVERS`, ili `app.analytics.kafka.enabled=false`.

**Dijagnostika:**
- Proveri da li Kafka listener radi (`docker compose ps kafka`)
- Proveri backend log za `Analytics outbox publish failed`
- SQL: `SELECT status, count(*) FROM analytics_outbox GROUP BY status;`

**Oporavak:**
- Pokreni/popravi Kafka broker
- Restart backend-a — scheduler nastavlja retry (status ostaje PENDING)
- Poslovne transakcije nisu blokirane

## 2. Duplikat payment webhook

**Simptom:** Banka šalje isti webhook više puta.

**Mogući uzrok:** Normalno ponašanje PSP retry-a.

**Dijagnostika:**
- Payment controller vraća `already_processed`
- Consumer: `existsByEventId` sprečava dupli agregat

**Oporavak:** Nije potrebna intervencija ako je idempotencija aktivna.

## 3. Analytics-service 401 na report endpoint-ima

**Simptom:** Moderator dashboard prikazuje grešku; backend proxy vraća 502/503.

**Mogući uzrok:** Pogrešan `X-API-Key` između backend-a i analytics-service.

**Dijagnostika:**
- Uporedi `app.analytics.service.api-key` (backend) i `app.analytics.api-key` (analytics-service)
- `curl -H "X-API-Key: ..." http://localhost:8081/api/v1/reports/kpi-summary`

**Oporavak:** Uskladi API ključeve u konfiguraciji i restart oba servisa.

## 4. Consumer restart

**Simptom:** analytics-service restartovan.

**Mogući uzrok:** Deploy ili crash.

**Dijagnostika:** Kafka consumer group offset — nastavlja od poslednjeg commit-a.

**Oporavak:** Restart servisa; duplikati se ignorišu preko `event_id` unique constraint.

## 5. Nevalidni storefront batch

**Simptom:** `acceptedCount < events.length` u ingest response.

**Mogući uzrok:** Pogrešan `schemaVersion`, PII u payload-u, nepoznat event type.

**Dijagnostika:** Pogledaj `rejectedEventIds` u response body.

**Oporavak:** Ispravi frontend event shape prema `event-envelope-v1.md`.
