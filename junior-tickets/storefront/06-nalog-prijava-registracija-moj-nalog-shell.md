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
