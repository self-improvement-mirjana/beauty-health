# M05 — CMS light: informativne stranice, lokacije, blog (ako u opsegu)

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljci 8, 9

## Cilj

UI za uređivanje **sadržaja** koji B09 servira storefront-u: lokacije, statičke stranice (slug), opciono blog postovi.

## Opseg

- Editor: textarea sa markdown preview **ili** rich text — dogovor tima; sanitizacija na backendu.
- Lista lokacija sa CRUD.
- Lista stranica po slug-u; validacija slug formata.

## Kriterijumi prihvatanja

- [ ] Izmena se vidi na storefront stranici bez redeploy-a fronta.
- [ ] Preview režim **opciono** — ako nije u opsegu, dokumentovati.

## Zavisnosti

- M01, B10 ili B09 write endpoints (usklađeno sa backend tiketima).

## Za juniore

- Veliki HTML blob-ovi mogu usporiti editor — lazy load ili paginacija liste članaka.

## Plan za AI agenta

1. **CMS stranice**: lista `cms_page` sa filterom published; editor textarea + live markdown preview (`react-markdown`) ili rich text po dogovoru.
2. **Lokacije prodavnica**: CRUD forma (naziv, adresa, telefon, radno vreme) mapirana na B10/B09 entitet `retail_location`.
3. **Blog**: ako u opsegu, lista + editor sa `publishedAt` date picker; slug auto iz naslova uz ručnu korekciju.
4. **Kategorije sadržaja**: ako se koristi `CMS_PAGE_CATEGORY`, UI za dodelu više tagova stranici.
5. **Validacija**: slug regex, obavezni naslov; confirm pri brisanju stranice koja je u footeru.
6. **ER**: `CMS_PAGE`, `BLOG_POST`, `CMS_PAGE_CATEGORY` iz [`DATA_MODEL.md`](../DATA_MODEL.md) gde su implementirani u backendu.
