# F05 — Recenzije na PDP-u i korpa (dodavanje, empty state, badge)

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljci 5.4, 6

## Cilj

Forma i lista **recenzija** na PDP-u; **korpa** stranica sa praznim stanjem, dodavanjem preko PDP/listinga i podrškom za `?add-to-cart=` gde backend dozvoljava.

## Opseg

- Forma recenzije: rating, tekst, ime, email, checkbox “sačuvaj podatke” (localStorage na frontu), poruka da email nije javan.
- GET recenzija sa B08; POST nova recenzija.
- Korpa: ruta dogovorena sa starim sajtom ili nova (`/cart`); prikaz broja u headeru.
- Empty state “Korpa je prazna” + CTA na shop (specifikacija 6.2).
- Integracija B06 za stavke; dok 6.5 ostane TBD, prikazati šta API već vraća i označiti nedostajuće u README.

## Kriterijumi prihvatanja

- [ ] Ne šalje se varijanta u korpu ako nije izabrana kada je obavezna.
- [ ] `?add-to-cart=` na PDP ili listing ruti pozove backend dodavanje ili prikaže poruku o grešci.
- [ ] Recenzija posle uspeha osvežava listu ili optimistički dodaje (dogovor).

## Zavisnosti

- F04, B08, B06

## Za juniore

- XSS: ne renderovati korisnički tekst recenzije kao HTML bez sanitizacije.

## Plan za AI agenta

1. **Recenzije**: `ReviewList` + `ReviewForm` na PDP; `POST` na B08; nakon uspeha invalidirati RTK Query tag `Reviews`; textarea i zvezdice pristupačno (radio ili button group).
2. **LocalStorage**: pri čekiranom “sačuvaj podatke” čuvati `authorName`, `authorEmail` (bez lozinki); ne čuvati PII u cookie bez saglasnosti.
3. **Korpa**: stranica `CartPage` — `GET /api/v1/cart`, lista stavki sa `formatRsd`, +/- količina (`PATCH`), ukloni (`DELETE`).
4. **Badge**: hook `useCartSummary` koji poll-uje ili koristi mutacije za broj stavki iz B06.
5. **Query param** `?add-to-cart=<variantId>`: `useEffect` na PDP/listingu koji pozove `POST` jednom (ref `useRef` da ne duplira); obraditi grešku toast-om.
6. **Empty state**: uslov `items.length===0` → ilustracija + CTA na `/shop`.
7. **ER veza**: stavke korpe referenciraju `product_variant_id` (vidi [`DATA_MODEL.md`](../DATA_MODEL.md)).
