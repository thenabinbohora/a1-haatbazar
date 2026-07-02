import { z } from "zod";
import { sanitizeSlug } from "@/lib/slug";

const decimalText = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Use a valid amount with up to 2 decimals.");

const optionalDecimalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(decimalText.optional());

const relativeOrAbsoluteUrl = z.string().refine(
  (value) => {
    if (value.startsWith("/")) {
      return true;
    }

    return z.string().url().safeParse(value).success;
  },
  "Variant image must be a valid URL or a relative path starting with /.",
);

export const productVariantInputSchema = z
  .object({
    id: z.string().trim().optional(),
    sku: z.string().trim().min(2, "SKU is required.").max(80),
    name: z.string().trim().min(1, "Size or pack label is required.").max(120),
    price: decimalText,
    salePrice: optionalDecimalText,
    stock: z.coerce.number().int().min(0, "Stock cannot be negative.").max(999999),
    barcode: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value : undefined)),
    imageUrl: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value : undefined))
      .pipe(relativeOrAbsoluteUrl.optional()),
    isAvailable: z.boolean().default(true),
  })
  .refine(
    (variant) =>
      !variant.salePrice || Number.parseFloat(variant.salePrice) <= Number.parseFloat(variant.price),
    {
      message: "Sale price cannot be higher than price.",
      path: ["salePrice"],
    },
  );

export const productInputSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(180),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(220)
    .transform(sanitizeSlug)
    .refine((value) => value.length > 0, "Slug must include letters or numbers."),
  categoryId: z.string().trim().min(1, "Category is required."),
  brandId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  description: z.string().trim().min(10, "Description must be at least 10 characters.").max(5000),
  active: z.boolean().default(false),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  weeklyOffer: z.boolean().default(false),
  tags: z
    .string()
    .trim()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
            .slice(0, 20)
        : [],
    ),
  seoTitle: z
    .string()
    .trim()
    .max(180)
    .optional()
    .transform((value) => (value ? value : undefined)),
  seoDescription: z
    .string()
    .trim()
    .max(320)
    .optional()
    .transform((value) => (value ? value : undefined)),
  variants: z.array(productVariantInputSchema).min(1, "At least one variant is required."),
});

export type ProductInput = z.infer<typeof productInputSchema>;
