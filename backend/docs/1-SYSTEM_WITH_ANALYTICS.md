Evo Mermaid sequence dijagrama koji pokriva ceo tok kupovine + analitike, baš onako kako je dizajnirano u ovih 6 tiketa:

```mermaid
sequenceDiagram
    autonumber
    actor U as Korisnik (browser)
    participant SF as Storefront (React)
    participant FA as Frontend Analytics<br/>(track / queue)
    participant BE as Backend (Spring Boot)
    participant DB as PostgreSQL<br/>(orders + outbox)
    participant BC as Bank Client<br/>(payment gateway adapter)
    participant BANK as Banka (PSP)
    participant K as Kafka<br/>bh.analytics.events.v1
    participant AS as Analytics Service<br/>(consumer + read API)
    participant MOD as Moderator UI

    Note over U,FA: 1) Pregled i dodavanje u korpu (samo UI tracking)
    U->>SF: Klik "Add to cart" na PDP
    SF->>FA: track("add_to_cart_click", {variantId})
    FA-->>FA: queue + periodic flush
    FA->>BE: POST /api/v1/analytics/events (bulk)
    BE->>DB: insert u analytics_outbox (PENDING)
    BE-->>FA: 200 {accepted, rejected}

    Note over U,BE: 2) Checkout i kreiranje porudzbine
    U->>SF: Otvara checkout, potvrdjuje
    SF->>FA: track("checkout_open")
    FA->>BE: POST /api/v1/analytics/events
    BE->>DB: outbox <- checkout_started (PENDING)

    SF->>BE: POST /api/v1/orders (create order)
    BE->>DB: insert ORDER (status=PENDING_PAYMENT)
    BE->>DB: outbox <- order_created (PENDING, ista TX)
    BE-->>SF: 201 {orderId, paymentRedirectInfo}

    Note over SF,BANK: 3) Placanje preko banke
    SF->>BC: Inicira payment (orderId, amount)
    BC->>BANK: Authorize request
    BANK-->>BC: pending / 3DS challenge
    BC-->>SF: redirect / status
    U->>BANK: 3DS potvrda
    BANK-->>BC: AUTHORIZED (ili FAILED/EXPIRED)

    Note over BANK,BE: 4) Webhook nazad na backend
    BANK->>BE: POST /api/v1/payments/webhook<br/>(signed, idempotency key)
    BE->>DB: update ORDER (PAID / FAILED)
    BE->>DB: outbox <- payment_authorized<br/>(ili payment_failed / payment_expired)
    BE-->>BANK: 200 OK

    Note over BE,AS: 5) Outbox -> Kafka -> Analytics
    loop Scheduler (periodicno)
        BE->>DB: SELECT outbox WHERE status=PENDING
        BE->>K: produce(eventId, envelope v1)
        K-->>BE: ack
        BE->>DB: mark PUBLISHED (ili FAILED + error_message)
    end

    K->>AS: consume(envelope)
    AS->>AS: dedup po eventId (unique constraint)
    AS->>AS: persist analytics_events_raw
    AS->>AS: update agregati<br/>(kpi_daily, payments_daily, funnel_daily)

    Note over U,SF: 6) Korisnik vidi potvrdu
    SF->>BE: GET /api/v1/orders/{id}
    BE-->>SF: status = PAID
    SF->>FA: track("page_view", "/order/success")
    FA->>BE: POST /api/v1/analytics/events
    BE->>DB: outbox <- page_view (PENDING -> kasnije Kafka -> AS)

    Note over MOD,AS: 7) Moderator gleda izvestaje (server-to-server)
    MOD->>BE: GET /api/v1/admin/analytics/kpi-summary
    BE->>AS: GET /api/v1/reports/kpi-summary<br/>Header: X-API-Key
    AS-->>BE: agregati (orders, revenue, success rate)
    BE-->>MOD: KPI payload (bez API key-a)
```

Kako se mapira na tikete:

- Korak 1, 6 i `POST /api/v1/analytics/events` = Ticket 3 (storefront telemetry + ingest)
- Outbox upis u istoj transakciji + scheduler -> Kafka = Ticket 2 (backend producer + outbox)
- Konzumacija, dedup, agregati, `X-API-Key` read API = Ticket 4 (analytics service)
- Moderator -> backend -> analytics-service (browser ne vidi API key) = Ticket 5
- Format envelope-a (`eventId`, `eventType`, `schemaVersion=v1`, topic `bh.analytics.events.v1`) = Ticket 1
- Idempotencija webhooka, dedup `eventId`, Kafka outage = Ticket 6 (failure scenariji)

Par stvari koje su namerno tako nacrtane:

- Banka pravi `payment_authorized/failed/expired` event preko `PaymentWebhookController`, ne direktno frontend - to je single source of truth za plaćanje.
- Frontend telemetry i backend business event-i završavaju u **istom** `analytics_outbox` -> isti Kafka topic -> isti consumer, što je tačno ono što Ticket 3 traži ("Backend mapira primljene event-e u isti outbox tok iz Ticketa 2").
- Moderator nikad ne ide direktno na `analytics-service` (Ticket 5: "API key nikad ne sme ici u browser").