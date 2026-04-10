# B05 — Slice `catalog` / pretraga proizvoda

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 4

## Cilj

REST endpoint za **pretragu** proizvoda koji vraća isti oblik listinga kao katalog (specifikacija 4.1).

## Opseg

- Parametar `q` (i opciono filteri kategorija/brend).
- Implementacija: početak sa `ILIKE` / `LIKE` po nazivu + eventualno full-text (PostgreSQL `tsvector`) ako mentor odobri kao drugi korak.
- Paginacija (`page`, `size`) i sortiranje dogovoreno sa frontom.

## Kriterijumi prihvatanja

- [ ] Prazan upit vraća **400** ili definisano ponašanje (dokumentovano), ne 500.
- [ ] Rezultati koriste isti DTO kao listing kataloga (bez dupliranja front logike).
- [ ] Performanse: za dev seed set, upit ispod dogovorenog praga (mentor može dati cilj npr. <200ms lokalno).

## Zavisnosti

- B04

## Za juniore

- Ako uvodite full-text, migracija mora kreirati indeks; ne ostavljati neindeksirane skenove za produkciju bez upozorenja.
