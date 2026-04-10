# 10 — PDP: varijante i „Odaberite opcije“

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 5.2 Varijante / „Odaberite opcije“, odjeljak 6.4 (vezano)

## Cilj

Za proizvode sa varijantama, **zahtevati izbor opcija** pre dodavanja u korpu; na listingu „Odaberite opcije“ vodi na PDP.

## Opseg

- UI za izbor varijanti (npr. zapremina, nijansa — polja zavise od modela).
- Dugme „Dodaj u korpu“ aktivno tek kada su sve obavezne opcije izabrane.
- Validacija: poruka korisniku ako pokuša dodavanje bez kompletiranih opcija.

## Kriterijumi prihvatanja

- [ ] Varijabilni proizvod se ne može dodati u korpu bez izabranih opcija.
- [ ] Listing kartica za varijabilni proizvod i dalje koristi „Odaberite opcije“ → PDP (tiket 05).
- [ ] Izabrana varijanta se šalje u korpu (kad korpa postoji — tiket 16).

## Za juniore

- Model: `variants[]` sa `id`, atributima i `inStock` po varijanti ako je potrebno.

## Zavisnosti

- 09, 05
