# B08 — Slice `review`: recenzije proizvoda

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljak 5.4

## Cilj

Omogućiti slanje i prikaz **recenzija** za proizvod sa poljima iz specifikacije (ocena, tekst, ime, email, privola za čuvanje podataka na klijentu je čisto front; backend čuva samo ono što je dozvoljeno politikom privatnosti).

## Opseg

- Entitet `ProductReview` vezan za proizvod; email se **ne** sme vraćati u javnom API-ju ako je označeno da nije javan (specifikacija: email se ne objavljuje).
- Moderacija: opciono polje `approved` ili workflow — ako je potrebno pre publikacije (dogovor); minimalno MVP može prikazivati sve ili samo odobrene.
- Javni read na PDP; write endpoint sa osnovnom zaštitom od spama (rate limit u B12).

## Kriterijumi prihvatanja

- [ ] Javni GET ne vraća email adresu u očiglednom obliku.
- [ ] POST validira ocenu i dužinu teksta.
- [ ] PDP može da prikaže listu recenzija sortiranih po dogovoru (npr. najnovije).

## Zavisnosti

- B04, B02

## Za juniore

- Razmotrite CAPTCHA ili hCaptcha kasnije; za sada rate limit + validacija.
