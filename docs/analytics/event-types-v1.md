# Analytics event types (v1)

## Backend događaji (`source=backend`)

Emituju se iz Spring Boot backend-a preko outbox pattern-a.

| eventType | Kada nastaje | Obavezna polja u `payload` |
|-----------|--------------|----------------------------|
| `cart_item_added` | Dodavanje stavke u korpu | `cartId`, `variantId`, `quantity` |
| `cart_item_updated` | Promena količine stavke | `cartId`, `variantId`, `quantity` |
| `cart_item_removed` | Uklanjanje stavke iz korpe | `cartId`, `variantId` |
| `checkout_started` | Početak checkout-a (kreiranje porudžbine) | `cartId`, `lineCount` |
| `order_created` | Uspešno kreirana porudžbina | `orderId`, `amount`, `currency`, `paymentMethod` |
| `payment_authorized` | Bank webhook: AUTHORIZED | `orderId`, `amount`, `currency`, `paymentMethod`, `paymentStatus` |
| `payment_failed` | Bank webhook: DECLINED/FAILED | `orderId`, `paymentMethod`, `paymentStatus` |
| `payment_expired` | Bank webhook: EXPIRED | `orderId`, `paymentMethod`, `paymentStatus` |

## Storefront događaji (`source=storefront`)

Emituju se iz React storefront-a preko `POST /api/v1/analytics/events`.

| eventType | Kada nastaje | Obavezna polja u `payload` |
|-----------|--------------|----------------------------|
| `page_view` | Promena rute | `path` |
| `product_view` | Otvaranje PDP stranice | `productSlug` |
| `add_to_cart_click` | Klik „Dodaj u korpu“ | `variantId`, opciono `productSlug` |
| `checkout_open` | Otvaranje checkout stranice | opciono `cartId` |

## Agregaciona mapiranja (analytics-service)

| eventType | KPI / funnel / payments |
|-----------|-------------------------|
| `order_created` | +1 order count, +revenue |
| `payment_authorized` | +1 payment success |
| `payment_failed`, `payment_expired` | +1 payment failure |
| `checkout_started`, `checkout_open` | +1 funnel step checkout_start |
