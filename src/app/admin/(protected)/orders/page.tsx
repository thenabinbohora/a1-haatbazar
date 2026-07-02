import Link from "next/link";
import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { AdminEmptyState } from "@/components/admin/admin-states";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { formatCurrency } from "@/components/product/price";
import { adminOrderStatusOptions, getNextOrderStatusOptions, orderStatusLabels } from "@/lib/admin/order-status";
import { prisma } from "@/lib/prisma";
import { updateOrderStatusAction } from "./actions";

type OrdersPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    error?: string;
    success?: string;
  }>;
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

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const status = params?.status ?? "";

  const orders = await prisma.order.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { orderNumber: { contains: query, mode: "insensitive" } },
              { customerEmail: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(status && adminOrderStatusOptions.includes(status as (typeof adminOrderStatusOptions)[number])
        ? { status: status as (typeof adminOrderStatusOptions)[number] }
        : {}),
    },
    include: {
      user: { select: { email: true, name: true } },
      address: { select: { suburb: true, state: true, postalCode: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Fulfillment"
        title="Orders"
        description="Search orders, review fulfillment details, and move orders through validated status transitions."
      />

      <AdminActionMessage error={params?.error} messages={messages} success={params?.success} />

      <form className="mb-5 grid gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm lg:grid-cols-[1fr_240px_auto]">
        <label className="block">
          <span className="text-sm font-semibold text-text">Search</span>
          <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" defaultValue={query} name="q" placeholder="Order number or customer email" type="search" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-text">Status</span>
          <select className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" defaultValue={status} name="status">
            <option value="">Any status</option>
            {adminOrderStatusOptions.map((item) => (
              <option key={item} value={item}>{orderStatusLabels[item]}</option>
            ))}
          </select>
        </label>
        <button className="mt-7 min-h-11 cursor-pointer rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" type="submit">
          Filter
        </button>
      </form>

      {orders.length === 0 ? (
        <AdminEmptyState title="No orders found" description="Orders will appear here after checkout creates them." />
      ) : (
        <div className="polished-scrollbar overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
          <table className="min-w-[1180px] w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Fulfillment</th>
                <th className="px-4 py-3">Links</th>
                <th className="px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr className="align-top hover:bg-surface-muted/60" key={order.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-text">{order.orderNumber}</p>
                    <p className="mt-1 text-xs text-text-muted">{order.createdAt.toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-text">{order.user.name ?? "Customer"}</p>
                    <p className="mt-1 text-xs text-text-muted">{order.customerEmail}</p>
                    {order.address ? (
                      <p className="mt-1 text-xs text-text-muted">
                        {order.address.suburb}, {order.address.state} {order.address.postalCode}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-text-muted">{order._count.items}</td>
                  <td className="px-4 py-4 text-text-muted">{formatCurrency(Number(order.total.toString()), order.currency)}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-text">{orderStatusLabels[order.status]}</p>
                    <p className="mt-1 text-xs text-text-muted">{order.fulfillmentType === "PICKUP" ? "Store pickup" : "Delivery"}</p>
                    <p className="mt-1 text-xs text-text-muted">{order.paymentStatus.replaceAll("_", " ")}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="grid gap-2">
                      <Link className="font-semibold text-cta-hover hover:text-cta" href={`/admin/orders/${order.id}`}>
                        View details
                      </Link>
                      <Link className="font-semibold text-text-muted hover:text-text" href={`/admin/orders/${order.id}?view=invoice`}>
                        Invoice
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <form action={updateOrderStatusAction} className="grid gap-2">
                      <input name="orderId" type="hidden" value={order.id} />
                      <input name="returnTo" type="hidden" value="/admin/orders" />
                      <select className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="status" defaultValue={order.status}>
                        {getNextOrderStatusOptions(order.status).map((item) => (
                          <option key={item} value={item}>{orderStatusLabels[item]}</option>
                        ))}
                      </select>
                      <select className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="paymentStatus" defaultValue={order.paymentStatus}>
                        {paymentStatuses.map((item) => (
                          <option key={item} value={item}>{item.replaceAll("_", " ")}</option>
                        ))}
                      </select>
                      <button className="min-h-10 cursor-pointer rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" type="submit">
                        Save status
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
