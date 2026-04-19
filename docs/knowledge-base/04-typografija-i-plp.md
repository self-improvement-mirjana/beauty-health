# Tipografija i PLP (Sephora-inspiracija)

## Globalni fontovi

- **`storefront/src/index.css`**: `body` koristi **Inter**; **`h1, h2, h3`** globalno dobijaju **Playfair Display**.

## Kategorija PLP (`CategoryPage.tsx`)

Za **„Sephora“ konzistentan sans** naslov kategorije:

- Na **`h1`** dodato **`font-sans`** da se **pregazi** globalni serif za naslov stranice.
- Veličina hijerarhije bez drugog fonta: npr. **`text-lg md:text-xl font-semibold`** umesto izrazito velikog Playfair naslova.

Ista logika za naslov **`ShopPage`** („Prodavnica”) gde je primenjeno istovetno.

## Crna donja traka (SiteMainNav + Header)

Da bi tekst bio **isti ritam** kao linkovi u levoj koloni sidebar-a na kategoriji:

- **`SiteMainNav.tsx`** — `navClasses(dark)` za **`darkRail`**: **`text-sm font-normal tracking-normal`**, bez starog **9px / extralight / širokog tracking-a**.
- **`Header.tsx`** — **`navClsRail`** za Brendovi / Blog / Lokacije / Prijava na crnoj traci: ista **`text-sm font-normal`** skala.

## Pretraga u odnosu na traku

Placeholder u mirnom stanju podešen na **`placeholder-shown:text-sm`** da vizuelno odgovara **`text-sm`** na crnoj traci; u fokusu ostaje veća skala za kucanje.

## Istorija

- Jedna šira izmena („shop” Tailwind tokeni kroz ceo PLP) je **vraćena** na zahtev; zadržane su ciljane izmene iznad umesto ponovnog globalnog „shop” sistema.
