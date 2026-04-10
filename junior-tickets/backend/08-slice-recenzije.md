# B08 — Slice `review`: recenzije proizvoda

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 5.4

## Cilj

Omogućiti slanje i prikaz **recenzija** za proizvod sa poljima iz specifikacije (ocena, tekst, ime, email, privola za čuvanje podataka na klijentu je čisto front; backend čuva samo ono što je dozvoljeno politikom privatnosti).

## Opseg

- Entitet `ProductReview` vezan za proizvod; email se **ne** sme vraćati u javnom API-ju ako je označeno da nije javan (specifikacija: email se ne objavljuje).
- Moderacija: opciono polje `approved` ili workflow — ako je potrebno pre publikacije (dogovor); minimalno MVP može prikazivati sve ili samo odobrene.
- Javni read na PDP; write endpoint sa osnovnom zaštitom od spama (rate limit u B12).

## Kriterijumi prihvatanja

- [ ] Javni GET ne vraća email adresu u očiglednom obliku.
- [ ] POST validira ocenu i dužinu teksta.
- [ ] PDP može da prikaže listu recenzija sortiranih po dogovoru (npr. najnovije).

## Zavisnosti

- B04, B02

## Za juniore

- Razmotrite CAPTCHA ili hCaptcha kasnije; za sada rate limit + validacija.

## Plan za AI agenta

1. **Liquibase**: tabela `review` (id, product_id FK, user_id nullable FK — ako samo registrovani smeju; inace nullable), `rating` smallint, `body` text, `author_name`, `author_email` (ne vraćati u javnom API), `is_approved` boolean default true/false po dogovoru, `created_at`).
2. **ER**: `USER ||--o{ REVIEW`, `PRODUCT ||--o{ REVIEW` iz [`DATA_MODEL.md`](../DATA_MODEL.md).
3. **API**: `GET /api/v1/products/{slug}/reviews` — lista sa `authorName`, `rating`, `body`, `createdAt` (bez email-a); `POST /api/v1/products/{slug}/reviews` — validacija 1–5 zvezdica, max dužina teksta.
4. **Opciono**: ako POST samo za ulogovane, vezati `user_id` i ignorisati ime sa klijenta ili prepisati iz profila.
5. **Moderacija**: polje `is_approved` koristi M06/B10 kasnije; za MVP sve odobreno ili filter u GET.
6. **Testovi**: `@WebMvcTest` POST invalid rating; integracioni GET ne sme sadržati email u JSON (assert).
