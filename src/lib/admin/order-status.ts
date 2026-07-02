import type { OrderStatus } from "@prisma/client";

export const adminOrderStatusOptions = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const satisfies readonly OrderStatus[];

export type AdminOrderStatus = (typeof adminOrderStatusOptions)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Packed",
  READY_FOR_PICKUP: "Ready for pickup",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const allowedTransitions: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  PENDING: ["PENDING", "CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CONFIRMED", "PROCESSING", "CANCELLED"],
  PROCESSING: ["PROCESSING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "CANCELLED"],
  READY_FOR_PICKUP: ["READY_FOR_PICKUP", "DELIVERED", "CANCELLED"],
  OUT_FOR_DELIVERY: ["OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
  DELIVERED: ["DELIVERED"],
  CANCELLED: ["CANCELLED"],
};

export function isAdminOrderStatus(status: OrderStatus): status is AdminOrderStatus {
  return adminOrderStatusOptions.includes(status as AdminOrderStatus);
}

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus) {
  if (!isAdminOrderStatus(from) || !isAdminOrderStatus(to)) {
    return from === to;
  }

  return allowedTransitions[from].includes(to);
}

export function getNextOrderStatusOptions(status: OrderStatus) {
  if (!isAdminOrderStatus(status)) {
    return [status];
  }

  return allowedTransitions[status];
}
