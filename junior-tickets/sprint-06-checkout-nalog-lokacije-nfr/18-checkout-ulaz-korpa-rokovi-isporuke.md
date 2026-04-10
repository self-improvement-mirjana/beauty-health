# 18 — Checkout: ulaz iz korpe i informacija o rokovima

**Tip:** Story  
**Prioritet:** Must  
**Spec:** `SPECIFIKACIJA_ZAHTEVA.md` — odjeljci 7.1 (ulaz u checkout) i 7.2 (informacija o rokovima)

## Cilj

Obezbediti da korisnik **započne checkout iz korpe** (korpa → checkout) i da vidi **informaciju o rokovima isporuke** u kontekstu kupovine (globalno ili na checkout ekranu).

## Opseg

- Dugme ili link „Nastavi na plaćanje“ / „Checkout“ na `/cart-3/` kada korpa nije prazna (naziv dogovoriti).
- Checkout ruta (npr. `/checkout`) sa minimalnim placeholderom dok odjeljak 7.3 TBD nije dopunjen.
- Prikaz teksta o isporuci (npr. „Isporuka do 4–6 radnih dana.“) usklađen sa tiketom 12 i stranicom „Isporuka“.

## Kriterijumi prihvatanja

- [ ] Iz korpe sa stavkama moguće je preći na checkout.
- [ ] Rokovi isporuke su vidljivi korisniku bar na jednom mestu u checkout flow-u ili kao globalni info blok.
- [ ] Dokumentovati u kodu šta čeka TBD iz specifikacije (forma, plaćanje, dostava).

## Za juniore

- Ne implementirajte punu formu dok nemate screenshot/zahteve — fokus na **navigaciju** i **informaciju**.

## Zavisnosti

- 15, 16
