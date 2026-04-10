# F02 — Rutiranje, layout, globalna navigacija, format RSD

**Tip:** Story  
**Prioritet:** Must  
**Spec:** odjeljci 2, 0 valuta

## Cilj

Implementirati **informacionu arhitekturu** i globalni header/footer kao u specifikaciji, sa ispravnim formatom cena `3.600,00 RSD`.

## Opseg

- React Router (ili ekvivalent) sa rutama za Shop, Brendovi, Blog, Lokacije, Moj nalog, Korpa, pretraga.
- Header: linkovi, polje “Products search”, indikator korpe (broj iz API B06 ili lokalno stanje dok se ne poveže).
- Footer linkovi ka informativnim stranicama (rute koje puni sadržaj iz B09).
- Pomoćna funkcija `formatRsd(amount)` i eventualno `Intl.NumberFormat` — jedan izvor istine.

## Kriterijumi prihvatanja

- [ ] Navigacija je dostupna na svim glavnim stranicama; responsive ponašanje na mobilnom.
- [ ] Cena `3600` se prikazuje kao u specifikaciji (hiljade `.`, decimale `,`, sufiks valute).
- [ ] Deep link na rutu radi posle refresh-a (dev server history fallback).

## Zavisnosti

- F01

## Za juniore

- Stringovi SR/EN miks u specifikaciji (odjeljak 10) — dogovorite sa proizvodom da li prevodite “Products search” ili ostavljate kao na referentnom sajtu.

## Plan za AI agenta

1. **Router**: definisati `createBrowserRouter` sa rutama: `/`, `/shop`, `/brand/:slug`, `/category/:slug`, `/blog`, `/locations`, `/account`, `/cart`, `/pages/:slug` (ili slug direktno na root po dogovoru).
2. **Layout**: `MainLayout` sa `<Header />`, `<Outlet />`, `<Footer />`; header props za broj korpe (kasnije iz B06).
3. **Header**: navigacioni linkovi iz specifikacije 2.1; input pretrage sa `onSubmit` navigacija na `/search?q=` (F03).
4. **Footer**: mapirati statičke linkove na rute koje učitavaju CMS po slug-u (F07); dok API nije spreman, stub linkovi.
5. **`formatRsd`**: `src/lib/money.ts` — funkcija koja prima `string | number` (API format iz B02) i vraća SR string `3.600,00 RSD`; unit test sa `vitest`.
6. **Responsive**: Tailwind breakpoints za mobilni meni (hamburger).
7. **Pristupačnost**: skip link, fokus stilovi na linkovima.
