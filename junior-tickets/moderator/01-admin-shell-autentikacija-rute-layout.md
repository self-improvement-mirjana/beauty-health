# M01 — Moderator app: shell, autentikacija, zaštićene rute

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljci 0.1, 1.3

## Cilj

Podići **odvojenu** React aplikaciju za moderatore sa istim stackom kao storefront (Vite, Redux Toolkit, Tailwind), ali drugim brandingom i **samo** moderatorskim rutama.

## Opseg

- Novi Vite projekat u monorepu ili odvojenom folderu (`apps/moderator` ili `moderator-web`).
- Login protiv istog B03 endpointa; čuvanje sesije/tokena; rutiranje: `/login`, `/` dashboard.
- Layout: sidebar ili top nav za module (Katalog, Narudžbine, Sadržaj, Korisnici).
- Guard: neulogovan → login; korisnik bez uloge moderatora → stranica “Nemate pristup”.

## Kriterijumi prihvatanja

- [ ] Moderator se može ulogovati i videti dashboard.
- [ ] Kupčki korisnik **ne** može pristupiti moderator rutama čak i ako ručno ukuca URL (403 flow).
- [ ] Env `VITE_API_URL` pokazuje na isti backend kao storefront.

## Zavisnosti

- B02, B03, F01 (kopirajte pattern, ne duplirajte ceo repo bez razloga — monorepo preferred).

## Za juniore

- Razmislite o deljenom `packages/ui` ili `packages/api-client` ako monorepo — smanjuje duplikat tipova.

## Plan za AI agenta

1. **Scaffold**: novi Vite React TS projekat `moderator` pored `storefront`; ista verzija Tailwind/Redux kao F01.
2. **API klijent**: `baseURL` isti; interceptor koji dodaje auth header/credentials prema B03.
3. **Auth slice**: login akcija, čuvanje korisnika + uloga; selector `selectIsModerator`.
4. **Rute**: `createBrowserRouter` sa `/login`, `/` (dashboard), `/products`, `/orders`, `/content`, `/users`; `RequireModerator` layout guard.
5. **403 UX**: stranica “Nemate pristup” ako je uloga `CUSTOMER`; ne oslanjati se samo na backend — UX mora biti jasan.
6. **Shell**: sidebar navigacija + top bar sa “Odjavi se”; tema vizuelno različita od storefront-a (npr. tamniji header).
7. **Deljeni paket (opciono)**: `packages/api-types` generisan iz OpenAPI — koristi iste DTO kao storefront gde ima smisla.
