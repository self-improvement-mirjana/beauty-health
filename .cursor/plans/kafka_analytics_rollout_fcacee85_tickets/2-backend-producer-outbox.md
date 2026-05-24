# Ticket 2: Backend producer + outbox (Spring Boot)

## Cilj

Uvesti pouzdano emitovanje analytics event-a iz backend-a preko Outbox pattern-a i Kafka producer-a.

## Kljucne putanje za izmene

- `backend/build.gradle`
- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/application-local.yml`
- `backend/src/main/resources/application-prod.yml`
- `backend/src/main/java/com/beautyhealth/cart/service/CartService.java`
- `backend/src/main/java/com/beautyhealth/order/service/OrderService.java`
- `backend/src/main/java/com/beautyhealth/order/api/PaymentWebhookController.java`

Novi package predlog:

- `backend/src/main/java/com/beautyhealth/analytics/...`

## Obavezni novi elementi

1. Kafka dependency u `build.gradle`.
2. Konfiguracija:
   - bootstrap servers
   - topic name
   - producer acks/retries
3. Outbox entitet + repo:
   - tabela: `analytics_outbox`
   - kolone: `id`, `event_id`, `event_type`, `topic`, `payload_json`, `status`, `created_at`, `published_at`, `error_message`
4. Servis za outbox upis:
   - `AnalyticsOutboxService`
5. Scheduler/publisher:
   - cita `PENDING`,
   - salje u Kafka,
   - oznaci `PUBLISHED` ili `FAILED`.
6. Hookovi za event upis u:
   - `CartService` (add/update/delete)
   - `OrderService` (checkout_started, order_created)
   - `PaymentWebhookController` (payment_authorized/failed/expired)

## Implementacioni guideline (strogo)

1. Prvo napravi data modele i enum-e (`OutboxStatus`).
2. Zatim napravi upis event-a u outbox unutar iste transakcije gde nastaje business promena.
3. Tek onda napravi Kafka publisher scheduler.
4. Scheduler mora biti idempotentan:
   - ne sme duplo da objavi vec `PUBLISHED` dogadjaj.
5. Pri gresci:
   - sacuvaj kratku poruku greske u `error_message`,
   - ostavi status `FAILED` ili vrati u `PENDING` po jasno definisanom pravilu.

## Minimalna bezbednost i privatnost

- U payload ne upisivati PII.
- Za user context koristi `userId` ili `null`.
- Za goste koristi `sessionId`/guest token hash (ne raw token).

## Acceptance kriterijumi

- Backend se build-uje.
- Outbox tabela postoji (Liquibase changelog).
- Kreiranje korpe/order/payment status update upisuju event u outbox.
- Publisher salje event na Kafka topic i menja status u `PUBLISHED`.
- Ako Kafka nije dostupna, sistem ne puca glavnu poslovnu transakciju.

## Komande za proveru

- `./gradlew test`
- `./gradlew bootRun` (lokalno)
- Opciono: manual provera outbox redova u bazi.

## Ne raditi u ovom ticketu

- Ne praviti analytics-service.
- Ne menjati moderator UI.
