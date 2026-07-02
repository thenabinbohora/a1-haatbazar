import { NextResponse } from "next/server";
import { cartQuoteRequestSchema } from "@/lib/validation/cart";
import { evaluateCoupon, normalizeCouponCode, numberFromDecimal } from "@/lib/coupons";
import { customerImageUrl } from "@/lib/customer-images";
import { customerImageAlt, customerProductName } from "@/lib/display";
import { prisma } from "@/lib/prisma";

function effectivePrice(priceValue: unknown, salePriceValue: unknown) {
  const price = numberFromDecimal(priceValue);
  const salePrice = salePriceValue ? numberFromDecimal(salePriceValue) : null;

  return salePrice && salePrice < price ? salePrice : price;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = cartQuoteRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart data." }, { status: 400 });
  }

  const normalizedItems = new Map<string, { productId: string; variantId: string; quantity: number }>();

  for (const item of parsed.data.items) {
    const existing = normalizedItems.get(item.variantId);

    normalizedItems.set(item.variantId, {
      productId: item.productId,
      variantId: item.variantId,
      quantity: Math.min((existing?.quantity ?? 0) + item.quantity, 99),
    });
  }

  const requestedItems = [...normalizedItems.values()];
  const couponCode = normalizeCouponCode(parsed.data.couponCode);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: requestedItems.map((item) => item.variantId) } },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          category: { select: { name: true, slug: true } },
          images: {
            orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
            select: { url: true, altText: true, isPrimary: true, variantId: true },
          },
        },
      },
    },
  });
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
  const coupon = couponCode
    ? await prisma.coupon.findUnique({
        where: { code: couponCode },
      })
    : null;

  const items = requestedItems.flatMap((item) => {
    const variant = variantsById.get(item.variantId);

    if (!variant || variant.productId !== item.productId) {
      return [
        {
          productId: item.productId,
          variantId: item.variantId,
          quantity: 0,
          requestedQuantity: item.quantity,
          stock: 0,
          unitPrice: 0,
          originalPrice: 0,
          currency: "AUD",
          lineTotal: 0,
          isAvailable: false,
          wasAdjusted: true,
          reason: "This cart item is no longer available.",
        product: {
          name: "Unavailable item",
            slug: "",
            categoryName: "Unavailable",
            imageUrl: null,
            imageAlt: "Unavailable cart item",
          },
          variant: {
            name: "Unavailable",
            sku: "Unavailable",
          },
        },
      ];
    }

    const image =
      variant.product.images.find((productImage) => productImage.variantId === variant.id && customerImageUrl(productImage.url)) ??
      variant.product.images.find((productImage) => productImage.isPrimary && !productImage.variantId && customerImageUrl(productImage.url)) ??
      variant.product.images.find((productImage) => !productImage.variantId && customerImageUrl(productImage.url));
    const isActive = variant.status === "ACTIVE" && variant.product.status === "ACTIVE";
    const stock = Math.max(variant.stock, 0);
    const quantity = isActive ? Math.min(item.quantity, stock) : 0;
    const unitPrice = effectivePrice(variant.price, variant.salePrice);
    const originalPrice = numberFromDecimal(variant.price);
    const isAvailable = isActive && stock > 0;

    return [
      {
        productId: variant.productId,
        variantId: variant.id,
        quantity,
        requestedQuantity: item.quantity,
        stock,
        unitPrice,
        originalPrice,
        currency: variant.currency,
        lineTotal: isAvailable ? unitPrice * quantity : 0,
        isAvailable,
        wasAdjusted: quantity !== item.quantity,
        reason: !isActive
          ? "This item is no longer available."
          : stock <= 0
            ? "This item is out of stock."
            : quantity !== item.quantity
              ? `Only ${stock} available.`
              : null,
        product: {
          name: customerProductName(variant.product.name),
          slug: variant.product.slug,
          categoryName: variant.product.category.name,
          imageUrl: customerImageUrl(image?.url) ?? customerImageUrl(variant.imageUrl),
          imageAlt: customerImageAlt(image?.altText, variant.product.name),
        },
        variant: {
          name: variant.name,
          sku: variant.sku,
        },
      },
    ];
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const couponResult = evaluateCoupon(coupon, subtotal, couponCode);
  const discount = couponResult?.isApplied ? couponResult.discount : 0;
  const estimatedTotal = Math.max(0, subtotal - discount);

  return NextResponse.json({
    items,
    coupon: couponResult,
    summary: {
      subtotal,
      discount,
      deliveryFee: null,
      estimatedTotal,
      currency: items.find((item) => item.currency)?.currency ?? "AUD",
    },
  });
}
