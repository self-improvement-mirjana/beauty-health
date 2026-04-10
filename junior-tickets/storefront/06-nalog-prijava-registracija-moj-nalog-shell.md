# F06 — Prijava, registracija, “Moj nalog” (shell dok TBD nije zatvoren)

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 1.2, 11 (TBD ekran)

## Cilj

Forme za **registraciju i prijavu** povezane sa B03; osnovna **korisnička zona** nakon prijave (placeholder sekcije dok specifikacija 11 ne definiše detalje).

## Opseg

- Stranice: login, register, “Moj nalog” zaštićene rutom (redirect na login).
- Čuvanje tokena/sessiona prema backend ugovoru (B03).
- Prikaz imena/email korisnika; link ka istoriji narudžbina kada B07 front bude spreman.

## Kriterijumi prihvatanja

- [ ] Neulogovan korisnik ne vidi zaštićene podatke (403/redirect).
- [ ] Greške prijave su korisniku čitljive (pogrešna lozinka, itd.) bez curenja internih detalja.
- [ ] Logout briše kredencijale sa klijenta.

## Zavisnosti

- F01, F02, B03

## Za juniore

- Kada stigne screenshot “Moj nalog”, dodati tikete za adrese, promenu lozinke, istoriju — ne nagađati polja.

## Plan za AI agenta

1. **Stranice**: `LoginPage`, `RegisterPage`, `AccountLayout` sa outlet-om za podstranice.
2. **Forme**: `react-hook-form` + validacija (Zod); submit poziva B03 endpointe; prikaz field-level grešaka iz B02 `details`.
3. **Sesija**: ako JWT — čuvati u memoriji + refresh token pattern **ili** httpOnly cookie (bez JS pristupa); implementacija mora tačno pratiti backend README iz B03.
4. **Protected route**: `RequireAuth` wrapper koji čita auth slice; redirect na `/login?next=`.
5. **Merge korpe**: nakon uspešnog logina pozvati B06 merge endpoint ako postoji, ili invalidirati cart query.
6. **Account home**: placeholder kartice “Porudžbine (uskoro)” dok nema specifikacije 11.
7. **Logout**: poziv backend `logout` ako postoji + čišćenje state-a.
