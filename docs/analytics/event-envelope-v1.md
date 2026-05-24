# Analytics event envelope (v1)

Jedinstveni JSON format za sve analytics događaje u sistemu. Proizvođači (storefront, backend) i potrošači (analytics-service) moraju koristiti isti envelope.

## Polja

| Polje | Tip | Obavezno | Opis |
|-------|-----|----------|------|
| `eventId` | UUID string | da | Jedinstveni identifikator događaja (idempotencija). |
| `eventType` | string | da | Tip događaja — vidi `event-types-v1.md`. |
| `occurredAt` | ISO-8601 UTC | da | Kada se događaj desio (npr. `2026-05-24T14:30:00Z`). |
| `source` | string | da | `storefront` ili `backend`. |
| `actorType` | string | da | `guest`, `user` ili `system`. |
| `actorId` | string \| null | ne | ID korisnika (Long kao string) kada je `actorType=user`. |
| `sessionId` | string \| null | ne | Anonimni session hash (npr. guest cart token hash). |
| `correlationId` | string \| null | ne | Povezuje događaje u istom toku (npr. `orderId`). |
| `schemaVersion` | string | da | Fiksno `v1` u ovoj verziji ugovora. |
| `payload` | object | da | Business podaci specifični za `eventType`. |

## Pravila validacije

- **Bez PII** — zabranjeno: email, puno ime, telefon, adresa, IP adresa.
- `payload` sme da sadrži samo tehničke poslovne podatke: `orderId`, `cartId`, `variantId`, `amount`, `currency`, `paymentMethod`, `paymentStatus`, `path`, `productSlug`, itd.
- `schemaVersion` mora biti tačno `v1`; druga vrednost se odbija.
- `eventId` mora biti validan UUID; duplikat se tretira idempotentno na consumer strani.

## Primer envelope-a

```json
{
  "eventId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "eventType": "order_created",
  "occurredAt": "2026-05-24T14:30:00Z",
  "source": "backend",
  "actorType": "user",
  "actorId": "42",
  "sessionId": null,
  "correlationId": "1001",
  "schemaVersion": "v1",
  "payload": {
    "orderId": 1001,
    "amount": 4599.00,
    "currency": "RSD",
    "paymentMethod": "CARD"
  }
}
```
