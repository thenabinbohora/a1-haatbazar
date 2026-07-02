import type { Metadata } from "next";
import Link from "next/link";
import { OrderSuccessClient } from "@/components/checkout/order-success-client";
import { formatCurrency } from "@/components/product/price";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Order placed",
  description: "Your A1 Haat Bazar grocery order has been placed.",
};

type CheckoutSuccessPageProps = {
  searchParams?: Promise<{ order?: string }>;
};

function fulfillmentLabel(value?: string) {
  return value === "PICKUP" ? "Store pickup" : "Delivery";
}

function paymentLabel(value?: string) {
  return value === "PICKUP" ? "Pay at pickup" : "Pay on delivery";
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const params = await searchParams;
  const orderNumber = params?.order?.trim() ?? "";
  const order = orderNumber
    ? await prisma.order.findUnique({
        where: { orderNumber },
        include: {
          user: { select: { name: true, email: true } },
          address: true,
          items: { orderBy: { createdAt: "asc" } },
        },
      })
    : null;
  const isPickup = order?.fulfillmentType === "PICKUP";

  return (
    <div className="bg-background">
      <OrderSuccessClient />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase text-fresh">Order placed</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-text sm:text-4xl">Thank you for your order</h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-text-muted">
              {isPickup
                ? "We will contact you when your order is packed and ready for pickup."
                : "Our team will confirm stock availability and delivery details before completing your order."}
            </p>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <div className="grid gap-4">
              <section className="rounded-lg border border-border bg-surface-muted p-5">
                <h2 className="text-xl font-bold text-text">Order details</h2>
                <div className="mt-4 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-text-muted">Order number</span>
                    <span className="font-bold text-text">{order?.orderNumber ?? (orderNumber || "Unavailable")}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-text-muted">Fulfilment method</span>
                    <span className="font-bold text-text">{fulfillmentLabel(order?.fulfillmentType)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-text-muted">Payment method</span>
                    <span className="font-bold text-text">{paymentLabel(order?.fulfillmentType)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-text-muted">Payment status</span>
                    <span className="font-bold text-text">Unpaid until {isPickup ? "pickup" : "delivery"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
                    <span className="font-semibold text-text-muted">Estimated total</span>
                    <span className="text-lg font-bold text-text">
                      {order ? formatCurrency(Number(order.total.toString()), order.currency) : "To be confirmed"}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border bg-surface-muted p-5">
                <h2 className="text-xl font-bold text-text">Customer contact</h2>
                <div className="mt-3 text-sm leading-6 text-text-muted">
                  <p className="font-bold text-text">{order?.user.name ?? "Customer"}</p>
                  <p>{order?.customerEmail ?? order?.user.email ?? "Email unavailable"}</p>
                  {order?.customerPhone ? <p>{order.customerPhone}</p> : null}
                </div>
              </section>

              {isPickup ? (
                <section className="rounded-lg border border-primary/20 bg-fresh-soft p-5">
                  <h2 className="text-xl font-bold text-primary">Pickup instructions</h2>
                  <p className="mt-2 text-sm leading-6 text-primary">
                    Pick up from A1 Haat Bazar. We will contact you when your order is ready.
                  </p>
                </section>
              ) : order?.address ? (
                <section className="rounded-lg border border-border bg-surface-muted p-5">
                  <h2 className="text-xl font-bold text-text">Delivery address</h2>
                  <div className="mt-3 text-sm leading-6 text-text-muted">
                    <p className="font-bold text-text">{order.address.fullName}</p>
                    <p>{order.address.line1}</p>
                    {order.address.line2 ? <p>{order.address.line2}</p> : null}
                    <p>
                      {order.address.suburb}, {order.address.state} {order.address.postalCode}
                    </p>
                    <p>{order.address.country}</p>
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <h2 className="text-xl font-bold text-text">Order items</h2>
              <div className="mt-4 grid gap-3">
                {order?.items.length ? (
                  order.items.map((item) => (
                    <div className="rounded-md border border-border bg-surface-muted p-3" key={item.id}>
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-bold text-text">{item.productName}</p>
                          <p className="mt-1 text-xs font-semibold text-text-muted">
                            {item.variantName} / SKU {item.sku} / Qty {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-text">{formatCurrency(Number(item.lineTotal.toString()), order.currency)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-text-muted">Order items are unavailable.</p>
                )}
              </div>
              {order ? (
                <div className="mt-5 grid gap-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-text-muted">Subtotal</span>
                    <span className="font-bold text-text">{formatCurrency(Number(order.subtotal.toString()), order.currency)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-text-muted">Discount</span>
                    <span className="font-bold text-text">{formatCurrency(Number(order.discountTotal.toString()), order.currency)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-text-muted">{isPickup ? "Pickup" : "Delivery fee"}</span>
                    <span className="font-bold text-text">{isPickup ? "Free" : "Confirmed by staff"}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-border pt-3">
                    <span className="text-base font-bold text-text">Total</span>
                    <span className="text-xl font-bold text-text">{formatCurrency(Number(order.total.toString()), order.currency)}</span>
                  </div>
                </div>
              ) : null}
            </aside>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href="/products"
            >
              Continue shopping
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href="/account/orders"
            >
              View order
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
