import type { CouponType } from "@prisma/client";

export type CouponForEvaluation = {
  id: string;
  code: string;
  name: string;
  type: CouponType;
  value: unknown;
  minimumSubtotal: unknown | null;
  maxDiscount: unknown | null;
  usageLimit: number | null;
  usedCount: number;
  startsAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
};

export type CouponEvaluation =
  | {
      isApplied: true;
      code: string;
      name: string;
      discount: number;
      message: string;
    }
  | {
      isApplied: false;
      code: string;
      name?: string;
      discount: 0;
      message: string;
    };

export function normalizeCouponCode(value?: string | null) {
  return value?.trim().toUpperCase().replace(/\s+/g, "") ?? "";
}

export function numberFromDecimal(value: unknown) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return Number(value.toString());
}

function roundMoney(value: number) {
  return Math.max(0, Math.round(value * 100) / 100);
}

export function evaluateCoupon(
  coupon: CouponForEvaluation | null,
  subtotal: number,
  requestedCode: string,
  now = new Date(),
): CouponEvaluation | null {
  const code = normalizeCouponCode(requestedCode);

  if (!code) {
    return null;
  }

  if (!coupon) {
    return {
      isApplied: false,
      code,
      discount: 0,
      message: "Invalid or expired coupon.",
    };
  }

  if (!coupon.isActive || (coupon.startsAt && coupon.startsAt > now) || (coupon.expiresAt && coupon.expiresAt < now)) {
    return {
      isApplied: false,
      code,
      name: coupon.name,
      discount: 0,
      message: "Invalid or expired coupon.",
    };
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return {
      isApplied: false,
      code,
      name: coupon.name,
      discount: 0,
      message: "This coupon has already been fully used.",
    };
  }

  const minimumSubtotal = numberFromDecimal(coupon.minimumSubtotal);

  if (minimumSubtotal > 0 && subtotal < minimumSubtotal) {
    return {
      isApplied: false,
      code,
      name: coupon.name,
      discount: 0,
      message: `Spend ${new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(
        minimumSubtotal,
      )} to use this coupon.`,
    };
  }

  const value = numberFromDecimal(coupon.value);
  const maxDiscount = numberFromDecimal(coupon.maxDiscount);
  const rawDiscount = coupon.type === "PERCENT" ? subtotal * (value / 100) : value;
  const cappedDiscount = maxDiscount > 0 ? Math.min(rawDiscount, maxDiscount) : rawDiscount;
  const discount = roundMoney(Math.min(cappedDiscount, subtotal));

  if (discount <= 0) {
    return {
      isApplied: false,
      code,
      name: coupon.name,
      discount: 0,
      message: "This coupon does not apply to the current cart.",
    };
  }

  return {
    isApplied: true,
    code,
    name: coupon.name,
    discount,
    message: "Coupon applied.",
  };
}
