# B02 — REST konvencije, OpenAPI, CORS, jedinstveni format grešaka

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 0.1, 10 Nefunkcionalni (delimično)

## Cilj

Uvesti **ugovor** za sve REST endpoint-e: verzija u putanji, konzistentan JSON za greške, dokumentacija za front timove, CORS za lokalni razvoj storefront + moderator aplikacija.

## Opseg

- Springdoc OpenAPI (ili springdoc-openapi-starter) sa UI na `/swagger-ui` samo u `dev`/`local` profilu.
- Globalni `@ControllerAdvice` za:
  - validacione greške (Bean Validation),
  - “not found”,
  - poslovna pravila (npr. `409` za konflikt zaliha — kada slice to uvede).
- Standardizovano telo greške, npr. `{ "code", "message", "details" }` (tačna polja dogovoriti jednom).
- CORS: dozvoljeni origin-i iz konfiguracije (localhost porti za oba fronta).
- Konvencija za **novac u API-ju**: npr. iznos kao string `"3600.00"` ili broj + `currency: "RSD"` — **jedan** izbor dokumentovan u README i u OpenAPI primerima.

## Kriterijumi prihvatanja

- [ ] Svaki novi endpoint koristi istu šemu greške (test ili ručna provera kroz Swagger).
- [ ] OpenAPI generiše se iz koda i pokriva sve postojeće javne rute u tom trenutku.
- [ ] Storefront i moderator na localhost mogu zvati API bez CORS blokade (u dev profilu).
- [ ] Dokument “API money format” postoji i referenciran je iz `junior-tickets/README` ili backend README.

## Zavisnosti

- B01

## Za juniore

- Ne širiti različite formate grešaka po slice-ovima; sve kroz advice.
- Razlikujte **400** (klijent) od **422** (validacija) ako tim tako želi — ali budite konzistentni.
