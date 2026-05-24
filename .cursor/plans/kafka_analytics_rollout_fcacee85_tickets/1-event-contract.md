# Ticket 1: Event contract i naming standard

## Cilj

Definisi jedinstven format analytics event-a i spisak inicijalnih event tipova. Ovo je ugovor koji koriste i producer i consumer.

## Obavezni output artefakti

Napraviti sledece fajlove:

- `docs/analytics/event-envelope-v1.md`
- `docs/analytics/event-types-v1.md`
- `docs/analytics/topic-conventions.md`
- `docs/analytics/sample-events-v1.json`

## Koraci (redosled je obavezan)

1. Napisi event envelope polja:
   - `eventId` (UUID)
   - `eventType` (string)
   - `occurredAt` (ISO-8601 UTC)
   - `source` (`storefront` ili `backend`)
   - `actorType` (`guest`, `user`, `system`)
   - `actorId` (nullable)
   - `sessionId` (nullable)
   - `correlationId` (nullable)
   - `schemaVersion` (npr. `v1`)
   - `payload` (objekat)
2. Definisi event tipove:
   - `cart_item_added`
   - `cart_item_updated`
   - `cart_item_removed`
   - `checkout_started`
   - `order_created`
   - `payment_authorized`
   - `payment_failed`
   - `payment_expired`
3. Definisi topic standard:
   - glavni topic: `bh.analytics.events.v1`
   - optional DLT: `bh.analytics.events.v1.dlt`
4. U `sample-events-v1.json` dodaj po 1 primer za svaki event type.
5. U dokumentaciji jasno oznaci koja polja su obavezna, a koja optional.

## Pravila validacije

- Bez PII (nema email, puno ime, telefon, adresa).
- `payload` sme da sadrzi samo business tehnicke podatke:
  - `orderId`, `cartId`, `variantId`, `amount`, `currency`, `paymentMethod`, `paymentStatus`, slicno.
- `schemaVersion` mora biti fiksno `v1` u ovom ticketu.

## Acceptance kriterijumi

- Sva 4 fajla postoje na tacnim putanjama.
- Primeri u `sample-events-v1.json` su validan JSON.
- Svaki event type ima bar jedan primer.
- Topic i verzionisanje su jasno dokumentovani.

## Ne raditi u ovom ticketu

- Ne dodavati kod u backend/frontend.
- Ne uvoditi Kafka biblioteku.
- Ne praviti DB tabele.
