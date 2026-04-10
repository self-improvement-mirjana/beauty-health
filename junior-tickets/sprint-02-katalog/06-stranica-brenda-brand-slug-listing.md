# 06 — Stranica brenda: `/brand/<slug>` i listing

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 3.2 Stranice brendova, odjeljak 10 SEO

## Cilj

Stranica brenda koja prikazuje **listu proizvoda** tog brenda, sa istim pravilima kartice kao u shop listingu.

## Opseg

- Ruta oblika `/brand/[slug]` (ili dogovoreni oblik) sa **čitljivim URL-om**.
- Učitavanje proizvoda filtrirano po brendu (mock API, CMS ili backend — po dogovoru).
- Prikaz praznog stanja ako brend nema proizvoda.

## Kriterijumi prihvatanja

- [ ] Svaki brend ima slug u URL-u (npr. `/brand/loreal`).
- [ ] Listing koristi komponentu iz tiketa 05.
- [ ] Naziv brenda je vidljiv na stranici (h1).

## Za juniore

- Na PDP-u brend biti link ka ovoj ruti (tiket 09) — držite slug konzistentnim.

## Zavisnosti

- 05
