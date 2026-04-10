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
