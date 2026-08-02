import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AccountIcon } from "@/components/account/account-icons";
import { CustomerAccountShell } from "@/components/account/customer-account-shell";
import {
  OrderProgress,
  OrderStatusBadge,
} from "@/components/account/order-ui";
import { formatCurrency } from "@/components/product/price";
import { BUSINESS_CONFIG } from "@/config/business";
import { requireCustomer } from "@/lib/auth";
import {
  formatAccountDateTime,
  fulfilmentPaymentLabel,
  fulfillmentLabel,
  paymentStatusLabel,
} from "@/lib/customer-account";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Order details",
  description: "Review an A1 Haat Bazar grocery order.",
  robots: { index: false },
};

type AccountOrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AccountOrderDetailPage({
  params,
}: AccountOrderDetailPageProps) {
  const user = await requireCustomer("/account/orders");
  const { id } = await params;
  const order = await prisma.order.findFirst({
    include: {
      address: true,
      items: { orderBy: { createdAt: "asc" } },
    },
    where: {
      orderNumber: id,
      userId: user.id,
    },
  });

  if (!order) {
    notFound();
  }

  const supportHref = `mailto:${BUSINESS_CONFIG.publicEmail}?subject=${encodeURIComponent(
    `Help with order ${order.orderNumber}`,
  )}`;

  return (
    <CustomerAccountShell
      description={`Placed ${formatAccountDateTime(order.createdAt)} · ${fulfillmentLabel(order.fulfillmentType)}`}
      title={order.orderNumber}
      user={user}
    >
      <Link
        className="mb-4 hidden min-h-11 w-fit items-center gap-1.5 rounded-lg px-1 text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta lg:inline-flex"
        href="/account/orders"
      >
        <AccountIcon className="h-5 w-5" name="arrow-left" />
        Back to orders
      </Link>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.7fr)]">
        <div className="grid min-w-0 gap-5">
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-fresh">
                  Fulfilment status
                </p>
                <h2 className="mt-1 text-xl font-black text-text">
                  Where your order is up to
                </h2>
              </div>
              <OrderStatusBadge
                fulfillmentType={order.fulfillmentType}
                status={order.status}
              />
            </div>
            <div className="mt-6">
              <OrderProgress
                fulfillmentType={order.fulfillmentType}
                status={order.status}
              />
            </div>
            {order.fulfillmentType === "PICKUP" &&
            !["CANCELLED", "REFUNDED", "DELIVERED"].includes(order.status) ? (
              <p className="mt-5 rounded-xl border border-fresh/20 bg-fresh-soft px-4 py-3 text-sm font-semibold leading-6 text-primary">
                {BUSINESS_CONFIG.pickup.readinessNotice}
              </p>
            ) : null}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-6">
            <h2 className="text-xl font-black text-text">Items</h2>
            <p className="mt-1 text-sm text-text-muted">
              {order.items.reduce((total, item) => total + item.quantity, 0)}{" "}
              {order.items.reduce((total, item) => total + item.quantity, 0) ===
              1
                ? "item"
                : "items"}{" "}
              in this order
            </p>
            <div className="mt-4 divide-y divide-border rounded-xl border border-border">
              {order.items.map((item) => (
                <div
                  className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
                  key={item.id}
                >
                  <div className="min-w-0">
                    <h3 className="break-words font-black text-text [overflow-wrap:anywhere]">
                      {item.productName}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {item.variantName} <span aria-hidden="true">·</span>{" "}
                      Quantity {item.quantity}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {formatCurrency(
                        Number(
                          (item.salePrice ?? item.unitPrice).toString(),
                        ),
                        order.currency,
                      )}{" "}
                      each
                    </p>
                  </div>
                  <p className="font-black tabular-nums text-primary">
                    {formatCurrency(
                      Number(item.lineTotal.toString()),
                      order.currency,
                    )}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-5">
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-5">
            <h2 className="text-lg font-black text-text">
              {fulfillmentLabel(order.fulfillmentType)}
            </h2>
            {order.fulfillmentType === "DELIVERY" && order.address ? (
              <address className="mt-3 not-italic text-sm leading-6 text-text-muted">
                <span className="font-bold text-text">
                  {order.address.fullName}
                </span>
                <br />
                {order.address.line1}
                <br />
                {order.address.line2 ? (
                  <>
                    {order.address.line2}
                    <br />
                  </>
                ) : null}
                {order.address.suburb} {order.address.state}{" "}
                {order.address.postalCode}
              </address>
            ) : (
              <address className="mt-3 not-italic text-sm leading-6 text-text-muted">
                <span className="font-bold text-text">
                  {BUSINESS_CONFIG.tradingName}
                </span>
                <br />
                {BUSINESS_CONFIG.address.formatted}
              </address>
            )}
            <p className="mt-3 border-t border-border pt-3 text-sm font-semibold text-text-muted">
              {fulfilmentPaymentLabel(order.fulfillmentType)}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              {paymentStatusLabel(order.paymentStatus)}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-5">
            <h2 className="text-lg font-black text-text">Order summary</h2>
            <dl className="mt-4 grid gap-2.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Subtotal</dt>
                <dd className="font-bold tabular-nums text-text">
                  {formatCurrency(
                    Number(order.subtotal.toString()),
                    order.currency,
                  )}
                </dd>
              </div>
              {Number(order.discountTotal.toString()) > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">Discount</dt>
                  <dd className="font-bold tabular-nums text-fresh">
                    −
                    {formatCurrency(
                      Number(order.discountTotal.toString()),
                      order.currency,
                    )}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-text-muted">Delivery</dt>
                <dd className="font-bold tabular-nums text-text">
                  {Number(order.shippingTotal.toString()) === 0
                    ? "Free"
                    : formatCurrency(
                        Number(order.shippingTotal.toString()),
                        order.currency,
                      )}
                </dd>
              </div>
              {Number(order.taxTotal.toString()) > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">Tax</dt>
                  <dd className="font-bold tabular-nums text-text">
                    {formatCurrency(
                      Number(order.taxTotal.toString()),
                      order.currency,
                    )}
                  </dd>
                </div>
              ) : null}
              <div className="mt-1 flex justify-between gap-3 border-t border-border pt-3 text-base">
                <dt className="font-black text-text">Total</dt>
                <dd className="font-black tabular-nums text-primary">
                  {formatCurrency(
                    Number(order.total.toString()),
                    order.currency,
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-5">
            <h2 className="text-lg font-black text-text">Need help?</h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Contact the store and your order reference will be included in
              the email subject.
            </p>
            <a
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-extrabold text-text transition-colors hover:border-primary/25 hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href={supportHref}
            >
              <AccountIcon className="h-4.5 w-4.5" name="mail" />
              Contact store
            </a>
          </section>
        </aside>
      </div>
    </CustomerAccountShell>
  );
}
