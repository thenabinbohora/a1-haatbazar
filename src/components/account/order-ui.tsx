import type { FulfillmentType, OrderStatus } from "@prisma/client";
import Link from "next/link";
import { AccountIcon } from "@/components/account/account-icons";
import { formatCurrency } from "@/components/product/price";
import {
  accountOrderProgress,
  formatAccountDate,
  fulfillmentLabel,
  orderStatusLabel,
  orderStatusTone,
} from "@/lib/customer-account";

type StatusBadgeProps = {
  fulfillmentType: FulfillmentType;
  status: OrderStatus;
};

export function OrderStatusBadge({
  fulfillmentType,
  status,
}: StatusBadgeProps) {
  const tone = orderStatusTone(status);
  const className = {
    active: "border-info/25 bg-sky-50 text-info",
    attention: "border-warning/25 bg-amber-50 text-warning",
    danger: "border-danger/25 bg-danger-soft text-danger",
    success: "border-fresh/25 bg-fresh-soft text-fresh",
  }[tone];

  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-extrabold ${className}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {orderStatusLabel(status, fulfillmentType)}
    </span>
  );
}

export type AccountOrderSummary = {
  _count: { items: number };
  createdAt: Date;
  currency: string;
  fulfillmentType: FulfillmentType;
  id: string;
  orderNumber: string;
  status: OrderStatus;
  total: { toString(): string };
};

export function AccountOrderRow({ order }: { order: AccountOrderSummary }) {
  const itemCount = order._count.items;
  const orderHref = `/account/orders/${encodeURIComponent(order.orderNumber)}`;

  return (
    <article className="rounded-2xl border border-border bg-surface p-4 transition-[border-color,box-shadow] duration-200 hover:border-primary/25 hover:shadow-[0_8px_24px_rgba(18,60,46,0.06)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <OrderStatusBadge
            fulfillmentType={order.fulfillmentType}
            status={order.status}
          />
          <h3 className="mt-2.5 break-words text-base font-black text-text [overflow-wrap:anywhere] sm:text-lg">
            {order.orderNumber}
          </h3>
          <p className="mt-1 text-sm leading-6 text-text-muted">
            {formatAccountDate(order.createdAt)} <span aria-hidden="true">·</span>{" "}
            {fulfillmentLabel(order.fulfillmentType)}{" "}
            <span aria-hidden="true">·</span> {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <p className="text-lg font-black tabular-nums text-primary">
            {formatCurrency(Number(order.total.toString()), order.currency)}
          </p>
          <Link
            className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-border bg-background px-3.5 text-sm font-extrabold text-text transition-colors hover:border-primary/30 hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href={orderHref}
          >
            View order
            <AccountIcon className="h-4 w-4" name="arrow-right" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function OrderProgress({
  fulfillmentType,
  status,
}: StatusBadgeProps) {
  const steps = accountOrderProgress(status, fulfillmentType);

  if (steps.length === 0) {
    return (
      <div
        className="rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm font-bold text-danger"
        role="status"
      >
        This order is {orderStatusLabel(status, fulfillmentType).toLowerCase()}.
      </div>
    );
  }

  return (
    <ol
      aria-label="Order progress"
      className="grid gap-0 sm:grid-flow-col sm:grid-cols-none sm:auto-cols-fr"
    >
      {steps.map((step, index) => (
        <li
          aria-current={step.state === "current" ? "step" : undefined}
          className="relative grid min-h-12 grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-2 pb-2 sm:block sm:min-h-0 sm:pb-0"
          key={step.label}
        >
          {index < steps.length - 1 ? (
            <span
              aria-hidden="true"
              className={[
                "absolute left-[0.8125rem] top-7 h-[calc(100%-1.1rem)] w-0.5 sm:left-[calc(50%+0.75rem)] sm:top-3.5 sm:h-0.5 sm:w-[calc(100%-1.5rem)]",
                step.state === "complete"
                  ? "bg-fresh"
                  : "bg-border",
              ].join(" ")}
            />
          ) : null}
          <span
            aria-hidden="true"
            className={[
              "relative z-10 grid h-7 w-7 place-items-center rounded-full border-2 sm:mx-auto",
              step.state === "complete"
                ? "border-fresh bg-fresh text-white"
                : step.state === "current"
                  ? "border-primary bg-surface text-primary"
                  : "border-border bg-surface text-text-muted",
            ].join(" ")}
          >
            {step.state === "complete" ? (
              <AccountIcon className="h-4 w-4" name="check" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
            )}
          </span>
          <span
            className={[
              "pt-0.5 text-sm font-bold sm:mt-2 sm:block sm:px-1 sm:text-center sm:text-xs",
              step.state === "upcoming" ? "text-text-muted" : "text-text",
            ].join(" ")}
          >
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
