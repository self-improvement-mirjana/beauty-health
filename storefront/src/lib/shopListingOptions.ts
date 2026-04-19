import type { BrandSummaryDto, CategoryTreeNodeDto } from '@/features/catalog/types';

export type ShopCategoryOption = {
  id: number;
  name: string;
  slug: string;
  depth: number;
  unavailable?: boolean;
};

export type ShopBrandOption = {
  id: number;
  name: string;
  slug: string;
  unavailable?: boolean;
  productCount: number;
};

const SHOP_STYLE_CATEGORY_NAMES = [
  'Aksesoari',
  'Aktivni sastojci',
  'Aparati',
  'Kosa',
  'Lice',
  'Make-up',
  'Outlet',
  'Popust do -50%',
  'Stanje kože',
  'Telo',
  'Tip kože',
] as const;

const SHOP_STYLE_BRAND_NAMES = [
  'Abib',
  'About Tone',
  'Active Nine',
  'Acwell',
  'Aestura',
  'Anua',
  'Apieu',
  'APLB',
  'Aprilskin',
  'Arensia',
  'Aromatica',
  'Atopalm',
  'Axis-Y',
  'A.H.C',
  'Banila Co',
  'Baren',
  'BB Lab',
  'Biodance',
  'Bioheal Boh',
  'Be the Skin',
  'Boto',
  'Branden',
  'Celimax',
  'Celdyque',
  'Centellian24',
  'Cerave',
  'Cetaphil',
  'CKD',
  'CNP',
  'Colorgram',
  'Coreana N:Ample',
  'Cos de Baha',
  'Cosrx',
  'Coyu',
  'CP-1',
  "D'Alba",
  'Danongwon',
  'Dear Klairs',
  'Derma:B',
  'Dr.Althea',
  'Dr.Ceuracle',
  'Dr.G',
] as const;

function flattenCategories(nodes: CategoryTreeNodeDto[], depth = 0): ShopCategoryOption[] {
  return nodes.flatMap((node) => [
    { id: node.id, name: node.name, slug: node.slug, depth },
    ...flattenCategories(node.children ?? [], depth + 1),
  ]);
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function slugFromName(value: string): string {
  return normalizeText(value).replace(/\s+/g, '-');
}

export function buildCategoryOptions(tree: CategoryTreeNodeDto[]): ShopCategoryOption[] {
  const flat = flattenCategories(tree);
  const used = new Set<number>();

  const featured = SHOP_STYLE_CATEGORY_NAMES.map((name, index) => {
    const normalized = normalizeText(name);
    const match = flat.find(
      (item) => normalizeText(item.name) === normalized || normalizeText(item.slug) === normalized,
    );
    if (match) {
      used.add(match.id);
      return { ...match, name };
    }
    return {
      id: -(index + 1),
      name,
      slug: slugFromName(name),
      depth: 0,
      unavailable: true,
    };
  });

  const remaining = flat.filter((item) => !used.has(item.id));
  return [...featured, ...remaining];
}

export function buildBrandOptions(brands: BrandSummaryDto[]): ShopBrandOption[] {
  const used = new Set<number>();
  const featured = SHOP_STYLE_BRAND_NAMES.map((name, index) => {
    const normalized = normalizeText(name);
    const match = brands.find(
      (item) => normalizeText(item.name) === normalized || normalizeText(item.slug) === normalized,
    );
    if (match) {
      used.add(match.id);
      return { ...match, name, productCount: match.productCount ?? 0 };
    }
    return {
      id: -(index + 1),
      name,
      slug: slugFromName(name),
      unavailable: true,
      productCount: 0,
    };
  });

  const remaining = brands
    .filter((item) => !used.has(item.id))
    .map((b) => ({ ...b, productCount: b.productCount ?? 0 }));
  return [...featured, ...remaining];
}
