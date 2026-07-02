import { z } from "zod";
import { cartStorageItemSchema } from "@/lib/validation/cart";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const checkoutInputSchema = z
  .object({
    cartItems: z.array(cartStorageItemSchema).min(1, "Your cart is empty.").max(100),
    fulfillmentMethod: z.enum(["DELIVERY", "PICKUP"]),
    customerName: z.string().trim().min(2, "Enter your full name.").max(120),
    customerEmail: z.string().trim().email("Enter a valid email address.").max(180).transform((value) => value.toLowerCase()),
    customerPhone: z.string().trim().min(7, "Enter a valid phone number.").max(40),
    addressLine1: optionalText,
    addressLine2: optionalText,
    suburb: optionalText,
    state: optionalText,
    postalCode: optionalText,
    country: optionalText.transform((value) => value ?? "Australia"),
    deliveryNotes: optionalText,
    pickupNotes: optionalText,
    couponCode: optionalText.transform((value) => value?.toUpperCase().replace(/\s+/g, "")),
    paymentMethod: z.enum(["PAY_ON_DELIVERY", "PAY_AT_PICKUP"]),
  })
  .superRefine((value, ctx) => {
    if (value.fulfillmentMethod === "DELIVERY") {
      const requiredFields = [
        ["addressLine1", "Enter a street address."],
        ["suburb", "Enter a suburb or city."],
        ["state", "Enter a state."],
        ["postalCode", "Enter a postcode."],
        ["country", "Enter a country."],
      ] as const;

      for (const [field, message] of requiredFields) {
        if (!value[field]) {
          ctx.addIssue({ code: "custom", path: [field], message });
        }
      }

      if (value.paymentMethod !== "PAY_ON_DELIVERY") {
        ctx.addIssue({ code: "custom", path: ["paymentMethod"], message: "Choose pay on delivery." });
      }
    }

    if (value.fulfillmentMethod === "PICKUP" && value.paymentMethod !== "PAY_AT_PICKUP") {
      ctx.addIssue({ code: "custom", path: ["paymentMethod"], message: "Choose pay at pickup." });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
