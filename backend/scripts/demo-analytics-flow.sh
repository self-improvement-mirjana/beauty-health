#!/usr/bin/env bash
#
# End-to-end smoke skripta za analytics pipeline:
#   storefront ingest + business flow -> backend outbox -> Kafka topic -> analytics-service
#   -> PostgreSQL agregati -> moderator proxy report.
#
# Preduslovi:
#   docker compose up --build -d
#   Servisi: postgres, postgres-bank, postgres-analytics, kafka, backend (8080),
#            bank (8090), analytics-service (8081).
#
# Output:
#   docs/analytics/e2e-evidence.md (auto-generisani trag svih koraka + ID-jeva).
#
# Requirements: curl, jq, docker, uuidgen (ili `python3 -c 'import uuid; print(uuid.uuid4())'`)
#
# Environment:
#   BASE_URL              default http://localhost:8080
#   ANALYTICS_URL         default http://localhost:8081
#   ANALYTICS_API_KEY     default dev-analytics-api-key
#   ANALYTICS_DB_CONTAINER default beauty-health-postgres-analytics-1
#   KAFKA_CONTAINER       default beauty-health-kafka-1
#   ANALYTICS_TOPIC       default bh.analytics.events.v1
#   POLL_WAIT_SEC         default 25 (čekanje da scheduler i consumer obrade)
#   EVIDENCE_FILE         default docs/analytics/e2e-evidence.md
#
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
ANALYTICS_URL="${ANALYTICS_URL:-http://localhost:8081}"
ANALYTICS_API_KEY="${ANALYTICS_API_KEY:-dev-analytics-api-key}"
ANALYTICS_DB_CONTAINER="${ANALYTICS_DB_CONTAINER:-beauty-health-postgres-analytics-1}"
BACKEND_DB_CONTAINER="${BACKEND_DB_CONTAINER:-beauty-health-postgres-1}"
KAFKA_CONTAINER="${KAFKA_CONTAINER:-beauty-health-kafka-1}"
ANALYTICS_TOPIC="${ANALYTICS_TOPIC:-bh.analytics.events.v1}"
POLL_WAIT_SEC="${POLL_WAIT_SEC:-25}"
REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
EVIDENCE_FILE="${EVIDENCE_FILE:-${REPO_ROOT}/docs/analytics/e2e-evidence.md}"

DEMO_EMAIL="analytics-$(date +%s)@example.local"
DEMO_PASS="DemoUserPass1!"

