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
