# F01 — Storefront: Vite + React + Redux Toolkit + Tailwind + API klijent

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 0.1

## Cilj

Podići **korisnički** SPA sa dogovorenim stackom i jedinstvenim načinom poziva backend REST-a.

## Opseg

- Vite + React + TypeScript (preporuka).
- Redux Toolkit za globalno stanje; **RTK Query** ili tanStack Query za server stanje — jedan izbor za ceo projekat.
- Tailwind CSS sa dizajn tokenima (boje, spacing); **LLM** može generisati klase uz reviziju mentora za konzistentnost.
- Konfiguracija `baseURL` za API preko env (`VITE_API_URL`).
- Osnovni layout: `ErrorBoundary`, loading i empty state pattern.

## Kriterijumi prihvatanja

- [ ] `npm run dev` podiže aplikaciju; čita API sa lokalnog backenda.
- [ ] Jedan primer **feature** modula (npr. “health” ili “catalog ping”) demonstrira Redux + API poziv.
- [ ] ESLint + Prettier (ili Biome) uključeni kao u ostalim projektima tima.
- [ ] README objašnjava env promenljive i kako se pokreće zajedno sa backendom.

## Zavisnosti

- B01, B02 (poželjno da API postoji pre povezivanja).

## Za juniore

- Ne duplirati fetch logiku u svakoj komponenti; centralizovati klijent i tipove (generisati iz OpenAPI ako mentor odobri).
