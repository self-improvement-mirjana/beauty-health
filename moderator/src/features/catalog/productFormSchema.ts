import { z } from 'zod';

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const inventoryLineSchema = z.object({
  storeLocationId: z.coerce.number().int().positive(),
  quantity: z.coerce.number().int().min(0),
});

const variantSchema = z.object({
  sku: z.string().trim().min(1, 'SKU je obavezan').max(128),
  name: z
    .string()
    .trim()
    .max(255)
    .optional()
    .transform((s) => (s === '' ? null : s)),
  regularPrice: z.coerce.number().min(0, 'Cena ≥ 0'),
  salePrice: z
    .string()
    .optional()
    .transform((s) => {
      if (s === undefined || s.trim() === '') {
        return null;
      }
      const n = Number(s.replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    })
    .refine((v) => v === null || v >= 0, 'Akcijska cena mora biti ≥ 0'),
  defaultVariant: z.boolean(),
  inventory: z.array(inventoryLineSchema).min(1, 'Bar jedna linija zaliha'),
});

export const productCreateSchema = z
  .object({
    brandId: z.coerce.number().int().positive('Izaberite brend'),
    name: z.string().trim().min(1, 'Naziv je obavezan').max(500),
    slug: z
      .string()
      .trim()
      .min(1, 'Slug je obavezan')
      .max(255)
      .regex(slugPattern, 'Slug: mala slova, brojevi i crtice'),
    description: z
      .string()
      .max(4000)
      .optional()
      .transform((s) => (s === undefined || s.trim() === '' ? null : s)),
    shortDescription: z
      .string()
      .max(500)
      .optional()
      .transform((s) => (s === undefined || s.trim() === '' ? null : s)),
    featured: z.boolean(),
    active: z.boolean(),
    categoryIds: z.array(z.coerce.number().int().positive()).default([]),
    variants: z.array(variantSchema).min(1, 'Bar jedna varijanta'),
  })
  .superRefine((data, ctx) => {
    const defaults = data.variants.filter((v) => v.defaultVariant).length;
    if (defaults !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tačno jedna varijanta mora biti podrazumevana',
        path: ['variants'],
      });
    }
  });

export type ProductCreateFormInput = z.input<typeof productCreateSchema>;
export type ProductCreateFormValues = z.infer<typeof productCreateSchema>;

export const productUpdateSchema = z.object({
  brandId: z.coerce.number().int().positive('Izaberite brend'),
  name: z.string().trim().min(1, 'Naziv je obavezan').max(500),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug je obavezan')
    .max(255)
    .regex(slugPattern, 'Slug: mala slova, brojevi i crtice'),
  description: z
    .string()
    .max(4000)
    .optional()
    .transform((s) => (s === undefined || s.trim() === '' ? null : s)),
  shortDescription: z
    .string()
    .max(500)
    .optional()
    .transform((s) => (s === undefined || s.trim() === '' ? null : s)),
  featured: z.boolean(),
  active: z.boolean(),
  categoryIds: z.array(z.coerce.number().int().positive()).default([]),
});

export type ProductUpdateFormInput = z.input<typeof productUpdateSchema>;
export type ProductUpdateFormValues = z.infer<typeof productUpdateSchema>;
