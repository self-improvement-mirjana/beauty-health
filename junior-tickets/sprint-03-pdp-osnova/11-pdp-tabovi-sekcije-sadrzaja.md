# 11 — PDP: tabovi/sekcije — Opis, Dodatne informacije, Recenzije, Isporuka, Napomena

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 5.3 Tabovi/sekcije sadržaja

## Cilj

Na PDP-u obezbediti sekcije (tabovi ili sidrane sekcije) sa minimum sadržajem:

- Opis  
- Dodatne informacije  
- Recenzije  
- Isporuka  
- Napomena  

## Opseg

- Implementacija UI (tabs vs. accordion — po dizajnu).
- Svaka sekcija renderuje sadržaj iz proizvoda ili CMS polja (mock tekst do integracije).
- Sekcija **Recenzije**: prikaz liste + forma iz tiketa 13 (može biti placeholder dok13 nije gotov).

## Kriterijumi prihvatanja

- [ ] Korisnik može pristupiti svih pet sekcija sa PDP-a.
- [ ] Sadržaj se ne gubi pri navigaciji unutar stranice (anchor linkovi rade ako su korišćeni).
- [ ] Prazna sekcija: smislen empty state ili sakrivanje — dogovor sa mentorom.

## Za juniore

- Izbegnite pet copy-paste bloka — jedan niz konfiguracije `{ id, label, content }`.

## Zavisnosti

- 09
