# Ticket 5: Integracija analytics reporta u moderator tok

## Cilj

Prikazati analytics metrike u moderator panelu bez direktnog expose-a analytics-service endpoint-a browser-u.

## Pattern koji mora da se prati

- Moderator UI -> postojeci backend (`/api/v1/admin/...`)
- Backend server-to-server -> analytics-service (sa `X-API-Key`)

## Kljucne putanje za izmene

- `backend/src/main/java/com/beautyhealth/moderation/...` (novi controller/service/dto)
- `moderator/src/features/api/baseApi.ts`
- `moderator/src/features/api/...` (novi analytics endpoints)
- `moderator/src/pages/DashboardPage.tsx` (ili nova analytics dashboard stranica)

## Obavezni novi elementi

1. Backend config properties za analytics-service URL i API key.
2. Backend HTTP client prema analytics-service.
3. Admin endpoint-i:
   - `GET /api/v1/admin/analytics/kpi-summary`
   - `GET /api/v1/admin/analytics/payments`
   - `GET /api/v1/admin/analytics/funnel`
4. Moderator frontend query hook-ovi za navedene endpoint-e.
5. Dashboard prikaz:
   - KPI kartice (orders, revenue, payment success rate)
   - payment breakdown
   - osnovni funnel

## Implementacioni guideline

1. Prvo backend proxy/agregation endpoint-i.
2. Potom frontend API layer.
3. Na kraju UI prikaz i loading/error state.
4. Ako analytics-service vrati gresku:
   - backend vraca jasan 502/503 sa porukom,
   - frontend prikazuje fallback poruku.

## Security i granice

- `admin/analytics/*` endpoint-i moraju ostati moderator-only.
- API key nikad ne sme ici u browser.
- API key se drzi samo u backend konfiguraciji.

## Acceptance kriterijumi

- Moderator ulogovan kao MODERATOR vidi analytics sekciju.
- Podaci se ucitavaju kroz backend endpoint-e.
- Kada analytics-service nije dostupan, UI prikazuje graceful error.

## Komande za proveru

- `cd backend && ./gradlew test`
- `cd moderator && npm test`
- `cd moderator && npm run build`

## Ne raditi u ovom ticketu

- Ne menjati event schema.
- Ne menjati consumer logiku osim ako je bas neophodno za kompatibilnost DTO-a.
