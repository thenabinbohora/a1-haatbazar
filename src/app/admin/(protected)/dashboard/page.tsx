import Link from "next/link";
import type { CSSProperties } from "react";
import { AdminEmptyState } from "@/components/admin/admin-states";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { formatCurrency } from "@/components/product/price";
import { orderStatusLabels } from "@/lib/admin/order-status";
import { prisma } from "@/lib/prisma";

async function getDashboardMetrics() {
  const [totalProducts, activeProducts, totalOrders, openOrders, variants, salesAggregate, recentOrders, stockAlerts] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.order.count(),
    prisma.order.count({
      where: {
        status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY"] },
      },
    }),
    prisma.productVariant.findMany({
      select: {
        stock: true,
        lowStockThreshold: true,
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { notIn: ["CANCELLED", "REFUNDED"] } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        customerEmail: true,
        status: true,
        fulfillmentType: true,
        total: true,
        currency: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.productVariant.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ stock: 0 }, { stock: { lte: 5 } }],
      },
      orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
      take: 6,
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        lowStockThreshold: true,
        product: { select: { name: true } },
      },
    }),
  ]);

  const lowStock = variants.filter(
    (variant) => variant.stock > 0 && variant.stock <= variant.lowStockThreshold,
  ).length;
  const outOfStock = variants.filter((variant) => variant.stock <= 0).length;
  const totalSales = Number(salesAggregate._sum.total?.toString() ?? 0);

  return {
    totalProducts,
    activeProducts,
    totalOrders,
    openOrders,
    lowStock,
    outOfStock,
    totalSales,
    recentOrders,
    stockAlerts,
  };
}

function MetricCard({
  label,
  value,
  helper,
  tone = "default",
}: {
  label: string;
  value: string | number;
  helper: string;
  tone?: "default" | "warning" | "danger" | "fresh";
}) {
  const toneColor = {
    default: "#174A27",
    warning: "#C6922E",
    danger: "#B42318",
    fresh: "#2E6B3C",
  }[tone];

  return (
    <article className="a1-admin-kpi p-5 pl-6" style={{ "--a1-kpi-tone": toneColor } as CSSProperties}>
      <p className="text-sm font-semibold text-text-muted">{label}</p>
      <p className="mt-3 text-3xl font-extrabold tabular-nums text-text">{value}</p>
      <p className="mt-2 text-sm leading-6 text-text-muted">{helper}</p>
    </article>
  );
}

export default async function AdminDashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Operations overview"
        title="Dashboard"
        description="A protected admin snapshot for catalog, order, coupon, and inventory health."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Dashboard metrics">
        <MetricCard
          helper={`${metrics.activeProducts} active and visible in the catalog.`}
          label="Total products"
          value={metrics.totalProducts}
          tone="fresh"
        />
        <MetricCard
          helper={`${metrics.openOrders} orders still need operational attention.`}
          label="Total orders"
          value={metrics.totalOrders}
        />
        <MetricCard
          helper="Variants at or below threshold."
          label="Low stock"
          value={metrics.lowStock}
          tone="warning"
        />
        <MetricCard
          helper="Variants with no sellable stock."
          label="Out of stock"
          value={metrics.outOfStock}
          tone="danger"
        />
        <MetricCard
          helper="Non-cancelled order revenue recorded so far."
          label="Total sales"
          value={formatCurrency(metrics.totalSales, "AUD")}
          tone="fresh"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="a1-admin-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-fresh">Fulfillment queue</p>
            <h2 className="mt-1 text-xl font-extrabold text-text">Recent orders</h2>
          </div>
          {metrics.recentOrders.length ? (
            <div className="divide-y divide-border">
              {metrics.recentOrders.map((order) => (
                <Link
                  className="grid gap-3 px-5 py-4 transition-colors hover:bg-fresh-soft/70 sm:grid-cols-[1fr_auto]"
                  href={`/admin/orders/${order.id}`}
                  key={order.id}
                >
                  <span>
                    <span className="block text-sm font-bold text-text">{order.orderNumber}</span>
                    <span className="mt-1 block text-xs font-semibold text-text-muted">
                      {order.customerEmail} / {order._count.items} item{order._count.items === 1 ? "" : "s"}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-text-muted">
                      {order.fulfillmentType === "PICKUP" ? "Store pickup" : "Delivery"} / {order.createdAt.toLocaleDateString()}
                    </span>
                  </span>
                  <span className="text-left sm:text-right">
                    <span className="block text-sm font-extrabold text-primary">
                      {formatCurrency(Number(order.total.toString()), order.currency)}
                    </span>
                    <span className="mt-1 inline-flex rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs font-bold text-text-muted">
                      {orderStatusLabels[order.status]}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <AdminEmptyState
                title="No orders yet"
                description="Recent checkout activity will appear here once customers place orders."
              />
            </div>
          )}
        </div>

        <div className="a1-admin-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-warning">Stock watch</p>
            <h2 className="mt-1 text-xl font-extrabold text-text">Inventory alerts</h2>
          </div>
          {metrics.stockAlerts.length ? (
            <div className="divide-y divide-border">
              {metrics.stockAlerts.map((variant) => (
                <Link
                  className="grid gap-3 px-5 py-4 transition-colors hover:bg-cta-soft/70 sm:grid-cols-[1fr_auto]"
                  href={`/admin/inventory?q=${encodeURIComponent(variant.sku)}`}
                  key={variant.id}
                >
                  <span>
                    <span className="block text-sm font-bold text-text">{variant.product.name}</span>
                    <span className="mt-1 block text-xs font-semibold text-text-muted">
                      {variant.name} / SKU {variant.sku}
                    </span>
                  </span>
                  <span className="text-left sm:text-right">
                    <span className={variant.stock === 0 ? "text-sm font-extrabold text-danger" : "text-sm font-extrabold text-warning"}>
                      {variant.stock} left
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-text-muted">Low at {variant.lowStockThreshold}</span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <AdminEmptyState
                title="Stock looks healthy"
                description="Low-stock and out-of-stock variants will surface here automatically."
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
