Ovo je sada mnogo bolje
Ali ako bi hteo da ovo dam kao instrukcije LLMu nije dovoljno
Evo ga Mermaid ER dijagram baze da bi mogli da napravi DETALJNE INSTRUKCIOJE koje su dovoljno za AI agenta da koristi kao PLAN za rad
Za svaki ticket, dodaj novu sekciju koja bi predstavljala plan za AI agenta da implementira

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

---

**Repo:** isti ER je prenet u [`junior-tickets/DATA_MODEL.md`](junior-tickets/DATA_MODEL.md). U svakom tiketu (`backend/`, `storefront/`, `moderator/`) dodata je sekcija **„Plan za AI agenta“** sa koracima implementacije usklađenim sa ovim modelom.
