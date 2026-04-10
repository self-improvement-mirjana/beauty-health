## Funkcionalna specifikacija zahteva (derived) — beauty-health.rs

Ovaj dokument definiše **funkcionalne zahteve** (šta sistem mora da radi) za e‑commerce sajt tipa *Beauty & Health*, izvedene **isključivo iz UI/ponašanja** vidljivog na sajtu [beauty-health.rs](https://beauty-health.rs/).

### 0) Opseg, ciljevi i pretpostavke

- **Cilj**: omogućiti korisniku da pretraži i pregleda katalog, pogleda detalje proizvoda (cena/akcija/zalihe/varijante), doda u korpu i završi kupovinu (checkout), uz nalog i prateće informativne stranice.
- **Kanali**: web (desktop + mobilni).
- **Valuta**: RSD, format npr. `3.600,00 RSD`.
- **Napomena o “derived” pristupu**: gde UI ne prikazuje eksplicitno (npr. kupon u korpi), zahtevi se navode kao **TBD** ili se ne nameću.

### 0.1 Tehnička arhitektura i obavezni stack

Implementacija se deli na **tri isporuke** koje dele isti domen, ali imaju odvojene aplikacije i jasno razdvojene REST granice:

| Isporuka | Tehnologije | Napomena |
|--------|-------------|----------|
| **Backend** | **Java 17+**, **Spring Boot 3.x**, **PostgreSQL**, **REST (JSON)** | Organizacija koda po **vertical slices** (npr. `catalog`, `cart`, `orders`, `auth`, `moderation`): svaki slice sadrži sve slojeve potrebne za tu domensku sposobnost (API, servis, perzistencija u okviru modula), uz zajedničke cross-cutting koncerne (bezbednost, validacija, mapiranje). |
| **Frontend — korisnički sajt (storefront)** | **React** (npr. Vite), **Redux** (preporuka: Redux Toolkit), **Tailwind CSS**, uobičajeni prateći alati (ruter, HTTP klijent, form validacija) | Jedan SPA za goste i registrovane korisnike; potrošač REST API-ja backenda. Tailwind klase i layout mogu biti **uglavnom generisani/asistirani LLM-om**, uz ručnu reviziju za konzistentnost i pristupačnost. |
| **Frontend — moderacija** | Isti stack kao storefront (**React + Redux + Tailwind**) | Odvojena aplikacija (odvojen build/deploy) za uloge koje upravljaju katalogom, cenama, zalihama, narudžbinama i sadržajem; pozivi na **moderatorske/admin REST** endpoint-e sa strožijom autorizacijom. |

**Principi integracije**

- Jedan **PostgreSQL** kao izvor istine; migracije šeme (npr. Flyway ili Liquibase) žive u backend projektu.
- Ugovor između frontova i backenda: **verzionisani REST** resursi, konzistentni kodovi grešaka i format datuma/novca (npr. `BigDecimal` / string u API-ju + jasna konvencija za RSD prikaz na UI).
- **Vertical slice** na backendu znači: izbegavati “anemičan” slojeviti monolit gde sve ide kroz iste generičke pakete bez domenskog smisla; umesto toga, funkcionalnost se dodaje kao kohezivan modul koji se može razumeti i testirati zasebno.

---

## 1) Uloge i pristup

### 1.1 Gost (neulogovan)

- Može da pregleda listinge/kategorije/brendove, pretražuje, otvara stranicu proizvoda.
- Može da dodaje proizvode u korpu (kada UI omogućava).
- Može da pristupi stranici korpe.

### 1.2 Registrovan korisnik

- Može da se prijavi/registruje preko “Moj nalog”.
- Nakon prijave ima pristup korisničkoj zoni (“Moj nalog”) i kupovini.

### 1.3 Moderator sajta (posebna aplikacija)

- Pristup preko **odvojenog moderatorskog frontenda** (ne kroz isti UI kao kupac).
- Minimalni opseg: upravljanje **proizvodima** (uključujući varijante), **cenama** i **zalihama**, **sadržajem** (informativne stranice, blog ako postoji, lokacije), **narudžbinama** (pregled, promena statusa), i **korisnicima** u meri potrebnoj za podršku (bez javnog kataloga funkcija).
- Backend mora da razlikuje **javne** endpoint-e (storefront) od **moderatorskih** (role/scope, jača autentikacija, audit po potrebi).

---

## 2) Informaciona arhitektura i globalna navigacija

### 2.1 Globalna navigacija (header)

**Zahtevi**

- Sistem mora da obezbedi globalni meni sa linkovima ka:
  - “Prodavnica/Shop”
  - “Brendovi”
  - “Blog”
  - “Lokacije”
  - “Moj nalog”
  - “Korpa” sa indikatorom stanja (npr. “Korpa0”).
- Sistem mora da obezbedi globalno polje pretrage “Products search”.

**Razlog / podrška u UI**

- U headeru je vidljivo “Moj nalog” i “Korpa0” i “Products search”.

---

## 3) Katalog: listing, kategorije, brendovi

### 3.1 Listing proizvoda (Shop / sekcije na naslovnoj)

**Zahtevi**

- Sistem mora da prikaže proizvod u listi sa minimum:
  - naziv proizvoda,
  - cenu u RSD,
  - akcijsku cenu ako postoji (prikaz regularne + snižene),
  - akciju:
    - “Dodaj u korpu” kada je proizvod direktno dodljiv,
    - “Odaberite opcije” kada proizvod ima varijante,
    - bez “Dodaj u korpu” kada je proizvod “Nema na zalihama”.

**Razlog / podrška u UI**

- U listama se vidi kombinacija “Dodaj u korpu”, “Odaberite opcije”, “Nema na zalihama”, i prikaz regularne + akcijske cene.

### 3.2 Stranice brendova

**Zahtevi**

- Sistem mora da obezbedi stranice brendova (npr. `/brand/<slug>/`) sa listom proizvoda tog brenda.

### 3.3 Kategorije (hijerarhija)

**Zahtevi**

- Sistem mora da obezbedi hijerarhijske kategorije (npr. Lice → Čišćenje) i stranice kategorija sa listom proizvoda.

---

## 4) Pretraga proizvoda

### 4.1 “Products search”

**Zahtevi**

- Sistem mora da omogući pretragu proizvoda preko globalnog polja pretrage.
- Sistem mora da prikaže rezultate kao listing sa istim pravilima prikaza kao u katalogu (cena/akcija/stock/CTA).

---

## 5) Stranica proizvoda (PDP)

### 5.1 Osnovni prikaz proizvoda

**Zahtevi**

- Sistem mora da prikaže:
  - naziv proizvoda,
  - brend (kao link na stranicu brenda),
  - cenu (regularna i akcijska kada postoji),
  - status zaliha (“Na zalihama” / “Nema na zalihama”),
  - primarnu akciju kupovine (dodavanje u korpu ili izbor opcija).

**Razlog / podrška u UI**

- Na PDP-u je vidljivo: naziv, brend, dve cene, “Na zalihama”, dugme “Dodaj u korpu”.

### 5.2 Varijante / “Odaberite opcije”

**Zahtevi**

- Za proizvode sa varijantama, sistem mora da zahteva izbor opcija pre dodavanja u korpu.
- Listing mora da vodi korisnika na PDP (“Odaberite opcije”) kada direktno dodavanje nije moguće.

### 5.3 Tabovi/sekcije sadržaja

**Zahtevi**

- Sistem mora da obezbedi sekcije minimum:
  - “Opis”
  - “Dodatne informacije”
  - “Recenzije”
  - “Isporuka”
  - “Napomena”.

### 5.4 Recenzije (“Dodaj recenziju”)

**Zahtevi**

- Sistem mora da omogući unos recenzije sa poljima:
  - ocena (rating),
  - tekst recenzije,
  - ime,
  - e‑pošta,
  - checkbox “sačuvaj moje podatke” (lokalno pamćenje u browseru).
- Sistem mora da prikaže poruku da e‑pošta neće biti javno objavljena.

### 5.5 Informacije o isporuci (na PDP-u)

**Zahtevi**

- Sistem mora da prikaže informativni tekst o rokovima obrade/isporuke (npr. “Porudžbine obrađujemo u roku od 1–3 radna dana. Isporuka je za 4–6 radnih dana.”).

### 5.6 Cross-sell / bundle (“Često se kupuje zajedno”)

**Zahtevi**

- Sistem može (opciono, ako se implementira) da prikaže sekciju “Često se kupuje zajedno” sa:
  - listom proizvoda u kombinaciji,
  - prikazom uštede (“You can save”),
  - prikazom ukupne cene,
  - akcijom “Dodaj u korpu” za kombinaciju.

**Podaci**

- Potreban je model za “bundle” ponudu ili pravilo obračuna uštede za kombinaciju.

---

## 6) Korpa

### 6.1 Stranica korpe

**Zahtevi**

- Sistem mora da obezbedi stranicu korpe na ruti `/cart-3/`.
- Sistem mora da obezbedi indikator u navigaciji (npr. “Korpa0”) koji reflektuje stanje korpe.

### 6.2 Prazna korpa (empty state)

**Zahtevi**

- Kada korpa nema stavki, sistem mora da prikaže:
  - poruku “Korpa je prazna”,
  - CTA “Pregledajte naše proizvode” koji vodi na `/shop`.

### 6.3 Dodavanje u korpu (simple proizvodi)

**Zahtevi**

- Sistem mora da omogući dodavanje proizvoda iz listinga preko akcije “Dodaj u korpu”.
- Sistem mora da podrži dodavanje preko URL parametra oblika `?add-to-cart=<productId>` (gde je `<productId>` numerički identifikator proizvoda).

### 6.4 Ograničenja dodavanja (zalihe / varijante)

**Zahtevi**

- Sistem ne sme da nudi “Dodaj u korpu” za proizvode koji su “Nema na zalihama”.
- Sistem ne sme da doda varijabilni proizvod bez izabranih opcija; umesto toga mora da vodi na PDP (“Odaberite opcije”).

### 6.5 Obračun cena u korpi (TBD iz UI)

**TBD**

- UI ne pokazuje punu korpu sa stavkama (količine, subtotal/total, kupon, dostava u korpi). Kada bude dostupno (screenshot ili state), dopuniti:
  - prikaz linijske cene po stavci,
  - prikaz regularne vs akcijske cene (ako se prikazuje),
  - total i eventualne popuste.

---

## 7) Checkout (isporuka, plaćanje) — minimalno izvedeno

### 7.1 Ulaz u checkout

**Zahtevi**

- Checkout proces mora da koristi korpu kao ulaz (korpa → checkout).

### 7.2 Informacija o rokovima

**Zahtevi**

- Sistem mora da prikaže informaciju o rokovima isporuke u kontekstu kupovine (globalno ili u checkout-u), npr. “Isporuka do 4–6 radnih dana.”

### 7.3 Načini plaćanja i isporuke (TBD iz UI forme)

**TBD**

- Na sajtu postoje informativne stranice “Načini plaćanja” i “Isporuka”, ali UI checkout forme nije analiziran.
- Dopuniti nakon uvida u checkout ekran:
  - polja za adresu i kontakt,
  - izbor dostave,
  - izbor plaćanja,
  - potvrda porudžbine i poruka o uspehu/neuspehu.

---

## 8) Lokacije prodavnica

**Zahtevi**

- Sistem mora da prikaže listu lokacija sa minimum:
  - naziv lokacije (npr. tržni centar),
  - adresa,
  - telefon,
  - radno vreme (npr. “Svakog dana 10:00–22:00”).

**Razlog / podrška u UI**

- Lokacije su vidljive u footer sadržaju (više lokacija, adrese, telefoni, radno vreme).

---

## 9) Informativne stranice i podrška

**Zahtevi**

- Sistem mora da obezbedi dostupne informativne stranice (linkovi iz footera):
  - “Najčešće postavljana pitanja”
  - “Kako poručiti?”
  - “Načini plaćanja”
  - “Uslovi kupovine”
  - “Isporuka”
  - “Odustanak od ugovora”
  - “Pravilnik o reklamaciji”
  - “Oštećenje robe”
  - “Politika privatnosti i kolačići”
  - “Kontakt”
- Sistem mora da prikaže kontakt kanal za online podršku (email).

---

## 10) Nefunkcionalni zahtevi (minimum)

- **Jezik i konzistentnost**: UI je pretežno SR, ali postoje EN stringovi (npr. “You can save”) → definisati politiku lokalizacije (SR-only ili mešano) i uskladiti stringove.
- **Bezbednost**:
  - lozinke se čuvaju kao hash,
  - zaštita od CSRF za akcije koje menjaju stanje (korpa/checkout),
  - rate limiting / zaštita login forme.
- **SEO**: čitljivi URL‑ovi za proizvode, kategorije i brendove.
- **Performanse**: listing i PDP moraju stabilno raditi na mobilnim uređajima.

---

## 11) Otvorena pitanja (za zatvaranje “derived” praznina)

Da bi specifikacija bila kompletna bez pretpostavki, potrebno je dostaviti jedan od sledećih ulaza:

- screenshot **korpe sa stavkama** (da potvrdimo količine, uklanjanje, subtotal/total, kupon),
- screenshot **checkout forme** (polja, izbor dostave/plaćanja, validacije),
- screenshot **“Moj nalog” nakon prijave** (da potvrdimo funkcije profila/porudžbina/adresa).

