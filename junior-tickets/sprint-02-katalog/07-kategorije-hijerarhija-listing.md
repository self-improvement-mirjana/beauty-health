# 07 — Kategorije: hijerarhija i stranica sa listingom

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 3.3 Kategorije (hijerarhija), odjeljak 10 SEO

## Cilj

Podržati **hijerarhijske kategorije** (npr. Lice → Čišćenje) i stranicu kategorije sa listom proizvoda.

## Opseg

- Model: kategorija sa `parentId` ili stablasta struktura (po dogovoru).
- Ruta sa čitljivim URL-om (npr. `/category/lice/ciscenje` ili `/lice/ciscenje`).
- Breadcrumbs opciono ali korisno za hijerarhiju.
- Listing koristi karticu iz tiketa 05.

## Kriterijumi prihvatanja

- [ ] Moguće je navigirati podkategoriju iz roditeljske (UI po izboru tima: meni ili lista).
- [ ] Stranica kategorije prikazuje proizvode koji pripadaju toj kategoriji.
- [ ] URL je čitljiv i stabilan (promena naslova ne lomi slug ako je već objavljeno — napomena za mentora).

## Za juniore

- Počnite od **mock JSON** sa 2 nivoa dubine da testirate navigaciju.

## Zavisnosti

- 05
