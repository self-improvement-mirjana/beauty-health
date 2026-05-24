# Analytics test plan (v1)

## Scope

1. Contract validation (envelope schema)
2. Backend outbox producer
3. Storefront ingest
4. Kafka consumer + aggregates (analytics-service)
5. Moderator proxy read path
6. Failure modes

## A) Contract tests

| Scenario | Expected |
|----------|----------|
| Valid v1 envelope | Accepted |
| Missing `eventId` | Rejected (HTTP 400 on batch item) |
| Wrong `schemaVersion` | Rejected |
| Unknown `eventType` on ingest | Rejected, other events in batch still processed |
| PII in payload | Rejected |

Automated: `AnalyticsIngestServiceTest`, `AnalyticsIngestControllerWebMvcTest`

## B) Integration (producer → outbox)

| Scenario | Expected |
|----------|----------|
| `CartService.addItem` | Row in `analytics_outbox` with `cart_item_added` |
| `OrderService.createFromCart` | `checkout_started` + `order_created` rows |
| Payment webhook AUTHORIZED | `payment_authorized` row |
| Kafka disabled (tests) | Business transaction succeeds; outbox stays PENDING |

Automated: backend `./gradlew test`

## C) Consumer + aggregates

| Scenario | Expected |
|----------|----------|
| First `order_created` | Raw row + KPI increment |
| Duplicate `eventId` | Raw dedup; aggregates unchanged |

Automated: `AnalyticsEventProcessingServiceTest`

## D) E2E manual checklist

1. Start postgres + kafka + backend + analytics-service
2. Storefront: add to cart → checkout → order (COD)
3. Wait outbox publisher cycle (~5s)
4. Moderator dashboard: KPI orders +1, funnel checkout +1

## E) Failure scenarios

See `failure-playbook.md`.
