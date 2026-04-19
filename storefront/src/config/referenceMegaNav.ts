/**
 * Mega-meni "Lice" — grupe i linkovi usklađeni sa beauty-health.rs (slug-ovi iz Woo importa).
 */
export type MegaLink = { label: string; slug: string };

export type MegaGroup = { title: string; links: MegaLink[] };

/** Jedna kolona = više grupa (naslova) jedna ispod druge */
export type MegaColumn = MegaGroup[];

export const LICE_MEGA_COLUMNS: MegaColumn[] = [
  [
    {
      title: 'KORAK U RUTINI',
      links: [
        { label: 'Čišćenje kože', slug: 'ciscenje' },
        { label: 'Esencije', slug: 'esencija' },
        { label: 'Serumi', slug: 'serumi' },
        { label: 'Kreme', slug: 'krema' },
        { label: 'Maske', slug: 'maske' },
        { label: 'Pilinzi', slug: 'pilinzi' },
        { label: 'Setovi za kožu', slug: 'setovi-za-kozu' },
        { label: 'Toneri', slug: 'toner' },
        { label: 'Zaštita od sunca', slug: 'zastita-od-sunca' },
      ],
    },
    {
      title: 'MAKE-UP SA NEGOM',
      links: [{ label: 'Tonirane kreme', slug: 'bb-cc-kreme' }],
    },
  ],
  [
    {
      title: 'APARATI',
      links: [{ label: 'Aparati', slug: 'beauty-aparati' }],
    },
    {
      title: 'CILJANA NEGA',
      links: [
        { label: 'Ciljani tretmani', slug: 'tretman' },
        { label: 'Mistovi', slug: 'mist' },
        { label: 'Jastučići', slug: 'pads' },
        { label: 'Nega usana', slug: 'nega-usana' },
        { label: 'Nega trepavica', slug: 'nega-trepavica' },
        { label: 'Okoloočna nega', slug: 'okoloocna-nega' },
        { label: 'Ulja za kožu', slug: 'ulje' },
      ],
    },
  ],
  [
    {
      title: 'STANJE KOŽE',
      links: [
        { label: 'Akne', slug: 'akne' },
        { label: 'Antiage', slug: 'antiage' },
        { label: 'Beživotna koža', slug: 'bezivotna-koza' },
        { label: 'Crvenilo', slug: 'crvenilo' },
        { label: 'Hidratacija', slug: 'hidratacija' },
        { label: 'Hiperpigmentacije', slug: 'hiperpigmentacije' },
        { label: 'Kombinovana koža', slug: 'mesovita-i-normalna-koza' },
        { label: 'Masna koža', slug: 'masna-koza-tip-koze' },
        { label: 'Osetljiva koža', slug: 'osetljiva-koza' },
        { label: 'Proširene pore', slug: 'prosirene-pore' },
        { label: 'Suva koža', slug: 'suva-koza-tip-koze' },
        { label: 'Tonus kože', slug: 'tonus-koze' },
      ],
    },
  ],
  [
    {
      title: 'AKTIVNI SASTOJCI',
      links: [
        { label: 'AHA', slug: 'aha' },
        { label: 'Bakučiol', slug: 'bakuchiol' },
        { label: 'Centela', slug: 'centella-asiatica' },
        { label: 'Hijaluronska kiselina', slug: 'hijaluronska-kiselina' },
        { label: 'Kolagen', slug: 'kolagen' },
        { label: 'Niacinamid', slug: 'niacinamid' },
        { label: 'Peptidi', slug: 'pepidi' },
        { label: 'PDRN', slug: 'polinukleotidi' },
        { label: 'Retinol', slug: 'retinol' },
        { label: 'Salicilna kiselina', slug: 'salicilna' },
        { label: 'Vitamin C', slug: 'vitamin-c' },
      ],
    },
  ],
];
