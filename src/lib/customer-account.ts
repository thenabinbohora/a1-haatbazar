import type { FulfillmentType, OrderStatus, PaymentStatus } from "@prisma/client";

const ADELAIDE_TIME_ZONE = "Australia/Adelaide";

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Order received",
  CONFIRMED: "Confirmed",
  PROCESSING: "Preparing",
  READY_FOR_PICKUP: "Ready for pickup",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  UNPAID: "Payment due at fulfilment",
  AUTHORIZED: "Payment authorised",
  PAID: "Paid",
  FAILED: "Payment issue",
  REFUNDED: "Refunded",
};

export type AccountOrderProgressStep = {
  label: string;
  state: "complete" | "current" | "upcoming";
};

export function customerFirstName(name: string | null | undefined) {
  const normalisedName = name?.trim().replace(/\s+/g, " ");

  if (!normalisedName) {
    return null;
  }

  return normalisedName.split(" ")[0] || null;
}

export function customerGreeting(name: string | null | undefined) {
  const firstName = customerFirstName(name);
  return firstName ? `Welcome back, ${firstName}` : "Welcome back";
}

export function formatAccountDate(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    timeZone: ADELAIDE_TIME_ZONE,
    year: "numeric",
  }).format(date);
}

export function formatAccountDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZone: ADELAIDE_TIME_ZONE,
    year: "numeric",
  }).format(date);
}

export function orderStatusLabel(
  status: OrderStatus,
  fulfillmentType?: FulfillmentType,
) {
  if (status === "DELIVERED" && fulfillmentType === "PICKUP") {
    return "Completed";
  }

  return statusLabels[status];
}

export function orderStatusTone(status: OrderStatus) {
  if (status === "CANCELLED" || status === "REFUNDED") {
    return "danger" as const;
  }

  if (status === "DELIVERED") {
    return "success" as const;
  }

  if (status === "READY_FOR_PICKUP" || status === "OUT_FOR_DELIVERY") {
    return "attention" as const;
  }

  return "active" as const;
}

export function paymentStatusLabel(status: PaymentStatus) {
  return paymentStatusLabels[status];
}

export function fulfillmentLabel(fulfillmentType: FulfillmentType) {
  return fulfillmentType === "PICKUP" ? "Store pickup" : "Local delivery";
}

export function fulfilmentPaymentLabel(fulfillmentType: FulfillmentType) {
  return fulfillmentType === "PICKUP" ? "Pay at pickup" : "Pay on delivery";
}

export function isActiveOrder(status: OrderStatus) {
  return !["DELIVERED", "CANCELLED", "REFUNDED"].includes(status);
}

export function accountOrderProgress(
  status: OrderStatus,
  fulfillmentType: FulfillmentType,
): AccountOrderProgressStep[] {
  if (status === "CANCELLED" || status === "REFUNDED") {
    return [];
  }

  const flow: Array<{ statuses: OrderStatus[]; label: string }> =
    fulfillmentType === "PICKUP"
      ? [
          { label: "Order received", statuses: ["PENDING"] },
          { label: "Confirmed", statuses: ["CONFIRMED"] },
          { label: "Preparing", statuses: ["PROCESSING"] },
          {
            label: "Ready for pickup",
            statuses: ["READY_FOR_PICKUP", "DELIVERED"],
          },
        ]
      : [
          { label: "Order received", statuses: ["PENDING"] },
          { label: "Confirmed", statuses: ["CONFIRMED"] },
          { label: "Preparing", statuses: ["PROCESSING"] },
          { label: "Out for delivery", statuses: ["OUT_FOR_DELIVERY"] },
          { label: "Delivered", statuses: ["DELIVERED"] },
        ];

  let currentIndex = flow.findIndex((step) => step.statuses.includes(status));

  if (status === "READY_FOR_PICKUP" && fulfillmentType === "DELIVERY") {
    currentIndex = 2;
  }

  if (currentIndex < 0) {
    currentIndex = 0;
  }

  return flow.map((step, index) => ({
    label: step.label,
    state:
      index < currentIndex
        ? "complete"
        : index === currentIndex
          ? "current"
          : "upcoming",
  }));
}

export function addressLocalitySummary(address: {
  postalCode: string;
  state: string;
  suburb: string;
}) {
  return `${address.suburb} ${address.state} ${address.postalCode}`;
}
