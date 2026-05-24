# Kafka Analytics Agent Tickets

Ovaj folder sadrzi **direktne i stroge instrukcije** za AI agente koji izvrsavaju plan korak-po-korak.

## Redosled

1. `1-event-contract.md`
2. `2-backend-producer-outbox.md`
3. `3-storefront-telemetry-ingest.md`
4. `4-analytics-service.md`
5. `5-moderator-integration.md`
6. `6-tests-and-failure-cases.md`

## Pravila za AI agenta

- Radi **samo ticket koji je trenutno aktivan**.
- Ne preskaci acceptance kriterijume.
- Ako ticket trazi novi fajl, napravi ga na navedenoj putanji.
- Ako ticket trazi izmenu postojecih fajlova, menjaj samo navedene fajlove (osim ako je neophodan import/registracija).
- Posle svakog ticketa pokreni trazene testove/komande iz tog ticketa.
- Ako se zaglavis:
  - napisi sta je blokada,
  - navedi tacan error,
  - predlozi minimalni sledeci korak.

## Definition of done za ceo folder

- Svih 6 ticketa zavrseno redom.
- Build prolazi za backend i relevantne frontend delove.
- Osnovni end-to-end tok analytics dogadjaja radi:
  - UI dogadjaj ili business dogadjaj nastaje,
  - upisuje se u outbox,
  - objavi se na Kafka topic,
  - analytics-service konzumira,
  - report endpoint vraca agregirane podatke,
  - moderator panel prikazuje rezultat.
