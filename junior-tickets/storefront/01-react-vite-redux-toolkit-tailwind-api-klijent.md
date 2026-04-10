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

## Plan za AI agenta

1. **Scaffold**: `npm create vite@latest storefront -- --template react-ts`; instalirati `tailwindcss`, `@reduxjs/toolkit`, `react-redux`, `react-router-dom`, opciono `@tanstack/react-query` **ili** RTK Query (jedan izbor).
2. **Struktura foldera**: `src/app/store.ts`, `src/app/hooks.ts`, `src/features/` po domenima, `src/components/ui`, `src/lib/api.ts` sa `fetchBaseQuery` ili `axios` instancom i `baseURL: import.meta.env.VITE_API_URL`.
3. **Env**: `.env.example` sa `VITE_API_URL=http://localhost:8080`; dokumentovati u README.
4. **Tailwind**: `tailwind.config.js` sa content paths; bazni layout komponente; dizajn tokeni (boje font).
5. **Primer feature-a**: `features/system/api.ts` — RTK Query endpoint `getHealth` koji zove postojeći backend ping iz B01/B02; prikazati u `App.tsx` ili `HomePage`.
6. **Error boundary**: klasa ili `react-error-boundary` oko ruta.
7. **Lint/format**: ESLint + Prettier; `npm run build` mora proći bez TS grešaka.
8. **Model podataka**: tipovi koji odgovaraju JSON-u iz backenda treba kasnije uskladiti sa [`DATA_MODEL.md`](../DATA_MODEL.md) preko API DTO (ne direktno mapirati JPA u front).
