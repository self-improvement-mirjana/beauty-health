# 03 — Globalna pretraga: polje „Products search“

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 2.1, odjeljak 4.1 (delimično — UI i navigacija ka rezultatima)

## Cilj

U headeru omogućiti **polje za pretragu** proizvoda koje vodi korisnika na stranicu rezultata sa query parametrom (npr. `/search?q=...` ili dogovorena ruta).

## Opseg

- Input sa labelom/placeholderom u skladu sa UI („Products search“).
- Submit (Enter ili dugme) → navigacija na rutu rezultata.
- Prazan upit: dogovor sa mentorom (blokirati ili prikazati sve — preporuka: ne slati prazan upit).

## Kriterijumi prihvatanja

- [ ] Korisnik može uneti tekst i otići na stranicu rezultata sa prosleđenim upitom.
- [ ] Pretraga je dostupna globalno (iz headera).
- [ ] Stranica rezultata **prikazuje listing** prema tiketu 08 (može biti prazan dok nema podataka — ali ruta mora postojati).

## Za juniore

- Ne mešajte logiku pretrage u header — samo **prikupljanje upita** i **navigacija**.
- Koristite URL query da rezultati budu **deljivi linkom** (SEO i UX).

## Zavisnosti

- 02 (header)
