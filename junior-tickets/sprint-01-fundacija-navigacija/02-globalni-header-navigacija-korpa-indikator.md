# 02 — Globalni header: meni, „Moj nalog“, korpa sa indikatorom

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 2.1 Globalna navigacija (header), odjeljak 6.1 indikator korpe

## Cilj

Implementirati **globalni header** sa linkovima i indikatorom stanja korpe (npr. `Korpa0`).

## Opseg

Linkovi u meniju (rute dogovoriti sa mentorom, ali imena kao u specifikaciji):

- Prodavnica / Shop  
- Brendovi  
- Blog  
- Lokacije  
- Moj nalog  
- **Korpa** sa brojem stavki (ili0 dok nema implementacije korpe — stub je OK dok tiket 15+ ne poveže pravo stanje)

Globalno polje pretrage **„Products search“** može biti samo UI u ovom tiketu; povezivanje sa rezultatima je u sprintu 2 (tiket 03 + 08).

## Kriterijumi prihvatanja

- [ ] Svi navedeni linkovi postoje i vode na postojeće ili placeholder rute (bez 404 u dev okruženju ako je dogovoreno).
- [ ] Korpa prikazuje indikator (npr. `Korpa0`); kasnije se povezuje sa stvarnim stanjem korpe.
- [ ] Header je prisutan na svim glavnim layout stranicama (jedan layout komponenta).

## Za juniore

- Koristite **jedan** `Layout` ili `AppShell` da ne duplirate header.
- Stub za broj u korpi: `useState(0)` ili kontekst — refaktor u tiketu 15 kada korpa postoji.

## Zavisnosti

- 01 (po želji za konzistentan stil, nije strogo)
