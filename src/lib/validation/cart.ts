import { z } from "zod";

export const cartStorageItemSchema = z.object({
  productId: z.string().trim().min(1),
  variantId: z.string().trim().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const cartQuoteRequestSchema = z.object({
  items: z.array(cartStorageItemSchema).max(100),
  couponCode: z.string().trim().max(40).optional(),
});

export type CartStorageItemInput = z.infer<typeof cartStorageItemSchema>;
