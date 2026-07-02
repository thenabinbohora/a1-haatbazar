import { z } from "zod";
import { sanitizeSlug } from "@/lib/slug";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const optionalUrl = optionalText.pipe(z.string().url("Use a valid URL.").optional());

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

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? new Date(value) : undefined))
  .refine((value) => !value || !Number.isNaN(value.getTime()), "Use a valid date.");

const relativeOrAbsoluteUrl = optionalText.refine(
  (value) => {
    if (!value) {
      return true;
    }

    if (value.startsWith("/")) {
      return true;
    }

    return z.string().url().safeParse(value).success;
  },
  "Use a valid URL or a relative path starting with /.",
);

export const categoryInputSchema = z.object({
  id: optionalText,
  name: z.string().trim().min(2, "Category name is required.").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(160)
    .transform(sanitizeSlug)
    .refine((value) => value.length > 0, "Slug must include letters or numbers."),
  description: optionalText,
  imageUrl: relativeOrAbsoluteUrl,
  parentId: optionalText,
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

export const couponInputSchema = z
  .object({
    id: optionalText,
    code: z
      .string()
      .trim()
      .min(2, "Coupon code is required.")
      .max(40)
      .transform((value) => value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
      .refine((value) => value.length > 0, "Coupon code must include letters or numbers."),
    name: z.string().trim().min(2, "Coupon name is required.").max(140),
    type: z.enum(["PERCENT", "FIXED_AMOUNT"]),
    value: decimalText,
    minimumSubtotal: optionalDecimalText,
    maxDiscount: optionalDecimalText,
    usageLimit: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? Number.parseInt(value, 10) : undefined))
      .refine((value) => value === undefined || (Number.isInteger(value) && value > 0), "Usage limit must be positive."),
    startsAt: optionalDate,
    expiresAt: optionalDate,
    isActive: z.boolean().default(false),
  })
  .refine((coupon) => coupon.type !== "PERCENT" || Number.parseFloat(coupon.value) <= 100, {
    message: "Percent coupons cannot be greater than 100.",
    path: ["value"],
  })
  .refine((coupon) => !coupon.startsAt || !coupon.expiresAt || coupon.startsAt <= coupon.expiresAt, {
    message: "Start date must be before expiry date.",
    path: ["expiresAt"],
  });

export const bannerInputSchema = z
  .object({
    id: optionalText,
    title: z.string().trim().min(2, "Banner title is required.").max(140),
    subtitle: optionalText,
    imageUrl: optionalUrl,
    linkUrl: relativeOrAbsoluteUrl,
    placement: z.enum(["HOME_HERO", "HOME_STRIP", "CATEGORY_TOP"]),
    sortOrder: z.coerce.number().int().min(0).max(9999),
    startsAt: optionalDate,
    endsAt: optionalDate,
    isActive: z.boolean().default(false),
  })
  .refine((banner) => !banner.startsAt || !banner.endsAt || banner.startsAt <= banner.endsAt, {
    message: "Start date must be before end date.",
    path: ["endsAt"],
  });

export const orderStatusInputSchema = z.object({
  orderId: z.string().trim().min(1),
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"]),
  paymentStatus: z.enum(["UNPAID", "AUTHORIZED", "PAID", "FAILED", "REFUNDED"]),
});

export const inventoryAdjustmentInputSchema = z.object({
  variantId: z.string().trim().min(1, "Select a variant."),
  quantityChange: z.coerce
    .number()
    .int()
    .min(-999999)
    .max(999999)
    .refine((value) => value !== 0, "Adjustment cannot be zero."),
  reason: z.enum(["MANUAL_ADMIN", "SUPPLIER_RESTOCK", "DAMAGE", "CORRECTION"]),
  note: optionalText,
});
