import type { Metadata } from "next";
import { AccountNav } from "@/components/account/account-nav";
import { formatCurrency } from "@/components/product/price";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My orders",
  description: "Track your A1 Haat Bazar grocery orders.",
  robots: { index: false },
};

export default async function AccountOrdersPage() {
  const user = await requireCustomer("/account/orders");
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { orderBy: { createdAt: "asc" } }, address: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-dvh bg-background">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
        <header className="mb-5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-fresh">Your account</p>
          <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-text sm:text-4xl">Order history</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
            Review order totals, fulfilment details, payment method, and every item in your grocery orders.
          </p>
        </header>
        <AccountNav />
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center shadow-sm sm:p-12">
            <span aria-hidden="true" className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-fresh-soft text-2xl font-black text-primary">A1</span>
            <h2 className="mt-5 text-2xl font-black text-text">No orders yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">When you place your first grocery order, its items and status will appear here.</p>
            <Link className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" href="/products">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5">
            {orders.map((order) => (
              <article className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm" key={order.id}>
                <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words text-lg font-black text-text [overflow-wrap:anywhere] sm:text-xl">{order.orderNumber}</h2>
                      <span
                        className={[
                          "rounded-full border px-2.5 py-1 text-xs font-extrabold uppercase tracking-[0.06em]",
                          order.status === "CANCELLED"
                            ? "border-danger/25 bg-danger-soft text-danger"
                            : order.status === "DELIVERED"
                              ? "border-fresh/25 bg-fresh-soft text-fresh"
                              : "border-cta/30 bg-cta-soft text-cta-hover",
                        ].join(" ")}
                      >
                        {order.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-text-muted">Placed {order.createdAt.toLocaleDateString()}</p>
                    <p className="mt-1 text-sm text-text-muted">
                      {order.fulfillmentType === "PICKUP" ? "Store pickup / Pay at pickup" : "Local delivery / Pay on delivery"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-background px-4 py-3 sm:text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.1em] text-text-muted">Order total</p>
                    <p className="mt-1 text-xl font-black tabular-nums text-primary">{formatCurrency(Number(order.total.toString()), order.currency)}</p>
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  {order.fulfillmentType === "DELIVERY" && order.address ? (
                    <div className="rounded-xl border border-border bg-background p-4 text-sm leading-6 text-text-muted">
                      <span className="font-bold text-text">Delivery address:</span> {order.address.suburb}, {order.address.state} {order.address.postalCode}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-fresh/25 bg-fresh-soft p-4 text-sm font-semibold leading-6 text-primary">
                      Pickup is free. We will contact you when your order is ready.
                    </div>
                  )}
                  <div className="mt-4 grid gap-2.5">
                    {order.items.map((item) => (
                      <div className="grid gap-2 rounded-xl border border-border bg-surface-muted p-3.5 sm:grid-cols-[1fr_auto] sm:items-start" key={item.id}>
                        <div>
                          <p className="break-words font-bold text-text [overflow-wrap:anywhere]">{item.productName}</p>
                          <p className="mt-1 break-words text-sm text-text-muted [overflow-wrap:anywhere]">{item.variantName} / SKU {item.sku} / Qty {item.quantity}</p>
                        </div>
                        <p className="font-black tabular-nums text-text">{formatCurrency(Number(item.lineTotal.toString()), order.currency)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3 border-t border-border pt-5">
                    <Link className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" href="/products">
                      Shop again
                    </Link>
                    <Link className="inline-flex min-h-11 items-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold text-text transition-colors hover:border-primary/30 hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" href={`/checkout/success?order=${encodeURIComponent(order.orderNumber)}`}>
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