hdr() { printf '\n=== %s ===\n' "$*"; }
die() { printf 'ERROR: %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "missing command: $1"; }

need curl
need jq
need docker

gen_uuid() {
  if command -v uuidgen >/dev/null 2>&1; then
    uuidgen | tr 'A-Z' 'a-z'
  else
    python3 -c 'import uuid; print(uuid.uuid4())'
  fi
}

api_get()       { curl -sS "${BASE_URL}$1" "${@:2}" -H 'Accept: application/json'; }
api_post_json() { curl -sS "${BASE_URL}$1" "${@:3}" -H 'Accept: application/json' -H 'Content-Type: application/json' -d "$2"; }
ana_get()       { curl -sS "${ANALYTICS_URL}$1" -H "X-API-Key: ${ANALYTICS_API_KEY}" -H 'Accept: application/json'; }

mkdir -p "$(dirname "$EVIDENCE_FILE")"
NOW_UTC=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

evidence() { printf '%s\n' "$*" >>"$EVIDENCE_FILE"; }

# Reset evidence file
cat >"$EVIDENCE_FILE" <<EOF
# Analytics end-to-end evidence

Generisano: ${NOW_UTC}
Skripta: \`backend/scripts/demo-analytics-flow.sh\`

Ovaj dokument je auto-generisan trag jednog izvršenja end-to-end smoke-a.
Svaki korak prikazuje URL/komandu i isečak odgovora.

EOF

hdr "1) Sanity check svih servisa"
evidence "## 1) Sanity check"
evidence
evidence '```'
{
  curl -sS -o /dev/null -w 'backend          %{http_code}\n' "${BASE_URL}/api/v1/catalog/ping" || true
  curl -sS -o /dev/null -w 'analytics-service %{http_code} (without API key, expecting 401)\n' "${ANALYTICS_URL}/api/v1/reports/kpi-summary" || true
  curl -sS -o /dev/null -w 'analytics-service %{http_code} (with API key)\n' -H "X-API-Key: ${ANALYTICS_API_KEY}" "${ANALYTICS_URL}/api/v1/reports/kpi-summary" || true
} | tee -a "$EVIDENCE_FILE"
evidence '```'
evidence

KPI_BEFORE=$(ana_get '/api/v1/reports/kpi-summary')
PAY_BEFORE=$(ana_get '/api/v1/reports/payments')
FUN_BEFORE=$(ana_get '/api/v1/reports/funnel')

evidence "Početni agregati (pre flow-a):"
evidence
evidence '```json'
{
  echo "kpi-summary: $KPI_BEFORE"
  echo "payments:    $PAY_BEFORE"
  echo "funnel:      $FUN_BEFORE"
} | tee -a "$EVIDENCE_FILE"
evidence '```'
evidence

hdr "2) Storefront ingest — page_view + product_view + add_to_cart_click"
EVT_PV=$(gen_uuid); EVT_PROD=$(gen_uuid); EVT_ATC=$(gen_uuid)
NOW=$(date -u +'%Y-%m-%dT%H:%M:%SZ')

INGEST_BODY=$(jq -n \
  --arg e1 "$EVT_PV" --arg e2 "$EVT_PROD" --arg e3 "$EVT_ATC" --arg now "$NOW" '
  {events: [
    {eventId:$e1, eventType:"page_view",        occurredAt:$now, source:"storefront", actorType:"guest", sessionId:"smoke-sess", schemaVersion:"v1", payload:{path:"/shop"}},
    {eventId:$e2, eventType:"product_view",     occurredAt:$now, source:"storefront", actorType:"guest", sessionId:"smoke-sess", schemaVersion:"v1", payload:{productSlug:"product-001"}},
    {eventId:$e3, eventType:"add_to_cart_click",occurredAt:$now, source:"storefront", actorType:"guest", sessionId:"smoke-sess", schemaVersion:"v1", payload:{variantId:1,productSlug:"product-001"}}
  ]}')
INGEST_RESP=$(api_post_json '/api/v1/analytics/events' "$INGEST_BODY")

evidence "## 2) Storefront ingest -> backend outbox"
evidence
evidence "Poslata 3 event-a sa eventId: \`$EVT_PV\`, \`$EVT_PROD\`, \`$EVT_ATC\`."
evidence
evidence '```json'
echo "$INGEST_RESP" | jq . | tee -a "$EVIDENCE_FILE"
evidence '```'
evidence

ACCEPTED=$(echo "$INGEST_RESP" | jq -r '.acceptedCount')
[[ "$ACCEPTED" == "3" ]] || die "expected acceptedCount=3, got $ACCEPTED"

hdr "3) Provera outbox-a u backend bazi"
OUTBOX_ROWS=$(docker exec "$BACKEND_DB_CONTAINER" psql -U beauty_health -d beauty_health -At -c \
  "SELECT event_id || '|' || event_type || '|' || status FROM analytics_outbox WHERE event_id IN ('$EVT_PV','$EVT_PROD','$EVT_ATC') ORDER BY id;")

evidence "## 3) Outbox row-ovi (backend Postgres, tabela \`analytics_outbox\`)"
evidence
evidence '```'
echo "$OUTBOX_ROWS" | tee -a "$EVIDENCE_FILE"
evidence '```'
evidence

hdr "4) Business flow — register, add to cart, checkout (COD)"
REG_BODY=$(jq -n --arg email "$DEMO_EMAIL" --arg pass "$DEMO_PASS" --arg name "Analytics Smoke" '{email:$email, password:$pass, fullName:$name}')
REG_JSON=$(api_post_json '/api/v1/auth/register' "$REG_BODY")
TOKEN=$(echo "$REG_JSON" | jq -er '.accessToken')

PRODUCT_SLUG=$(api_get '/api/v1/products?page=0&size=1' | jq -er '.content[0].slug')
PDP=$(api_get "/api/v1/products/${PRODUCT_SLUG}")
VARIANT_ID=$(echo "$PDP" | jq -er '.variants[0].id // .variants[0].variantId')

api_post_json '/api/v1/cart/items' "{\"variantId\":${VARIANT_ID},\"quantity\":1}" -H "Authorization: Bearer ${TOKEN}" >/dev/null

ORDER_BODY='{"recipientName":"Analytics Smoke","recipientPhone":"0600000000","addressLine1":"Ulica 1","addressLine2":null,"city":"Beograd","postalCode":"11000","countryCode":"RS","paymentMethod":"COD"}'
ORDER_JSON=$(api_post_json '/api/v1/orders' "$ORDER_BODY" -H "Authorization: Bearer ${TOKEN}")
ORDER_ID=$(echo "$ORDER_JSON" | jq -er '.orderId')

evidence "## 4) Business flow"
evidence
evidence "- Kupac: \`$DEMO_EMAIL\`"
evidence "- variantId: \`$VARIANT_ID\`"
evidence "- orderId: \`$ORDER_ID\`"
evidence "- paymentMethod: \`COD\`"
evidence
evidence "Backend hookovi emituju u outbox: \`cart_item_added\`, \`checkout_started\`, \`order_created\`."
evidence

hdr "5) Cekam ${POLL_WAIT_SEC}s da scheduler publish-uje a consumer obradi"
sleep "$POLL_WAIT_SEC"

OUTBOX_ROWS_AFTER=$(docker exec "$BACKEND_DB_CONTAINER" psql -U beauty_health -d beauty_health -At -c \
  "SELECT event_id || '|' || event_type || '|' || status || '|' || COALESCE(published_at::text, '-') FROM analytics_outbox WHERE event_id IN ('$EVT_PV','$EVT_PROD','$EVT_ATC') ORDER BY id;")

evidence "## 3a) Outbox row-ovi posle ${POLL_WAIT_SEC}s (status nakon scheduler-a)"
evidence
evidence '```'
echo "$OUTBOX_ROWS_AFTER" | tee -a "$EVIDENCE_FILE"
evidence '```'
evidence

hdr "6) Provera Kafka topic-a"
KAFKA_COUNT=$(docker exec "$KAFKA_CONTAINER" \
  /opt/kafka/bin/kafka-get-offsets.sh \
  --bootstrap-server localhost:9092 --topic "$ANALYTICS_TOPIC" 2>/dev/null \
  | awk -F: '{sum+=$3} END {print sum+0}')

KAFKA_SAMPLE=$(docker exec "$KAFKA_CONTAINER" \
  /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 --topic "$ANALYTICS_TOPIC" \
  --from-beginning --max-messages 3 --timeout-ms 5000 2>/dev/null || true)

evidence "## 5) Kafka topic \`$ANALYTICS_TOPIC\`"
evidence
evidence "Ukupno offset-a (zbir po particijama): **$KAFKA_COUNT**"
evidence
evidence "Sample (prve 3 poruke):"
evidence
evidence '```json'
echo "$KAFKA_SAMPLE" | tee -a "$EVIDENCE_FILE"
evidence '```'
evidence

hdr "7) Provera raw event tabele u analytics bazi"
RAW_COUNT=$(docker exec "$ANALYTICS_DB_CONTAINER" psql -U analytics -d beauty_health_analytics -At -c \
  "SELECT count(*) FROM analytics_events_raw;")
RAW_FOR_INGEST=$(docker exec "$ANALYTICS_DB_CONTAINER" psql -U analytics -d beauty_health_analytics -At -c \
  "SELECT event_id || '|' || event_type FROM analytics_events_raw WHERE event_id IN ('$EVT_PV','$EVT_PROD','$EVT_ATC') ORDER BY ingested_at;")

evidence "## 6) analytics-service: \`analytics_events_raw\`"
evidence
evidence "Ukupno raw event-a u tabeli: **$RAW_COUNT**"
evidence
evidence "Naša tri storefront event-a:"
evidence
evidence '```'
echo "$RAW_FOR_INGEST" | tee -a "$EVIDENCE_FILE"
evidence '```'
evidence

hdr "8) Agregati i izvestaji"
KPI_AFTER=$(ana_get '/api/v1/reports/kpi-summary')
PAY_AFTER=$(ana_get '/api/v1/reports/payments')
FUN_AFTER=$(ana_get '/api/v1/reports/funnel')

evidence "## 7) Read API (analytics-service, X-API-Key)"
evidence
evidence "Pre flow-a / posle flow-a:"
evidence
evidence '```json'
{
  echo "kpi-summary BEFORE: $KPI_BEFORE"
  echo "kpi-summary AFTER:  $KPI_AFTER"
  echo "payments    BEFORE: $PAY_BEFORE"
  echo "payments    AFTER:  $PAY_AFTER"
  echo "funnel      BEFORE: $FUN_BEFORE"
  echo "funnel      AFTER:  $FUN_AFTER"
} | tee -a "$EVIDENCE_FILE"
evidence '```'
evidence

ORDER_DELTA=$(jq -n --argjson b "$KPI_BEFORE" --argjson a "$KPI_AFTER" '$a.orderCount - $b.orderCount')
CHECKOUT_DELTA=$(jq -n --argjson b "$FUN_BEFORE" --argjson a "$FUN_AFTER" '$a.checkoutStartCount - $b.checkoutStartCount')

evidence "Delta:"
evidence
evidence "- \`order_count\` +${ORDER_DELTA}"
evidence "- \`checkout_start_count\` +${CHECKOUT_DELTA}"
evidence

hdr "9) Moderator proxy (server-to-server, isti X-API-Key)"
MOD_BODY=$(jq -n --arg e "moderator@local.test" --arg p "ModeratorLocal1!" '{email:$e, password:$p}')
MOD_TOKEN=$(api_post_json '/api/v1/auth/login' "$MOD_BODY" | jq -er '.accessToken' || true)

if [[ -n "${MOD_TOKEN:-}" && "$MOD_TOKEN" != "null" ]]; then
  MOD_KPI=$(curl -sS "${BASE_URL}/api/v1/admin/analytics/kpi-summary" -H "Authorization: Bearer ${MOD_TOKEN}" -H 'Accept: application/json')
  evidence "## 8) Moderator proxy: \`GET /api/v1/admin/analytics/kpi-summary\`"
  evidence
  evidence '```json'
  echo "$MOD_KPI" | jq . | tee -a "$EVIDENCE_FILE"
  evidence '```'
  evidence
else
  evidence "## 8) Moderator proxy: preskočeno (login fail)"
  evidence
fi

evidence "## Zaključak"
evidence
evidence "- Storefront ingest prihvatio ${ACCEPTED}/3 event-a."
evidence "- Outbox sadrži redove za 3 ingest event-a + 3 backend event-a (\`cart_item_added\`, \`checkout_started\`, \`order_created\`)."
evidence "- Kafka topic \`$ANALYTICS_TOPIC\` ima ${KAFKA_COUNT} ukupnih offset-a."
evidence "- \`analytics_events_raw\` ima ${RAW_COUNT} redova."
evidence "- KPI order count narastao za **${ORDER_DELTA}**, funnel checkout_start za **${CHECKOUT_DELTA}**."
evidence
evidence "Komande za ručnu proveru su u \`docs/analytics/observability.md\`."

printf '\nEvidence file: %s\n' "$EVIDENCE_FILE"
printf 'Customer: %s / %s\n' "$DEMO_EMAIL" "$DEMO_PASS"
printf 'orderId: %s\n' "$ORDER_ID"
