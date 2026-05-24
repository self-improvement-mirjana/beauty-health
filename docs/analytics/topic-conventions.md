# Kafka topic conventions (analytics v1)

## Glavni topic

| Topic | Svrha |
|-------|--------|
| `bh.analytics.events.v1` | Svi analytics event envelope-i (v1). |

- **Key:** `eventId` (UUID) — omogućava idempotentnu konzumaciju i particionisanje po događaju.
- **Value:** JSON envelope (vidi `event-envelope-v1.md`).
- **Proizvođač:** backend outbox publisher (`AnalyticsOutboxPublisher`).
- **Potrošač:** `analytics-service` Kafka consumer.

## Dead letter topic (opciono)

| Topic | Svrha |
|-------|--------|
| `bh.analytics.events.v1.dlt` | Poruke koje consumer ne može obraditi nakon retry-a. |

MVP: DLT topic je definisan konvencijom; automatsko rutiranje u DLT nije obavezno u prvoj fazi.

## Verzionisanje

- Suffix `.v1` u imenu topic-a odgovara `schemaVersion: v1` u envelope-u.
- Nova verzija schema-e → novi topic (npr. `bh.analytics.events.v2`) i paralelni consumer; ne mešati verzije u istom topic-u.

## Konfiguracija (backend)

```yaml
app:
  analytics:
    topic: bh.analytics.events.v1

spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      acks: all
      retries: 3
```
