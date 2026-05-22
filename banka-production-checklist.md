## Da — banka je integrisana (edukativni mock)

Prema `BANKA-DISKUSIJA.MD` i kodu, implementiran je ceo tok koji ste tražili:

| Zahtev | Status |
|--------|--------|
| Mock banka + sertifikati (RSA/HMAC) | `bank/` modul, port 8090 |
| Virtuelne kartice + admin UI | `bank-admin/`, seed kartica `4242…` |
| Shop → banka → success/fail + `orderId` | Checkout CARD → redirect → hosted pay → return sa `orderId`, `ref`, `status` |
| Webhook ka shopu | Banka šalje na `http://localhost:8080/api/v1/payments/webhook` |
| E2E demo | `e2e/tests/card-payment-walkthrough.spec.ts`, `bank-walkthrough.spec.ts` |

Tok ukratko:

1. Shop kreira narudžbinu i zove banku (`externalOrderId` = ID narudžbine).
2. Korisnik ide na hosted stranicu (`/pay/{paymentRef}`).
3. Banka šalje potpisani webhook; shop ažurira `payment_transaction` i status narudžbine.
4. Redirect nazad na `/payment/return?orderId=…&ref=…&status=…`; storefront polluje `/orders/{id}/payment`.

---

## Pouzdana orkestracija? Delimično — dovoljno za edukaciju, ne za produkciju

### Šta radi solidno

**Order ID** — jasna veza shop ↔ banka:

```47:50:z:\CASOVI\MIRJANA-SPRING\beauty-health\backend\src\main\java\com\beautyhealth\order\service\BankClient.java
    public PaymentIntentResult createPaymentIntent(long orderId, BigDecimal amount, String currency) {
        try {
            String bodyJson = objectMapper.writeValueAsString(new CreatePaymentBody(
                    String.valueOf(orderId), amount, currency, null, null, 900));
```

Na shopu: jedna `payment_transaction` po narudžbini (`uk_payment_transaction_order`), lookup po `paymentRef` u webhooku.

**Idempotentnost webhooka (shop)** — dupli webhook ne menja već završeno plaćanje:

```61:63:z:\CASOVI\MIRJANA-SPRING\beauty-health\backend\src\main\java\com\beautyhealth\order\api\PaymentWebhookController.java
            if (payment.getStatus() == PaymentRecordStatus.COMPLETED || payment.getStatus() == PaymentRecordStatus.FAILED) {
                return Map.of("status", "already_processed");
            }
```

**Idempotentnost na hosted pay (banka)** — dupli submit kartice → `409 CONFLICT`.

**Retry webhooka (banka → shop)** — 3 pokušaja, eksponencijalni backoff:

```48:61:z:\CASOVI\MIRJANA-SPRING\beauty-health\bank\src\main\java\com\mockbank\webhook\WebhookSender.java
        int maxRetries = bankProperties.getWebhook().getMaxRetries();
        long delayMs = bankProperties.getWebhook().getInitialDelayMs();

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                sendWebhook(intent, merchant);
                ...
                    delayMs *= 2;
```

**Zaštita S2S API-ja (banka)** — timestamp tolerancija (~5 min), nonce cache (replay zaštita), RSA/HMAC potpis.

**Transakcija checkout-a** — ako banka padne pri kreiranju intenta, `@Transactional` na `createFromCart` vraća celu narudžbinu (nema „sirove“ narudžbine bez plaćanja u istom pozivu).

---

### Šta nije pouzdano / nedostaje

| Tema | Stanje |
|------|--------|
| **Idempotentno kreiranje payment intenta** | Svaki `POST /api/v1/payments` pravi **novi** `paymentRef` (UUID). Nema unique na `external_order_id` u banci. Ponovljen poziv = više intenta za isti order. |
| **Retry shop → banka** | `BankClient` nema retry; jedan `httpClient.send()`, greška → `RuntimeException`. |
| **Read/request timeout** | Samo `connectTimeout` (15s shop, 10s banka). **Nema** `HttpRequest.timeout()` — spor odgovor može da visi. |
| **Webhook replay na shopu** | Verifikuje potpis, ali **nema** nonce cache kao banka — teorijski replay istog payloada (u praksi manje rizično zbog `already_processed`). |
| **Orkestracija isteklog plaćanja** | Scheduler postavlja `EXPIRED`, ali **ne šalje** webhook shopu — narudžbina može ostati `NEW` / payment `PENDING`. |
| **Abandon flow** | Korisnik napusti plaćanje → order ostaje, nema automatskog cancel/reconcile. |
| **Ponovni checkout** | Nova narudžbina = novi `orderId` (nije idempotentno na nivou korisnika/korpe). |
| **Outbox / DLQ** | Webhook je `@Async` u memoriji; ako svi retry-i padnu, nema reda za kasnije slanje. |
| **Ključevi u Dockeru** | `APP_BANK_PRIVATE_KEY_PEM` prazan u `docker-compose.yml` — treba `demo-issue-cert.sh` pre CARD flow-a. |

---

## Zaključak

**Da, banka je integrisana** u smislu iz `BANKA-DISKUSIJA.MD`: redirect, `orderId`, potpis, webhook, virtuelne kartice, admin UI, Playwright.

**Ne, orkestracija nije „pouzdana“ u produkcijskom smislu** — ima dobre delove (potpis, nonce na banci, webhook idempotency po `paymentRef`, retry webhooka, rollback checkout-a), ali nedostaju:

- idempotentno `createPayment` po `externalOrderId`,
- retry + pun timeout na shop → banka,
- reconcile za EXPIRED/abandoned,
- outbox za webhook,
- jači end-to-end state machine (npr. saga).

Za edukativni projekat i demo (E2E) to je dovoljno i radi kada su ključevi i stack podignuti. Za pravu banku/PSP trebalo bi nadograditi gore navedeno.

Ako želite, mogu predložiti minimalan sledeći korak (npr. idempotent `createIntent` po `externalOrderId` + `HttpRequest.timeout` + webhook za `EXPIRED`).