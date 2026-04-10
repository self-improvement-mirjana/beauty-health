# F04 — Stranica proizvoda (PDP): osnova, varijante, tabovi, isporuka

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 5 (5.1–5.3, 5.5)

## Cilj

Kompletan **PDP** prema specifikaciji: osnovni blok, izbor varijanti, tabovi/sekcije, statički tekst o isporuci.

## Opseg

- Učitavanje proizvoda po slug ili ID (usklađeno sa backendom).
- Varijante: korisnik mora izabrati opcije pre dodavanja u korpu ako API tako nalaže.
- Tabovi: Opis, Dodatne informacije, Recenzije, Isporuka, Napomena (sadržaj iz API ili statički dok nije u B09).
- Opciona sekcija cross-sell (specifikacija 5.6) može biti feature flag.

## Kriterijumi prihvatanja

- [ ] PDP prikazuje brend kao link na brend stranicu.
- [ ] Zalihe i primarno dugme usklađeni sa stanjem varijante.
- [ ] Tabovi su pristupačni (fokus, tastatura).

## Zavisnosti

- F03, B04

## Za juniore

- Ne držati velike HTML blob-ove u komponentama ako dolaze iz CMS-a — render preko `dangerouslySetInnerHTML` samo uz sanitizaciju (DOMPurify).
