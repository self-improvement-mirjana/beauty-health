# Referentni ER model (baza) — beauty-health

Ovaj dijagram je **ciljna šema** za Liquibase changeset-e kroz backend tikete (B01–B11). Atributi entiteta dopunjavaju se u tiketima gde se entitet uvodi; ovde su odnosi i (gde je poznato iz izvora) ključna polja.

```mermaid
erDiagram
  USER ||--o{ ORDER : places
  USER ||--o{ REVIEW : writes
  USER ||--o{ REMEMBER_ME_TOKEN : has

  ORDER ||--|{ ORDER_ITEM : contains
  ORDER ||--o{ PAYMENT_TRANSACTION : paid_by
  ORDER ||--o{ SHIPMENT : ships_to
  ORDER ||--o{ CUSTOMER_ADDRESS : ships_to

  PRODUCT ||--o{ PRODUCT_VARIANT : has_variants
  PRODUCT ||--o{ REVIEW : receives
  PRODUCT ||--o{ PRODUCT_OPTION : offers_option
  PRODUCT_OPTION ||--o{ PRODUCT_OPTION_VALUE : values
  PRODUCT_VARIANT ||--o{ PRODUCT_VARIANT_OPTION : chosen_options

  PRODUCT_VARIANT ||--o{ INVENTORY : stocks
  STORE_LOCATION ||--o{ INVENTORY : can_supply

  BRAND ||--o{ PRODUCT : branded
  PRODUCT ||--o{ PRODUCT_CATEGORY : categorized
  CATEGORY ||--o{ PRODUCT_CATEGORY : categorizes
  CATEGORY o|--o{ CATEGORY : parent_of

  CART ||--o{ CART_ITEM : holds
  PRODUCT_VARIANT ||--o{ CART_ITEM : item_ref

  ORDER ||--o{ ORDER_DISCOUNT : applied_discounts
  COUPON ||--o{ ORDER_DISCOUNT : is_a_coupon

  CMS_PAGE ||--o{ CMS_PAGE_CATEGORY : grouped
  BLOG_POST ||--o{ CMS_PAGE_CATEGORY : blog_grouped

  CATEGORY {
    BIGINT id PK
    VARCHAR name
    VARCHAR slug UK
    TEXT description
    BIGINT parent_category_id FK
    INT sort_order
    BOOLEAN is_active
    TIMESTAMP created_at
    TIMESTAMP updated_at
  }

  PRODUCT_CATEGORY {
    BIGINT product_id FK
    BIGINT category_id FK
  }
```

## Napomene za agenta

- Imena tabela u bazi: konvencija `snake_case` (npr. `product_variant`, `cart_item`).
- `STORE_LOCATION` u modelu = fizička lokacija zalihe; **lokacije prodavnica** za CMS mogu biti odvojena tabela ili deo `CMS_PAGE` — uskladiti sa B09/M05.
- `ORDER_DISCOUNT` / `COUPON`: proširiti u B07 kada proizvod definiše kupone; do tada stub ili izostaviti.
- Svaki backend tiket koji dodaje tabele mora imati **Liquibase changeset** idempotentan po verziji (`changeset id="..." author="..."`).
