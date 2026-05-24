# Ticket 3: Storefront telemetry + backend ingest endpoint

## Cilj

Dodati self-hosted frontend telemetry koji salje UI event-e backend-u na `/api/v1/analytics/events`.

## Kljucne putanje za izmene

- `storefront/src/features/api/baseApi.ts`
- `storefront/src/...` (novi analytics client modul)
- `backend/src/main/java/com/beautyhealth/...` (novi analytics ingest controller + DTO + service)
- `backend/src/main/java/com/beautyhealth/config/SecurityConfiguration.java` (ako treba `permitAll` za ingest)

## Obavezni novi elementi

1. Frontend analytics helper:
   - `track(eventType, payload)`
   - `trackPageView(path)`
   - queue + periodic flush
2. Retry pravilo:
   - ako slanje fail-uje, cuvaj u memoriji i probaj opet.
3. Backend endpoint:
   - `POST /api/v1/analytics/events`
   - prima listu event-a (bulk)
   - validira shape i schemaVersion
4. Backend mapira primljene event-e u isti outbox tok iz Ticketa 2.

## Obavezni UI event-i (minimum)

- `page_view`
- `product_view`
- `add_to_cart_click`
- `checkout_open`

## Implementacioni guideline

1. Napravi types za frontend telemetry event.
2. Integrisi `trackPageView` na promenu rute.
3. Integrisi `track` na kljucne CTA akcije (PDP add-to-cart i checkout otvaranje).
4. Backend endpoint treba da vrati:
   - broj prihvacenih event-a
   - broj odbijenih event-a
5. Ako je event nevalidan, ne rušiti ceo batch:
   - obradi validne event-e,
   - prijavi nevalidne u response detaljima.

## Privacy i quality gate

- Zabranjeno slanje email/telefon/adrese.
- `userId` samo ako je korisnik ulogovan.
- Za guest koristiti anonimni identifikator/session.

## Acceptance kriterijumi

- Frontend event-i se salju na backend endpoint.
- Backend endpoint radi za vise event-a u jednom zahtevu.
- Validni event-i stizu do outbox-a.
- Nevalidni event-i ne blokiraju validne.

## Komande za proveru

- `cd storefront && npm test`
- `cd storefront && npm run build`
- `cd backend && ./gradlew test`

## Ne raditi u ovom ticketu

- Ne uvoditi analytics read API.
- Ne menjati moderator dashboard.
