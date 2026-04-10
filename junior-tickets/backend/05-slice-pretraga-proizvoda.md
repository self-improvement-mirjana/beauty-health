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

## Plan za AI agenta

1. **Endpoint**: `GET /api/v1/products/search?q=...&page=&size=` — isti response tip kao `GET /api/v1/products` (isti DTO iz B04).
2. **Implementacija faza 1**: Spring Data JPA `@Query` sa `LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))` + paginacija; odbaciti prazan `q` sa **400** i telom iz B02.
3. **Implementacija faza 2 (opciono)**: Liquibase changeset koji dodaje kolonu `search_vector` tsvector + GIN indeks + trigger održavanje; servis koristi native query `WHERE search_vector @@ plainto_tsquery('serbian', :q)` ako je jezik podešen.
4. **Performanse**: za seed iz B04, proveriti `EXPLAIN ANALYZE` u dev README; dodati indeks na `product(name)` za LIKE prefiks ako je potreban.
5. **Testovi**: integracioni test sa50 naslova, upit koji vraća podskup; test praznog `q`.
6. **OpenAPI**: dokumentovati parametre i primere odgovora.
