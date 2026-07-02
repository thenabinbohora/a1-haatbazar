import { AccountNav } from "@/components/account/account-nav";
import { formatCurrency } from "@/components/product/price";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AccountOrdersPage() {
  const user = await requireCustomer();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { orderBy: { createdAt: "asc" } }, address: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="bg-background">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-fresh">Account</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-text sm:text-4xl">Order history</h1>
        <AccountNav />
        {orders.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-text">No orders yet</h2>
            <p className="mt-2 text-sm text-text-muted">When you place your first order, it will appear here.</p>
            <Link className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-bold text-white hover:bg-primary-muted" href="/products">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {orders.map((order) => (
              <article className="rounded-lg border border-border bg-surface p-5 shadow-sm" key={order.id}>
                <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-lg font-bold text-text">{order.orderNumber}</p>
                    <p className="text-sm text-text-muted">
                      {order.createdAt.toLocaleDateString()} / {order.fulfillmentType === "PICKUP" ? "Store pickup" : "Delivery"} / {order.status.replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      Payment: {order.fulfillmentType === "PICKUP" ? "Pay at pickup" : "Pay on delivery"}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-text">{formatCurrency(Number(order.total.toString()), order.currency)}</p>
                </div>
                {order.fulfillmentType === "DELIVERY" && order.address ? (
                  <div className="mt-4 rounded-md border border-border bg-surface-muted p-3 text-sm text-text-muted">
                    Delivery to {order.address.suburb}, {order.address.state} {order.address.postalCode}
                  </div>
                ) : (
                  <div className="mt-4 rounded-md border border-primary/20 bg-fresh-soft p-3 text-sm font-semibold text-primary">
                    Pickup is free. We will contact you when your order is ready.
                  </div>
                )}
                <div className="mt-4 grid gap-3">
                  {order.items.map((item) => (
                    <div className="grid gap-2 rounded-md bg-surface-muted p-3 sm:grid-cols-[1fr_auto] sm:items-start" key={item.id}>
                      <div>
                        <p className="font-semibold text-text">{item.productName}</p>
                        <p className="text-sm text-text-muted">{item.variantName} / SKU {item.sku} / Qty {item.quantity}</p>
                      </div>
                      <p className="font-bold text-text">{formatCurrency(Number(item.lineTotal.toString()), order.currency)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-muted" href="/products">
                    Shop again
                  </Link>
                  <Link className="rounded-md border border-border px-4 py-2 text-sm font-bold text-text hover:bg-surface-muted" href={`/checkout/success?order=${encodeURIComponent(order.orderNumber)}`}>
                    View details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
