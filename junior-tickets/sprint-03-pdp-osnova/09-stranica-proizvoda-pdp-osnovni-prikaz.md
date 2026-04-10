# 09 — Stranica proizvoda (PDP): osnovni prikaz i SEO URL

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 5.1 Osnovni prikaz proizvoda, odjeljak 10 SEO

## Cilj

**PDP** sa nazivom, brendom (link na stranicu brenda), cenama, statusom zaliha i primarnom akcijom kupovine.

## Opseg

- Ruta sa čitljivim slugom (npr. `/product/<slug>`).
- Prikaz: naziv, brend → link ka `/brand/...`, regularna + akcijska cena, „Na zalihama“ / „Nema na zalihama“.
- Primarna akcija: dugme za dodavanje u korpu **ili** ulaz u flow varijanti (povezati sa tiketom 10).

## Kriterijumi prihvatanja

- [ ] Svi elementi iz odjeljak 5.1 su prisutni kada su podaci dostupni.
- [ ] Brend je klikabilan i vodi na ispravan brend slug.
- [ ] Out of stock: nema pogrešnog CTA (usklađeno sa tiketom 17).

## Za juniore

- Učitajte proizvod po slug-u iz rute; 404 stranica ako ne postoji.

## Zavisnosti

- 01, 05 (isti model proširen za PDP), 06 (brend link)
