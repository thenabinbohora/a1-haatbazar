import type { OrderStatus, PaymentStatus } from "@prisma/client";

export const eligibleSalesOrderStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export function isEligibleSalesOrder(input: {
  currency?: string;
  excludedAsTest?: boolean;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
}) {
  return (
    input.paymentStatus === "PAID" &&
    eligibleSalesOrderStatuses.includes(input.status) &&
    (input.currency ?? "AUD") === "AUD" &&
    !input.excludedAsTest
  );
}

export function calculateSalesSummary(
  orders: Array<{
    currency?: string;
    excludedAsTest?: boolean;
    paymentStatus: PaymentStatus;
    status: OrderStatus;
    total: number;
  }>,
) {
  const eligible = orders.filter(isEligibleSalesOrder);
  const revenue = eligible.reduce((sum, order) => sum + order.total, 0);

  return {
    averageOrderValue: eligible.length > 0 ? revenue / eligible.length : 0,
    orderCount: eligible.length,
    revenue,
  };
}

export function getVariantStockState(input: {
  active: boolean;
  lowStockThreshold: number;
  stock: number;
}) {
  if (!input.active) {
    return "inactive" as const;
  }

  if (input.stock <= 0) {
    return "out" as const;
  }

  if (input.stock <= input.lowStockThreshold) {
    return "low" as const;
  }

  return "healthy" as const;
}
