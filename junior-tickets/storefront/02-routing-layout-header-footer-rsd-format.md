# F02 — Rutiranje, layout, globalna navigacija, format RSD

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljci 2, 0 valuta

## Cilj

Implementirati **informacionu arhitekturu** i globalni header/footer kao u specifikaciji, sa ispravnim formatom cena `3.600,00 RSD`.

## Opseg

- React Router (ili ekvivalent) sa rutama za Shop, Brendovi, Blog, Lokacije, Moj nalog, Korpa, pretraga.
- Header: linkovi, polje “Products search”, indikator korpe (broj iz API B06 ili lokalno stanje dok se ne poveže).
- Footer linkovi ka informativnim stranicama (rute koje puni sadržaj iz B09).
- Pomoćna funkcija `formatRsd(amount)` i eventualno `Intl.NumberFormat` — jedan izvor istine.

## Kriterijumi prihvatanja

- [ ] Navigacija je dostupna na svim glavnim stranicama; responsive ponašanje na mobilnom.
- [ ] Cena `3600` se prikazuje kao u specifikaciji (hiljade `.`, decimale `,`, sufiks valute).
- [ ] Deep link na rutu radi posle refresh-a (dev server history fallback).

## Zavisnosti

- F01

## Za juniore

- Stringovi SR/EN miks u specifikaciji (odjeljak 10) — dogovorite sa proizvodom da li prevodite “Products search” ili ostavljate kao na referentnom sajtu.
