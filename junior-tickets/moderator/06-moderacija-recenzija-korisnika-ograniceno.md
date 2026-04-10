# M06 — Moderacija recenzija i ograničen pregled korisnika

**Tip:** Story  
**Prioritet:** Should  
**Spec:** odjeljci 5.4, 1.3

## Cilj

Omogućiti moderatoru da **odobri/sakrije** recenzije (ako backend podržava flag) i da uradi minimalni **pregled korisnika** radi podrške (B11).

## Opseg

- Lista recenzija po proizvodu ili globalno sa filterom; akcije approve/reject.
- Korisnik: pretraga po email (interno); prikaz osnovnih podataka bez lozinke.

## Kriterijumi prihvatanja

- [ ] Akcije idu kroz API sa autorizacijom; 403 za običnog korisnika.
- [ ] Promena vidljivosti utiče na storefront PDP bez ručnog čišćenja keša (ili je keš TTL dokumentovan).

## Zavisnosti

- M01, B08, B11

## Za juniore

- GDPR: prikažite upozorenje u UI da se pristupa PII samo u svrhu podrške.

## Plan za AI agenta

1. **Recenzije**: tabela sa kolonama proizvod, autor, ocena, datum, odobreno; akcije Approve/Hide ako B08/B10 eksponuju `PATCH`.
2. **Filteri**: po proizvodu, samo neodobrene, po datumu.
3. **Korisnik (support)**: forma pretrage po email-u; rezultat prikazuje id, ime, datum registracije, broj narudžbina — **bez** lozinke; kopiranje ID u clipboard opciono.
4. **Audit banner**: statički tekst upozorenja iznad PII prikaza.
5. **API**: koristiti B11/B10 rute koje mentor definiše; ako još ne postoje, dodati stub issue link u README moderator app-a.
6. **ER**: `REVIEW` veza na `USER` i `PRODUCT` u [`DATA_MODEL.md`](../DATA_MODEL.md).
