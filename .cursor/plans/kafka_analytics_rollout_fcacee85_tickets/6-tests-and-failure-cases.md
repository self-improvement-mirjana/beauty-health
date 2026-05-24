# Ticket 6: Test plan + failure mode validacija

## Cilj

Dokazati da analytics tok radi i kada stvari krenu lose (duplikati, outage, restart), a ne samo u happy path-u.

## Scope testiranja

1. Contract test
2. Integration test producer->Kafka->consumer
3. End-to-end business scenario
4. Failure scenariji

## Obavezni test scenariji

### A) Contract test (schema)

- Valid event prolazi.
- Missing required field pada.
- Nepoznat `eventType` se odbija ili parkira po pravilima.
- Pogresan `schemaVersion` se odbija.

### B) Integration test (Testcontainers)

- Start PostgreSQL + Kafka (i backend/analytics kontekst).
- Generisi bar jedan `order_created` event.
- Proveri da:
  - poruka ode na topic,
  - analytics-service je konzumira,
  - raw event i agregat su upisani.

### C) E2E scenario

- `add_to_cart` -> `checkout_started` -> `order_created` -> `payment_authorized`.
- Potvrdi da KPI i payment report endpoint-i pokazuju očekivano stanje.

### D) Failure scenariji

- Duplikat webhook/event (`eventId` isti) ne duplira agregate.
- Kafka nedostupna:
  - backend poslovna operacija i dalje radi,
  - outbox ostaje nepublishovan za kasniji retry.
- Consumer restart:
  - servis nastavlja obradu bez gubitka i dupliranja.

## Obavezni output artefakti

- `docs/analytics/test-plan.md`
- `docs/analytics/failure-playbook.md`

`failure-playbook.md` mora da sadrzi:

- simptom
- moguci uzrok
- koraci dijagnostike
- koraci oporavka

## Acceptance kriterijumi

- Automatizovani testovi postoje i prolaze lokalno.
- Dokumentovan je bar jedan reproducible failure test po kljucnom failure modu.
- Postoji jasan playbook za operativni tim.

## Komande za proveru

- `cd backend && ./gradlew test`
- `cd analytics-service && ./gradlew test`
- `cd storefront && npm test`
- `cd moderator && npm test`

## Ne raditi u ovom ticketu

- Ne dodavati nove feature zahteve.
- Ne siriti scope van inicijalnih event tipova bez posebnog ticketa.
