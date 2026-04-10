# B06 — Slice `cart`: korpa za gosta i ulogovanog korisnika

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljci 6.1–6.4 (delimično dok TBD 6.5 ne bude zatvoren)

## Cilj

Perzistentna ili polu-perzistentna **korpa** sa REST operacijama: dodaj/ažuriraj/ukloni, vezivanje za **guest token** ili **user** nakon prijave.

## Opseg

- Model stavki: referenca na varijantu, količina, snapshot cene (opciono ali korisno za istoriju).
- Pravila: ne dodavati ako nema zaliha; varijabilni proizvod samo sa izabranom varijantom (usklađeno sa B04).
- Podrška za `?add-to-cart=<id>` na frontu znači da backend ima idempotentan “dodaj” endpoint koji front poziva pri učitavanju (dogovor sa F05).
- Endpoint za **broj stavki** ili količinu za badge “Korpa0”.

## Kriterijumi prihvatanja

- [ ] Gost može imati korpu pre identifikacije; nakon logina korpa se spaja (ili je definisano drugačije — ali mora biti dokumentovano ponašanje).
- [ ] Pokušaj dodavanja nedostupne varijante vraća jasnu grešku (B02 format).
- [ ] Prazna korpa se može detektirati na API za empty state (specifikacija 6.2).

## Zavisnosti

- B02, B03 (za merge), B04

## Za juniore

- Dok specifikacija 6.5 ostaje TBD, implementirajte minimalno (lista stavki + linijski iznos) ili stub sa flagom “TBD pricing rules” — ali **ne** ostavljati nedefinisane JSON ključeve bez README napomene.
