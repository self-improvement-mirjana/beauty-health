# M02 — Moderacija kataloga: proizvodi, varijante, cene, zalihe

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 1.3 (uz B10)

## Cilj

UI za **CRUD** proizvoda i varijanti, izmenu cena i zaliha, dodelu brenda i kategorija — sve preko B10 API-ja.

## Opseg

- Lista proizvoda sa filterima i paginacijom.
- Forma za kreiranje/izmenu: osnovna polja + lista varijanti (dinamički redovi).
- Validacija na frontu usklađena sa backend porukama.
- Potvrda pre brisanja ili soft-delete indikator.

## Kriterijumi prihvatanja

- [ ] Promena vidljiva je na storefront listing/PDP nakon refresh (bez keš anomalija osim ako je dokumentovano).
- [ ] Neuspeh čuva unos korisnika gde je moguće (ne gubiti formu na 500).
- [ ] Tailwind UI konzistentan (iako generisan LLM-om, proći kroz spacing i fokus stanja).

## Zavisnosti

- M01, B10, B04

## Za juniore

- Za velike forme koristite `react-hook-form` ili ekvivalent; izbegavati “100 useState”.
