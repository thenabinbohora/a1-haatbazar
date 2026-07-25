"use server";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CHECKOUT_COMPLETION_COOKIE_NAME, checkoutCompletionCookieValue } from "@/lib/checkout-completion";
import { evaluateCoupon, normalizeCouponCode } from "@/lib/coupons";
import { customerProductName } from "@/lib/display";
import { prisma } from "@/lib/prisma";
import { checkoutInputSchema } from "@/lib/validation/checkout";

export type CheckoutActionState = {
  formError?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

class CheckoutActionError extends Error {
  constructor(message: string) {
    super(message);
  }
}

function numberFromDecimal(value: unknown) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return Number(value.toString());
}

function effectivePrice(priceValue: unknown, salePriceValue: unknown) {
  const price = numberFromDecimal(priceValue);
  const salePrice = salePriceValue ? numberFromDecimal(salePriceValue) : null;

  return salePrice && salePrice < price ? salePrice : price;
}

function money(value: number) {
  return value.toFixed(2);
}

function generateOrderNumber() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const suffix = randomBytes(3).toString("hex").toUpperCase();

  return `A1HB-${stamp}-${suffix}`;
}

function parseCartItems(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function createCheckoutOrderAction(
  _previousState: CheckoutActionState,
  formData: FormData,
): Promise<CheckoutActionState> {
  const parsed = checkoutInputSchema.safeParse({
    cartItems: parseCartItems(formData.get("cartItems")),
    fulfillmentMethod: String(formData.get("fulfillmentMethod") ?? ""),
    customerName: String(formData.get("customerName") ?? ""),
    customerEmail: String(formData.get("customerEmail") ?? ""),
    customerPhone: String(formData.get("customerPhone") ?? ""),
    addressLine1: String(formData.get("addressLine1") ?? ""),
    addressLine2: String(formData.get("addressLine2") ?? ""),
    suburb: String(formData.get("suburb") ?? ""),
    state: String(formData.get("state") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    country: String(formData.get("country") ?? "Australia"),
    deliveryNotes: String(formData.get("deliveryNotes") ?? ""),
    pickupNotes: String(formData.get("pickupNotes") ?? ""),
    couponCode: String(formData.get("couponCode") ?? ""),
    paymentMethod: String(formData.get("paymentMethod") ?? ""),
  });

  if (!parsed.success) {
    return {
      formError: "Check the highlighted checkout details.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const input = parsed.data;
  const normalizedItems = new Map<string, { productId: string; variantId: string; quantity: number }>();

  for (const item of input.cartItems) {
    const existing = normalizedItems.get(item.variantId);

    normalizedItems.set(item.variantId, {
      productId: item.productId,
      variantId: item.variantId,
      quantity: Math.min((existing?.quantity ?? 0) + item.quantity, 99),
    });
  }

  const cartItems = [...normalizedItems.values()];
  let orderNumber = "";

  try {
    orderNumber = await prisma.$transaction(async (tx) => {
      const variants = await tx.productVariant.findMany({
        where: { id: { in: cartItems.map((item) => item.variantId) } },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });
      const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
      const orderItems = cartItems.map((item) => {
        const variant = variantsById.get(item.variantId);

        if (!variant || variant.productId !== item.productId || variant.status !== "ACTIVE" || variant.product.status !== "ACTIVE") {
          throw new CheckoutActionError("One or more cart items are no longer available.");
        }

        if (variant.stock < item.quantity) {
          throw new CheckoutActionError(`${customerProductName(variant.product.name)} (${variant.name}) only has ${variant.stock} available.`);
        }

        const unitPrice = effectivePrice(variant.price, variant.salePrice);
        const originalPrice = numberFromDecimal(variant.price);
        const salePrice = variant.salePrice ? numberFromDecimal(variant.salePrice) : null;

        return {
          productId: variant.productId,
          variantId: variant.id,
          productName: customerProductName(variant.product.name),
          variantName: variant.name,
          sku: variant.sku,
          quantity: item.quantity,
          unitPrice,
          salePrice: salePrice && salePrice < originalPrice ? salePrice : null,
          lineTotal: unitPrice * item.quantity,
          stockBefore: variant.stock,
          stockAfter: variant.stock - item.quantity,
        };
      });

      const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);

      if (subtotal <= 0) {
        throw new CheckoutActionError("Your cart has no available items.");
      }

      const couponCode = normalizeCouponCode(input.couponCode);
      const coupon = couponCode
        ? await tx.coupon.findUnique({
            where: { code: couponCode },
          })
        : null;
      const couponResult = evaluateCoupon(coupon, subtotal, couponCode);

      if (couponCode && !couponResult?.isApplied) {
        throw new CheckoutActionError(couponResult?.message ?? "Invalid or expired coupon.");
      }

      const discountTotal = couponResult?.isApplied ? couponResult.discount : 0;
      const shippingTotal = 0;
      const total = Math.max(0, subtotal - discountTotal + shippingTotal);

      const user = await tx.user.upsert({
        where: { email: input.customerEmail },
        update: {
          name: input.customerName,
          phone: input.customerPhone,
        },
        create: {
          email: input.customerEmail,
          name: input.customerName,
          phone: input.customerPhone,
          role: "CUSTOMER",
          status: "ACTIVE",
        },
      });

      const address =
        input.fulfillmentMethod === "DELIVERY"
          ? await tx.address.create({
              data: {
                userId: user.id,
                type: "SHIPPING",
                label: "Checkout delivery address",
                fullName: input.customerName,
                phone: input.customerPhone,
                line1: input.addressLine1 ?? "",
                line2: input.addressLine2 ?? null,
                suburb: input.suburb ?? "",
                state: input.state ?? "",
                postalCode: input.postalCode ?? "",
                country: input.country,
                isDefault: false,
              },
            })
          : null;

      for (const item of orderItems) {
        const updateResult = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            status: "ACTIVE",
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updateResult.count !== 1) {
          throw new CheckoutActionError(`${item.productName} (${item.variantName}) is no longer available in that quantity.`);
        }

        await tx.inventoryLog.create({
          data: {
            variantId: item.variantId,
            userId: user.id,
            changeType: "SALE",
            reason: "ORDER_CREATED",
            quantityChange: -item.quantity,
            stockBefore: item.stockBefore,
            stockAfter: item.stockAfter,
            note: "Stock reduced by checkout order creation.",
          },
        });
      }

      const createdOrderNumber = generateOrderNumber();
      const order = await tx.order.create({
        data: {
          orderNumber: createdOrderNumber,
          userId: user.id,
          addressId: address?.id ?? null,
          couponId: couponResult?.isApplied && coupon ? coupon.id : null,
          status: "PENDING",
          paymentStatus: "UNPAID",
          fulfillmentType: input.fulfillmentMethod,
          subtotal: money(subtotal),
          discountTotal: money(discountTotal),
          shippingTotal: money(shippingTotal),
          taxTotal: "0.00",
          total: money(total),
          currency: "AUD",
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          notes: [
            `Fulfilment method: ${input.fulfillmentMethod === "DELIVERY" ? "Delivery" : "Store pickup"}`,
            `Payment method: ${input.fulfillmentMethod === "DELIVERY" ? "Pay on delivery" : "Pay at pickup"}`,
            couponResult?.isApplied ? `Coupon: ${couponResult.code} (${money(couponResult.discount)} discount)` : null,
            input.fulfillmentMethod === "DELIVERY" && input.deliveryNotes ? `Delivery notes: ${input.deliveryNotes}` : null,
            input.fulfillmentMethod === "PICKUP" && input.pickupNotes ? `Pickup notes: ${input.pickupNotes}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.productName,
              variantName: item.variantName,
              sku: item.sku,
              quantity: item.quantity,
              unitPrice: money(item.unitPrice),
              salePrice: item.salePrice ? money(item.salePrice) : null,
              lineTotal: money(item.lineTotal),
            })),
          },
        },
      });

      if (couponResult?.isApplied && coupon) {
        if (coupon.usageLimit !== null) {
          const couponUpdate = await tx.coupon.updateMany({
            where: { id: coupon.id, usedCount: { lt: coupon.usageLimit } },
            data: { usedCount: { increment: 1 } },
          });

          if (couponUpdate.count !== 1) {
            throw new CheckoutActionError("This coupon is no longer available.");
          }
        } else {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }

      return order.orderNumber;
    });
  } catch (error) {
    if (error instanceof CheckoutActionError) {
      return { formError: error.message };
    }

    return { formError: "The order could not be placed. Please review your cart and try again." };
  }

  const completionMarker = randomBytes(18).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set(
    CHECKOUT_COMPLETION_COOKIE_NAME,
    checkoutCompletionCookieValue(orderNumber, completionMarker),
    {
      httpOnly: true,
      maxAge: 300,
      path: "/checkout/success",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  );

  redirect(
    `/checkout/success?order=${encodeURIComponent(orderNumber)}&placed=${encodeURIComponent(completionMarker)}`,
  );
}
