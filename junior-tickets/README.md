# Tiketi za junior developere — beauty-health.rs

Tiketi su podeljeni po **tri linije isporuke** iz `SPECIFIKACIJA_ZAHTEVA.md` (odjeljak **0.1**):

1. **Backend** — Spring Boot, PostgreSQL, REST, **vertical slices**
2. **Storefront** — React, Redux (Toolkit), Tailwind, korisnički sajt
3. **Moderator** — isti front stack, odvojena aplikacija za administraciju/moderaciju

## Kako koristiti

- Svaki fajl je jedan tiket: **cilj**, **opseg**, **kriterijumi prihvatanja**, **zavisnosti**, **napomene za juniore**, i sekcija **Plan za AI agenta** (korak-po-korak plan za implementaciju).
- Referentni **ER dijagram** i odnosi entiteta: [`DATA_MODEL.md`](DATA_MODEL.md).
- Redni brojevi unutar foldera su preporučeni redosled unutar te linije; paralelno se mogu raditi stvari koje nemaju međusobne zavisnosti (naznačeno u tiketu).
- Funkcionalni detalji kupca i dalje dolaze iz ostatka specifikacije (katalog, PDP, korpa, itd.); backend tiketi mapiraju te zahteve na **API i perzistenciju**.

## Pregled foldera

| Folder | Fokus | Tiketi |
|--------|--------|--------|
| `backend/` | Monolit Spring Boot + PostgreSQL, slice-ovi, REST za storefront i moderaciju | 01–12 |
| `storefront/` | SPA za kupce, integracija sa javnim API-jem | 01–07 |
| `moderator/` | SPA za moderatore, zaštićeni API, CRUD i operativni tokovi | 01–06 |

## TBD u specifikaciji

Detalji označeni kao **TBD** u specifikaciji (npr. puna korpa sa stavkama, kompletan checkout, ekran „Moj nalog“ posle prijave) — sekcije **6.5**, **7.3**, **11** — zahtevaju dopunu specifikacije i dodatne tikete kada budu dostupni ulazi (screenshot, wireframe, odluka proizvoda).

## API novac (B02)

Format novčanih iznosa u JSON odgovorima (string `amount` + `currency: "RSD"`) dokumentovan je u [`backend/docs/API_MONEY.md`](../backend/docs/API_MONEY.md); isti dokument je referenciran i iz `backend/README.md`.
