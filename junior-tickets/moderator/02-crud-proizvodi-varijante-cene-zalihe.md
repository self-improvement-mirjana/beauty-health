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

## Plan za AI agenta

1. **Lista**: tabela sa TanStack Table ili jednostavnim gridom; kolone: naziv, brend, broj varijanti, min cena, zaliha (agregat); akcije Uredi/Obriši.
2. **Forma proizvoda**: multi-step ili jedna duga stranica — sekcije Osnovno, Opcije (dinamički redovi), Varijante (kombinacije ili eksplicitna lista), Cene, Zaliha po `store_location` ako je u opsegu.
3. **API**: sve mutacije na B10 endpointima; optimistički update **ne** koristiti za cene — prikazati server potvrdu.
4. **Validacija**: Zod šema paralelna sa backend Bean Validation; prikazati `details` iz greške.
5. **Brisanje**: modal potvrde; ako backend koristi soft delete, prikazati status.
6. **ER**: UI mora omogućiti održavanje `PRODUCT`, `PRODUCT_VARIANT`, `PRODUCT_OPTION*`, `INVENTORY` iz [`DATA_MODEL.md`](../DATA_MODEL.md).
7. **Testovi**: RTL test za kreiranje minimalnog proizvoda sa jednom varijantom (mock API).
