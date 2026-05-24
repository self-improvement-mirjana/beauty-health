# API money format (B02)

Svi javni JSON odgovori koji nose cenu ili iznos koriste **isti** oblik:

```json
{
  "amount": "3600.00",
  "currency": "RSD"
}
```

## Pravila

- **`amount`**: string koji predstavlja decimalni broj sa **tačno dve** decimale, bez separatora hiljada (engl. *plain string*), npr. `"19.99"`, `"3600.00"`. Zaokruživanje pri konverziji iz `BigDecimal` ili sličnog tipa: **HALF_UP** na dve decimale, zatim `toPlainString()`.
- **`currency`**: ISO 4217 kod valute. U verziji **v1** sistema podržana je isključivo **`RSD`**.

Ovaj format izbegava probleme sa binarnim `double`/`float` u JSON-u i čini iznos eksplicitnim za front (posebno za prikaz i zaokruživanje).

## Implementacija u kodu

Java record: `com.beautyhealth.common.money.MoneyResponse` (pogledaj `rsd(BigDecimal)` fabriku).

## OpenAPI / Swagger

- Šema `MoneyResponse` je uključena u globalne OpenAPI komponente.
- Primer odgovora: `GET /api/v1/catalog/money-format-example` (lokalno uz profil `local` i uključen Swagger).
