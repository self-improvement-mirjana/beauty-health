# Analytics observability — kako pratiti event end-to-end

Ovaj dokument pokazuje **gde se** svaki analytics event vidi tokom puta:

```
Storefront / Backend  ->  analytics_outbox  ->  Kafka topic  ->  analytics_events_raw  ->  agregati  ->  Read API
```

Za automatizovani trag jedne sesije, pokreni:

```bash
backend/scripts/demo-analytics-flow.sh
```

Skripta upisuje `docs/analytics/e2e-evidence.md` sa stvarnim odgovorima u tom trenutku.

## Preduslov: pokrenut docker stack

```bash
docker compose up --build -d
docker compose ps
```

Servisi i portovi:

| Servis | Host port |
|--------|-----------|
| `backend` | 8080 |
| `analytics-service` | 8081 |
| `postgres` (backend) | 5432 |
| `postgres-analytics` | 5434 |
| `kafka` | 9092 |
| `bank` | 8090 |

## 1) Provera Kafke

Lista topic-a:

```bash
docker compose exec kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 --list
```

Broj poruka po particiji za naš topic:

```bash
docker compose exec kafka /opt/kafka/bin/kafka-get-offsets.sh \
  --bootstrap-server localhost:9092 \
  --topic bh.analytics.events.v1
```

Čitanje poslednjih 10 poruka:

```bash
docker compose exec kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic bh.analytics.events.v1 \
  --from-beginning --max-messages 10 --timeout-ms 5000
```

Consumer group offset-i (vidi koliko je analytics-service pokupio):

```bash
docker compose exec kafka /opt/kafka/bin/kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 --describe --group analytics-service-v1
```

## 2) Backend outbox (Postgres `beauty_health`)

```bash
docker compose exec postgres psql -U beauty_health -d beauty_health -c "
  SELECT status, count(*) FROM analytics_outbox GROUP BY status;"

docker compose exec postgres psql -U beauty_health -d beauty_health -c "
  SELECT id, event_id, event_type, status, created_at, published_at, error_message
  FROM analytics_outbox ORDER BY id DESC LIMIT 10;"
```

Šta očekuješ:

- Posle business akcije (npr. checkout): pojavi se `PENDING` red.
- Posle `app.analytics.outbox.poll-interval-ms` (default 5s): isti red prelazi u `PUBLISHED` sa popunjenim `published_at`.
- Ako Kafka padne, status ostaje `PENDING` (scheduler retry-uje), poslednji `error_message` je popunjen.

## 3) Analytics raw i agregati (Postgres `beauty_health_analytics`)

```bash
docker compose exec postgres-analytics psql -U analytics -d beauty_health_analytics -c "
  SELECT count(*) AS raw_total FROM analytics_events_raw;"

docker compose exec postgres-analytics psql -U analytics -d beauty_health_analytics -c "
  SELECT event_type, count(*) FROM analytics_events_raw GROUP BY event_type ORDER BY event_type;"

docker compose exec postgres-analytics psql -U analytics -d beauty_health_analytics -c "
  SELECT report_day, order_count, revenue_total FROM analytics_kpi_daily ORDER BY report_day DESC;"

docker compose exec postgres-analytics psql -U analytics -d beauty_health_analytics -c "
  SELECT report_day, success_count, failure_count FROM analytics_payments_daily ORDER BY report_day DESC;"

docker compose exec postgres-analytics psql -U analytics -d beauty_health_analytics -c "
  SELECT report_day, checkout_start_count FROM analytics_funnel_daily ORDER BY report_day DESC;"
```

## 4) Read API (direktan poziv ka analytics-service)

```bash
curl -sf -H 'X-API-Key: dev-analytics-api-key' \
  http://localhost:8081/api/v1/reports/kpi-summary | jq .

curl -sf -H 'X-API-Key: dev-analytics-api-key' \
  http://localhost:8081/api/v1/reports/payments | jq .

curl -sf -H 'X-API-Key: dev-analytics-api-key' \
  http://localhost:8081/api/v1/reports/funnel | jq .
```

Bez ključa:

```bash
curl -i http://localhost:8081/api/v1/reports/kpi-summary
# HTTP/1.1 401
```

## 5) Moderator proxy (server-to-server)

API ključ **nikad** ne sme da napusti backend — moderator UI uvek ide preko `backend → analytics-service`.

```bash
# 1) Moderator login na backend-u
TOKEN=$(curl -sf -X POST -H 'Content-Type: application/json' \
  -d '{"email":"moderator@local.test","password":"ModeratorLocal1!"}' \
  http://localhost:8080/api/v1/auth/login | jq -r .accessToken)

# 2) Backend proxy:
curl -sf -H "Authorization: Bearer ${TOKEN}" \
  http://localhost:8080/api/v1/admin/analytics/kpi-summary | jq .
```

## 6) Praćenje jednog konkretnog `eventId` kroz pipeline

```bash
EID="aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"

# 1) Da li je upisan u backend outbox?
docker compose exec postgres psql -U beauty_health -d beauty_health -c \
  "SELECT id, event_type, status, published_at, error_message
   FROM analytics_outbox WHERE event_id = '${EID}';"

# 2) Da li je consumer obradio (raw tabela)?
docker compose exec postgres-analytics psql -U analytics -d beauty_health_analytics -c \
  "SELECT event_type, occurred_at, ingested_at
   FROM analytics_events_raw WHERE event_id = '${EID}';"
```

Pravilo:

- Ako je u `analytics_outbox.status = PUBLISHED` **ali ga nema** u `analytics_events_raw` → problem je između Kafke i consumer-a (proveri consumer group offset, kafka log).
- Ako je `PENDING` duže od ~10s → consumer publisher ne radi (provera: `docker compose logs backend | rg "analytics"`).
- Ako stiže do raw ali agregat nije narastao → event type ne mapira na agregat (vidi `event-types-v1.md` tabelu).

## 7) Tipičan log za jedan checkout

Backend log (Spring):

```
INFO  c.b.o.s.OrderService : created order id=42
INFO  c.b.o.a.PaymentWebhookController : Webhook processed: paymentRef=... status=AUTHORIZED → orderStatus=CONFIRMED
```

Backend `analytics_outbox` rows:

```
1 | checkout_started   | PUBLISHED | 2026-05-24 14:30:00
2 | order_created      | PUBLISHED | 2026-05-24 14:30:05
3 | payment_authorized | PUBLISHED | 2026-05-24 14:30:11
```

Analytics-service log:

```
KafkaListenerEndpointContainer ... received message ...
```

Analytics-service `analytics_kpi_daily`:

```
report_day | order_count | revenue_total
-----------+-------------+---------------
2026-05-24 |      1      |    4599.00
```

## 8) Kako simulirati Kafka outage (failure mod iz Ticket 6)

```bash
docker compose stop kafka

# Pokreni neku business akciju (npr. checkout). Backend response je 201.
# U outbox-u se pojavi PENDING red sa error_message="...".

docker compose start kafka
# Sledeći scheduler ciklus (5s default) prebaci red u PUBLISHED.
```
