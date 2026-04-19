# Storefront: header, pretraga, mega meni

## Lokacija komponenti

- Glavni header: `storefront/src/components/Header.tsx`
- Desktop/mobilni meni kategorija: `storefront/src/components/SiteMainNav.tsx`

## Mega meni — „nestajanje“ pri prelasku miša

Panel je **`position: fixed`**, pa ne širi DOM visinu `.group` kontejnera za hover. Pri spuštanju miša sa triggera **`group-hover`** se gasi pre nego što pokazivač dođe do panela.

**Rešenje:** nevidljivi „most“ (`megaHoverBridgeCls`) ispod trigera (`absolute`, ista širina kao panel, `group-hover:pointer-events-auto`), da hover ostane unutar grupe dok se prelazi na beli panel.

## Pretraga — pravougaonik pri fokusu

Globalno u **`storefront/src/index.css`** (`@layer base`) bilo je pravilo za **`input:focus-visible`** sa pravougaonim **`outline`** koji **ne prati** zaobljenu pill formu.

**Rešenje:**

- Klasa **`bh-header-search-input`** na inputima pretrage u `Header.tsx`.
- Pravilo u `@layer base` izmenjeno tako da **`input:focus-visible:not(.bh-header-search-input)`** dobija outline — pretraga je izuzeta.
- Na samom inputu: **`outline-none`**, **`focus-visible:outline-none`**.

## Pretraga — vizuelna logika (Sephora-inspiracija)

- Spoljni **`rounded-full`** kontejner: **`focus-within:border-neutral-900`**, senka pri aktivnosti.
- Opciono: ikona lupe sakrivena pri **`focus-within`** (`group-focus-within:hidden`).
- Tekst u mirnom stanju placeholdera može koristiti **`placeholder-shown:`** za manji/svetliji tekst; u fokusu ili kada ima vrednosti — veća, čitljivija skala (`focus:`, bazni `text-*` kad nije placeholder).

## Crna navigaciona traka (desktop + mobilni rail)

Tipografija je usklađavana sa PLP sidebar linkovima (`text-sm font-normal`) — detalji u `04-typografija-i-plp.md`.
