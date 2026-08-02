import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { formatCurrency } from "@/components/product/price";
import { getNextOrderStatusOptions, orderStatusLabels } from "@/lib/admin/order-status";
import { prisma } from "@/lib/prisma";
import { updateOrderStatusAction } from "../actions";

type AdminOrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams?: Promise<{ view?: string; error?: string; success?: string }>;
};

const paymentStatuses = ["UNPAID", "AUTHORIZED", "PAID", "FAILED", "REFUNDED"] as const;

const messages = {
  errors: {
    validation: "Check the selected order and status values.",
    transition: "That status change is not allowed for the current order state.",
    "not-found": "That order could not be found.",
    failed: "The order status could not be updated.",
  },
  successes: {
    updated: "Order status updated.",
  },
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminOrderDetailPage({ params, searchParams }: AdminOrderDetailPageProps) {
  const { orderId } = await params;
  const query = await searchParams;
  const isInvoiceView = query?.view === "invoice";
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      address: true,
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          product: { select: { slug: true } },
          variant: { select: { stock: true, lowStockThreshold: true } },
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const returnTo = `/admin/orders/${order.id}${isInvoiceView ? "?view=invoice" : ""}`;

  return (
    <div>
      <AdminPageHeader
        eyebrow={isInvoiceView ? "Invoice" : "Order detail"}
        title={order.orderNumber}
        description="View customer information, delivery address, ordered SKU snapshots, and fulfillment controls."
      />

      <AdminActionMessage error={query?.error} messages={messages} success={query?.success} />

      <div className="mb-5 flex flex-wrap gap-3">
        <Link
          className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          href="/admin/orders"
        >
          Back to orders
        </Link>
        <Link
          className="inline-flex min-h-11 items-center rounded-md border border-border bg-surface px-4 text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          href={isInvoiceView ? `/admin/orders/${order.id}` : `/admin/orders/${order.id}?view=invoice`}
        >
          {isInvoiceView ? "View order details" : "View invoice"}
        </Link>
      </div>

      {isInvoiceView ? (
        <section className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-2xl font-bold text-text">A1 Haat Bazar</p>
              <p className="mt-1 text-sm text-text-muted">{order.fulfillmentType === "PICKUP" ? "Pay at pickup" : "Pay on delivery"} invoice</p>
            </div>
            <div className="text-sm sm:text-right">
              <p className="font-bold text-text">{order.orderNumber}</p>
              <p className="text-text-muted">{formatDate(order.createdAt)}</p>
              <p className="mt-1 font-semibold text-text">{orderStatusLabels[order.status]}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase text-text-muted">Bill to</p>
              <p className="mt-2 font-bold text-text">{order.user?.name ?? "Former customer"}</p>
              <p className="text-sm text-text-muted">{order.customerEmail}</p>
              {order.customerPhone ? <p className="text-sm text-text-muted">{order.customerPhone}</p> : null}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase text-text-muted">{order.fulfillmentType === "PICKUP" ? "Pickup" : "Deliver to"}</p>
              {order.fulfillmentType === "PICKUP" ? (
                <p className="mt-2 text-sm text-text-muted">Store pickup from A1 Haat Bazar.</p>
              ) : order.address ? (
                <div className="mt-2 text-sm leading-6 text-text-muted">
                  <p className="font-bold text-text">{order.address.fullName}</p>
                  <p>{order.address.line1}</p>
                  {order.address.line2 ? <p>{order.address.line2}</p> : null}
                  <p>
                    {order.address.suburb}, {order.address.state} {order.address.postalCode}
                  </p>
                  <p>{order.address.country}</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-text-muted">No address on file.</p>
              )}
            </div>
          </div>

          <div className="polished-scrollbar mt-6 overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-text-muted">
                <tr>
                  <th className="py-3 pr-4">Item</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Unit</th>
                  <th className="py-3 pl-4 text-right">Line</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-text">{item.productName}</p>
                      <p className="text-xs text-text-muted">{item.variantName}</p>
                    </td>
                    <td className="px-4 py-4 text-text-muted">{item.sku}</td>
                    <td className="px-4 py-4 text-right text-text-muted">{item.quantity}</td>
                    <td className="px-4 py-4 text-right text-text-muted">
                      {formatCurrency(Number(item.unitPrice.toString()), order.currency)}
                    </td>
                    <td className="py-4 pl-4 text-right font-bold text-text">
                      {formatCurrency(Number(item.lineTotal.toString()), order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5">
            <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <h2 className="text-xl font-bold text-text">Customer and fulfilment</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-border bg-surface-muted p-4">
                  <p className="text-xs font-semibold uppercase text-text-muted">Customer</p>
                  <p className="mt-2 font-bold text-text">{order.user?.name ?? "Former customer"}</p>
                  <p className="text-sm text-text-muted">{order.customerEmail}</p>
                  {order.customerPhone ? <p className="text-sm text-text-muted">{order.customerPhone}</p> : null}
                </div>
                <div className="rounded-md border border-border bg-surface-muted p-4">
                  <p className="text-xs font-semibold uppercase text-text-muted">{order.fulfillmentType === "PICKUP" ? "Store pickup" : "Delivery address"}</p>
                  {order.fulfillmentType === "PICKUP" ? (
                    <p className="mt-2 text-sm text-text-muted">Pickup is free. Contact the customer when the order is ready.</p>
                  ) : order.address ? (
                    <div className="mt-2 text-sm leading-6 text-text-muted">
                      <p className="font-bold text-text">{order.address.fullName}</p>
                      <p>{order.address.line1}</p>
                      {order.address.line2 ? <p>{order.address.line2}</p> : null}
                      <p>
                        {order.address.suburb}, {order.address.state} {order.address.postalCode}
                      </p>
                      <p>{order.address.country}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-text-muted">No address on file.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
              <div className="border-b border-border p-5">
                <h2 className="text-xl font-bold text-text">Ordered SKUs</h2>
                <p className="mt-1 text-sm text-text-muted">Product and variant details are stored as order snapshots.</p>
              </div>
              <div className="polished-scrollbar overflow-x-auto">
                <table className="min-w-[900px] w-full text-left text-sm">
                  <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3">Variant</th>
                      <th className="px-4 py-3">SKU</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">Current stock</th>
                      <th className="px-4 py-3">Line total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {order.items.map((item) => {
                      const stockTone =
                        item.variant.stock === 0
                          ? "text-danger"
                          : item.variant.stock <= item.variant.lowStockThreshold
                            ? "text-warning"
                            : "text-text";

                      return (
                        <tr className="align-top hover:bg-surface-muted/60" key={item.id}>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-text">{item.productName}</p>
                            <Link className="mt-1 block text-xs font-semibold text-cta-hover" href={`/products/${item.product.slug}`} scroll>
                              Storefront product
                            </Link>
                          </td>
                          <td className="px-4 py-4 text-text-muted">{item.variantName}</td>
                          <td className="px-4 py-4 text-text-muted">{item.sku}</td>
                          <td className="px-4 py-4 text-text-muted">{item.quantity}</td>
                          <td className={`px-4 py-4 font-semibold ${stockTone}`}>{item.variant.stock}</td>
                          <td className="px-4 py-4 font-semibold text-text">
                            {formatCurrency(Number(item.lineTotal.toString()), order.currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <aside className="rounded-lg border border-border bg-surface p-5 shadow-sm xl:sticky xl:top-6">
            <p className="text-sm font-semibold uppercase text-fresh">Fulfillment</p>
            <h2 className="mt-1 text-2xl font-bold text-text">{orderStatusLabels[order.status]}</h2>
            <p className="mt-2 text-sm text-text-muted">
              {order.fulfillmentType === "PICKUP" ? "Store pickup" : "Delivery"} / Placed {formatDate(order.createdAt)}
            </p>

            <form action={updateOrderStatusAction} className="mt-5 grid gap-4">
              <input name="orderId" type="hidden" value={order.id} />
              <input name="returnTo" type="hidden" value={returnTo} />
              <label className="block">
                <span className="text-sm font-semibold text-text">Order status</span>
                <select className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="status" defaultValue={order.status}>
                  {getNextOrderStatusOptions(order.status).map((item) => (
                    <option key={item} value={item}>{orderStatusLabels[item]}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-text">Payment status</span>
                <select className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="paymentStatus" defaultValue={order.paymentStatus}>
                  {paymentStatuses.map((item) => (
                    <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
                  ))}
                </select>
              </label>
              <button className="min-h-11 cursor-pointer rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" type="submit">
                Save status
              </button>
            </form>

            <div className="mt-6 grid gap-3 border-t border-border pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-text-muted">Subtotal</span>
                <span className="font-bold text-text">{formatCurrency(Number(order.subtotal.toString()), order.currency)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-text-muted">Discount</span>
                <span className="font-bold text-text">{formatCurrency(Number(order.discountTotal.toString()), order.currency)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-text-muted">{order.fulfillmentType === "PICKUP" ? "Pickup" : "Delivery"}</span>
                <span className="font-bold text-text">{order.fulfillmentType === "PICKUP" ? "Free" : formatCurrency(Number(order.shippingTotal.toString()), order.currency)}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-3">
                <span className="text-base font-bold text-text">Total</span>
                <span className="text-xl font-bold text-text">{formatCurrency(Number(order.total.toString()), order.currency)}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
