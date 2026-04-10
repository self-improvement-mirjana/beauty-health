# 15 — Stranica korpe: ruta `/cart-3/` i prazan state

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 6.1 Stranica korpe, odjeljak 6.2 Prazna korpa

## Cilj

Implementirati stranicu korpe na ruti **`/cart-3/`** i **empty state** kada nema stavki.

## Opseg

- Ruta tačno `/cart-3/` (kao u specifikaciji) ili redirect sa `/cart` ako mentor odobri — **proveriti sa product ownerom**.
- Kada nema stavki:
  - Poruka: „Korpa je prazna“
  - CTA: „Pregledajte naše proizvode“ → `/shop` (ili dogovorena shop ruta)
- Globalni indikator u headeru (tiket 02) ažurirati da čita stvarni broj stavki iz izvora istine korpe.

## Kriterijumi prihvatanja

- [ ] `/cart-3/` radi u dev i produkciji.
- [ ] Prazna korpa prikazuje poruku i CTA ka shopu.
- [ ] Indikator „KorpaN“ u headeru odgovara broju stavki (ili jedinica — dogovor: linije vs. komadi).

## Za juniore

- Korpa: `React Context`, Zustand, ili cookie/session — po arhitekturi; bitno je **jedno mesto** za stanje.

## Zavisnosti

- 02
