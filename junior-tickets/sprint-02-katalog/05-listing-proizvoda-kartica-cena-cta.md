# 05 — Listing proizvoda: kartica sa cenama i CTA stanjima

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 3.1 Listing proizvoda

## Cilj

Komponenta **kartice proizvoda** u listi koja prikazuje naziv, cenu u RSD, akcijsku cenu kada postoji, i ispravan CTA.

## Opseg

- Naziv proizvoda  
- Cena: regularna; ako postoji akcija — prikaz obe (prema UI referenci)  
- CTA stanja:
  - **„Dodaj u korpu“** — proizvod direktno dodljiv, na zalihama  
  - **„Odaberite opcije“** — proizvod ima varijante (vodi na PDP)  
  - Bez „Dodaj u korpu“ / disabled — **„Nema na zalihama“**

## Kriterijumi prihvatanja

- [ ] Tri stanja CTA su vizuelno i funkcionalno razlikovana u skladu sa podacima proizvoda.
- [ ] Cene koriste format iz tiketa 01.
- [ ] Kartica se koristi na shop listingu i može se ponovo iskoristiti na naslovnim sekcijama.

## Za juniore

- Definišite mali **tip** ili interfejs `ProductListItem` sa poljima: `name`, `price`, `salePrice?`, `inStock`, `hasVariants`, `slug`, `id`.
- „Odaberite opcije“ = `Link` na PDP, ne add-to-cart.

## Zavisnosti

- 01, 02 (ruta ka shop)
