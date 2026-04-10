# B10 — Slice `moderation`: CRUD kataloga i sadržaja (zaštićeno)

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 1.3

## Cilj

**Moderatorski REST** za upravljanje proizvodima, varijantama, cenama, zalihama, brendovima, kategorijama i statičkim sadržajem koji B09 izlaže javno.

## Opseg

- Sve rute pod npr. `/api/v1/admin/...` ili `/api/v1/mod/...` — konzistentno; zaštita ulogom **MODERATOR** (B03).
- Operacije: kreiranje/izmena/brisanje (soft delete opciono) za entitete iz B04 i B09.
- Validacija: ne dozvoliti negativne cene; zalihe ceo broj ≥ 0.
- Audit log **opciono** (ko je poslednji menjao cenu).

## Kriterijumi prihvatanja

- [ ] Korisnik bez uloge moderatorske ne može pozvati ni jednu write operaciju (403).
- [ ] Promena cene na proizvodu se vidi na javnom katalogu u narednom GET (bez ručnog keširanja osim ako je eksplicitno uvedeno).
- [ ] OpenAPI označava ove rute posebnim tagom `moderation`.

## Zavisnosti

- B03, B04, B09, B02

## Za juniore

- Razdvojiti DTO za moderaciju od javnog DTO ako treba više internih polja — ne širiti javni ugovor.

## Plan za AI agenta

1. **Baza**: koristi iste tabele kao B04/B09 — **bez duplog šema**; moderacija samo dodaje write operacije.
2. **Security**: sve rute ispod npr. `/api/v1/admin/**` zahtevaju `hasRole('MODERATOR')`; u OpenAPI tag `moderation`.
3. **Katalog API (write)**: CRUD za `brand`, `category`, `product`, `product_variant`, opcije, `inventory` količine; koristiti transakcije pri kreiranju proizvoda + varijanti + opcija odjednom.
4. **Sadržaj API (write)**: CRUD za `cms_page`, `retail_location`, `blog_post` (ako postoje).
5. **Validacija**: `@Valid` na DTO; cena ≥ 0; zaliha ≥ 0; slug jedinstven.
6. **Audit (opciono)**: tabela `audit_log` ili Envers — ako je van opsega, dokumentovati “future”.
7. **Testovi**: `@WebMvcTest` sa `@WithMockUser(roles = "MODERATOR")` i bez uloge (403); integracioni test kreiranja proizvoda.
8. **Konvencija**: admin DTO imena `AdminProductRequest`, javni ostaju nepromenjeni.
