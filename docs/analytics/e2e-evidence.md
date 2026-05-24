# Analytics end-to-end evidence

Generisano: 2026-05-24T15:06:10Z
Skripta: `backend/scripts/demo-analytics-flow.sh`

Ovaj dokument je auto-generisan trag jednog izvršenja end-to-end smoke-a.
Svaki korak prikazuje URL/komandu i isečak odgovora.

## 1) Sanity check

```
backend          200
analytics-service 401 (without API key, expecting 401)
analytics-service 200 (with API key)
```

Početni agregati (pre flow-a):

```json
kpi-summary: {"orderCount":3,"revenueTotal":5970.00}
payments:    {"successCount":0,"failureCount":0,"successRatePercent":0.00}
funnel:      {"checkoutStartCount":3,"orderCreatedCount":3}
```

## 2) Storefront ingest -> backend outbox

Poslata 3 event-a sa eventId: `5252faa7-448c-46f7-82a1-e197698b1614`, `3328d3ca-afc3-4f80-a5d8-0ebae5ddcb31`, `75e5f975-7b0d-4070-8903-9e145b1fff13`.

```json
{
  "acceptedCount": 3,
  "rejectedCount": 0,
  "rejectedEventIds": []
}
```

## 3) Outbox row-ovi (backend Postgres, tabela `analytics_outbox`)

```
5252faa7-448c-46f7-82a1-e197698b1614|page_view|PENDING
3328d3ca-afc3-4f80-a5d8-0ebae5ddcb31|product_view|PENDING
75e5f975-7b0d-4070-8903-9e145b1fff13|add_to_cart_click|PENDING
```

## 4) Business flow

- Kupac: `analytics-1779635170@example.local`
- variantId: `1662`
- orderId: `4`
- paymentMethod: `COD`

Backend hookovi emituju u outbox: `cart_item_added`, `checkout_started`, `order_created`.

## 3a) Outbox row-ovi posle 25s (status nakon scheduler-a)

```
5252faa7-448c-46f7-82a1-e197698b1614|page_view|PUBLISHED|2026-05-24 15:06:12.380808
3328d3ca-afc3-4f80-a5d8-0ebae5ddcb31|product_view|PUBLISHED|2026-05-24 15:06:12.382919
75e5f975-7b0d-4070-8903-9e145b1fff13|add_to_cart_click|PUBLISHED|2026-05-24 15:06:12.384791
```

## 5) Kafka topic `bh.analytics.events.v1`

Ukupno offset-a (zbir po particijama): **27**

Sample (prve 3 poruke):

```json
{"eventId":"6be414e0-e1e6-48fb-9355-944b018328e6","eventType":"page_view","occurredAt":"2026-05-24T14:57:13Z","source":"storefront","actorType":"guest","sessionId":"smoke-sess","schemaVersion":"v1","payload":{"path":"/shop"}}
{"eventId":"1244b6f0-b42d-401e-bb20-8bbb081a3b6d","eventType":"product_view","occurredAt":"2026-05-24T14:57:13Z","source":"storefront","actorType":"guest","sessionId":"smoke-sess","schemaVersion":"v1","payload":{"productSlug":"product-001"}}
{"eventId":"770c44c6-1c17-4d59-b904-a3f6e6fdb1d5","eventType":"add_to_cart_click","occurredAt":"2026-05-24T14:57:13Z","source":"storefront","actorType":"guest","sessionId":"smoke-sess","schemaVersion":"v1","payload":{"variantId":1,"productSlug":"product-001"}}
```

## 6) analytics-service: `analytics_events_raw`

Ukupno raw event-a u tabeli: **27**

Naša tri storefront event-a:

```
5252faa7-448c-46f7-82a1-e197698b1614|page_view
3328d3ca-afc3-4f80-a5d8-0ebae5ddcb31|product_view
75e5f975-7b0d-4070-8903-9e145b1fff13|add_to_cart_click
```

## 7) Read API (analytics-service, X-API-Key)

Pre flow-a / posle flow-a:

```json
kpi-summary BEFORE: {"orderCount":3,"revenueTotal":5970.00}
kpi-summary AFTER:  {"orderCount":4,"revenueTotal":7960.00}
payments    BEFORE: {"successCount":0,"failureCount":0,"successRatePercent":0.00}
payments    AFTER:  {"successCount":0,"failureCount":0,"successRatePercent":0.00}
funnel      BEFORE: {"checkoutStartCount":3,"orderCreatedCount":3}
funnel      AFTER:  {"checkoutStartCount":4,"orderCreatedCount":4}
```

Delta:

- `order_count` +1
- `checkout_start_count` +1

## 8) Moderator proxy: `GET /api/v1/admin/analytics/kpi-summary`

```json
{
  "orderCount": 4,
  "revenueTotal": 7960.00
}
```

## Zaključak

- Storefront ingest prihvatio 3/3 event-a.
- Outbox sadrži redove za 3 ingest event-a + 3 backend event-a (`cart_item_added`, `checkout_started`, `order_created`).
- Kafka topic `bh.analytics.events.v1` ima 27 ukupnih offset-a.
- `analytics_events_raw` ima 27 redova.
- KPI order count narastao za **1**, funnel checkout_start za **1**.

Komande za ručnu proveru su u `docs/analytics/observability.md`.
