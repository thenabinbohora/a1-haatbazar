import type { OrderStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { AdminDashboardChart } from "@/components/admin/admin-dashboard-chart";
import { AdminDashboardRefresh } from "@/components/admin/admin-dashboard-refresh";
import { AdminIcon, type AdminIconName } from "@/components/admin/admin-icons";
import {
  dashboardRangeKeys,
  getDashboardCatalogue,
  getDashboardInventoryAlerts,
  getDashboardOperations,
  getDashboardPeriodSummary,
  getDashboardPromotions,
  getDashboardRecentOrders,
  getDashboardTopProducts,
  getDashboardTrend,
  parseDashboardRange,
} from "@/lib/admin/dashboard-data";
import { orderStatusLabels } from "@/lib/admin/order-status";
import {
  formatAdminCurrency,
  formatAdminDateTime,
  formatAdminNumber,
  formatAdminShortDate,
  STORE_TIME_ZONE,
} from "@/lib/admin-format";
import { requireAdmin } from "@/lib/auth";

type DashboardPageProps = {
  searchParams?: Promise<{ range?: string }>;
};

const statusOrder: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const statusStyles: Record<OrderStatus, string> = {
  CANCELLED: "border-[#d8d9d4] bg-[#f2f2ef] text-[#5d6660]",
  CONFIRMED: "border-[#b9d9c4] bg-[#edf7f0] text-[#23613c]",
  DELIVERED: "border-[#b9d9c4] bg-[#edf7f0] text-[#23613c]",
  OUT_FOR_DELIVERY: "border-[#bad8e8] bg-[#edf7fc] text-[#075d87]",
  PENDING: "border-[#efd5a4] bg-[#fff7e8] text-[#805000]",
  PROCESSING: "border-[#efd5a4] bg-[#fff7e8] text-[#805000]",
  READY_FOR_PICKUP: "border-[#d2c5e7] bg-[#f5f0fb] text-[#63428b]",
  REFUNDED: "border-[#edc0bd] bg-[#fff0ef] text-[#9c2f28]",
};

function greeting(hour: number) {
  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function percentageChange(current: number, previous: number) {
  if (previous <= 0) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function comparisonText(
  current: number,
  previous: number,
  unit: string,
) {
  const change = percentageChange(current, previous);

  if (change === null) {
    return previous === 0
      ? `No eligible ${unit} in the previous period.`
      : `Previous-period comparison unavailable.`;
  }

  const direction = change > 0 ? "up" : change < 0 ? "down" : "unchanged";

  return direction === "unchanged"
    ? `Unchanged from the previous period.`
    : `${Math.abs(change).toFixed(1)}% ${direction} from the previous period.`;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={[
        "inline-flex rounded-lg border px-2 py-1 text-xs font-bold",
        statusStyles[status],
      ].join(" ")}
    >
      {orderStatusLabels[status]}
    </span>
  );
}

function MetricCard({
  context,
  href,
  icon,
  label,
  tone = "neutral",
  value,
}: {
  context: string;
  href: string;
  icon: AdminIconName;
  label: string;
  tone?: "danger" | "fresh" | "neutral" | "warning";
  value: string;
}) {
  const toneColor = {
    danger: "#b42318",
    fresh: "#2f6d4a",
    neutral: "#536159",
    warning: "#9a6409",
  }[tone];

  return (
    <Link
      className="a1-admin-kpi group flex min-h-40 min-w-0 flex-col p-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:p-5"
      href={href}
      style={{ "--a1-kpi-tone": toneColor } as CSSProperties}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <p className="min-w-0 break-words text-sm font-bold text-text-muted">
          {label}
        </p>
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-muted text-primary"
          style={{ color: toneColor }}
        >
          <AdminIcon className="h-4.5 w-4.5" name={icon} />
        </span>
      </div>
      <p className="mt-3 break-words text-[1.7rem] font-extrabold leading-none tabular-nums text-text sm:text-[2rem]">
        {value}
      </p>
      <p className="mt-3 text-xs leading-5 text-text-muted">{context}</p>
      <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-extrabold text-primary">
        View details
        <AdminIcon
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          name="chevron-right"
        />
      </span>
    </Link>
  );
}

function PanelHeader({
  action,
  eyebrow,
  title,
}: {
  action?: React.ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-5">
      <div>
        <p className="text-[0.67rem] font-extrabold uppercase tracking-[0.14em] text-fresh">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-lg font-extrabold text-text sm:text-xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function WidgetError({
  rangeKey,
  title,
}: {
  rangeKey: string;
  title: string;
}) {
  return (
    <div className="m-4 rounded-xl border border-danger/25 bg-danger-soft px-4 py-4">
      <p className="font-bold text-danger">{title}</p>
      <p className="mt-1 text-sm text-text-muted">
        This section could not be refreshed. Other dashboard data remains
        available.
      </p>
      <Link
        className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-danger/25 bg-white px-3 text-sm font-bold text-danger hover:bg-danger-soft"
        href={`/admin/dashboard?range=${rangeKey}`}
      >
        <AdminIcon className="h-4 w-4" name="refresh" />
        Try again
      </Link>
    </div>
  );
}

function DashboardEmptyState({
  description,
  href,
  linkLabel,
  title,
}: {
  description: string;
  href?: string;
  linkLabel?: string;
  title: string;
}) {
  return (
    <div className="px-5 py-8 text-center">
      <p className="font-extrabold text-text">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-text-muted">
        {description}
      </p>
      {href && linkLabel ? (
        <Link
          className="mt-3 inline-flex min-h-10 items-center gap-1 text-sm font-extrabold text-primary hover:text-fresh"
          href={href}
        >
          {linkLabel}
          <AdminIcon className="h-4 w-4" name="chevron-right" />
        </Link>
      ) : null}
    </div>
  );
}

export default async function AdminDashboardPage({
  searchParams,
}: DashboardPageProps) {
  const [params, user] = await Promise.all([searchParams, requireAdmin()]);
  const range = parseDashboardRange(params?.range);
  const now = new Date();
  const localHour = Number(
    new Intl.DateTimeFormat("en-AU", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: STORE_TIME_ZONE,
    }).format(now),
  );
  const [
    periodResult,
    operationsResult,
    trendResult,
    catalogueResult,
    recentOrdersResult,
    inventoryResult,
    topProductsResult,
    promotionsResult,
  ] = await Promise.allSettled([
    getDashboardPeriodSummary(range),
    getDashboardOperations(range),
    getDashboardTrend(range),
    getDashboardCatalogue(),
    getDashboardRecentOrders(),
    getDashboardInventoryAlerts(),
    getDashboardTopProducts(range),
    getDashboardPromotions(now),
  ]);

  const period =
    periodResult.status === "fulfilled" ? periodResult.value : null;
  const operations =
    operationsResult.status === "fulfilled" ? operationsResult.value : null;
  const trend = trendResult.status === "fulfilled" ? trendResult.value : null;
  const catalogue =
    catalogueResult.status === "fulfilled" ? catalogueResult.value : null;
  const recentOrders =
    recentOrdersResult.status === "fulfilled"
      ? recentOrdersResult.value
      : null;
  const inventoryAlerts =
    inventoryResult.status === "fulfilled" ? inventoryResult.value : null;
  const topProducts =
    topProductsResult.status === "fulfilled" ? topProductsResult.value : null;
  const promotions =
    promotionsResult.status === "fulfilled" ? promotionsResult.value : null;
  const administratorName =
    user.name?.trim().split(/\s+/)[0] || "Administrator";
  const statusTotal = operations
    ? statusOrder.reduce(
        (total, status) => total + (operations.statusCounts[status] ?? 0),
        0,
      )
    : 0;

  return (
    <div>
      <header className="mb-5 flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-fresh">
            Operations overview
          </p>
          <h1 className="mt-1 text-2xl font-extrabold leading-tight text-primary sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm leading-6 text-text-muted">
            {greeting(localHour)}, {administratorName}. Here is what needs
            attention today.
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Last updated {formatAdminDateTime(now)} · {STORE_TIME_ZONE}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <nav
            aria-label="Dashboard date range"
            className="a1-no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-white p-1"
          >
            {dashboardRangeKeys.map((rangeKey) => {
              const option = parseDashboardRange(rangeKey, now);
              const selected = range.key === rangeKey;

              return (
                <Link
                  aria-label={option.label}
                  aria-current={selected ? "page" : undefined}
                  className={[
                    "flex min-h-9 shrink-0 items-center rounded-lg px-3 text-xs font-bold transition-colors",
                    selected
                      ? "bg-primary text-white"
                      : "text-text-muted hover:bg-surface-muted hover:text-text",
                  ].join(" ")}
                  href={`/admin/dashboard?range=${rangeKey}`}
                  key={rangeKey}
                >
                  {rangeKey === "previous-month" ? "Prev month" : option.label}
                </Link>
              );
            })}
          </nav>
          <AdminDashboardRefresh />
        </div>
      </header>

      <section
        aria-label="Dashboard metrics"
        className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6"
      >
        <MetricCard
          context={
            period
              ? comparisonText(
                  period.revenue,
                  period.previousRevenue,
                  "paid revenue",
                )
              : "Paid revenue is temporarily unavailable."
          }
          href={`/admin/orders?metric=eligible-sales&range=${range.key}`}
          icon="trend"
          label={`Revenue · ${range.label}`}
          tone="fresh"
          value={period ? formatAdminCurrency(period.revenue) : "—"}
        />
        <MetricCard
          context={
            period
              ? comparisonText(
                  period.orderCount,
                  period.previousOrderCount,
                  "orders",
                )
              : "Eligible order volume is temporarily unavailable."
          }
          href={`/admin/orders?metric=eligible-sales&range=${range.key}`}
          icon="orders"
          label={`Paid orders · ${range.label}`}
          value={period ? formatAdminNumber(period.orderCount) : "—"}
        />
        <MetricCard
          context={
            period
              ? period.orderCount > 0
                ? "Eligible revenue divided by eligible paid orders."
                : "No eligible paid orders in this period."
              : "Average order value is temporarily unavailable."
          }
          href={`/admin/orders?metric=eligible-sales&range=${range.key}`}
          icon="activity"
          label="Average order value"
          value={
            period ? formatAdminCurrency(period.averageOrderValue) : "—"
          }
        />
        <MetricCard
          context={
            operations
              ? `${operations.fulfillment.awaitingConfirmation} awaiting confirmation now.`
              : "Current fulfilment data is temporarily unavailable."
          }
          href="/admin/orders"
          icon="orders"
          label="Pending fulfilment"
          tone="warning"
          value={
            operations?.inventory.pendingOrders === null ||
            operations?.inventory.pendingOrders === undefined
              ? "—"
              : formatAdminNumber(operations.inventory.pendingOrders)
          }
        />
        <MetricCard
          context="Active variants at or below their configured threshold."
          href="/admin/inventory?stock=low"
          icon="inventory"
          label="Low stock"
          tone="warning"
          value={
            operations?.inventory.lowStock === null ||
            operations?.inventory.lowStock === undefined
              ? "—"
              : formatAdminNumber(operations.inventory.lowStock)
          }
        />
        <MetricCard
          context={
            catalogue
              ? `No sellable stock; ${formatAdminNumber(catalogue.active)} products are active.`
              : "Catalogue context is temporarily unavailable."
          }
          href="/admin/inventory?stock=out"
          icon="box"
          label="Out of stock"
          tone="danger"
          value={
            operations?.inventory.outOfStock === null ||
            operations?.inventory.outOfStock === undefined
              ? "—"
              : formatAdminNumber(operations.inventory.outOfStock)
          }
        />
      </section>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section className="a1-admin-card overflow-hidden xl:col-span-8">
          <PanelHeader
            action={
              <span className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-bold text-text-muted">
                {range.label}
              </span>
            }
            eyebrow="Paid order performance"
            title="Sales overview"
          />
          {trend ? (
            <AdminDashboardChart points={trend} rangeLabel={range.label} />
          ) : (
            <WidgetError
              rangeKey={range.key}
              title="Sales data could not be loaded"
            />
          )}
        </section>

        <section className="a1-admin-card overflow-hidden xl:col-span-4">
          <PanelHeader eyebrow="Work requiring attention" title="Fulfilment overview" />
          {operations ? (
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    href: "/admin/orders?status=PENDING",
                    label: "Awaiting confirmation",
                    value: operations.fulfillment.awaitingConfirmation,
                  },
                  {
                    href: "/admin/orders",
                    label: "Being prepared",
                    value: operations.fulfillment.beingPrepared,
                  },
                  {
                    href: "/admin/orders?status=READY_FOR_PICKUP",
                    label: "Ready for pickup",
                    value: operations.fulfillment.readyForPickup,
                  },
                  {
                    href: "/admin/orders?status=OUT_FOR_DELIVERY",
                    label: "Out for delivery",
                    value: operations.fulfillment.delivery,
                  },
                ].map((item) => (
                  <Link
                    className="rounded-xl border border-border bg-[#fafaf7] p-3 hover:border-primary/25 hover:bg-fresh-soft"
                    href={item.href}
                    key={item.label}
                  >
                    <span className="block text-2xl font-extrabold tabular-nums text-text">
                      {formatAdminNumber(item.value)}
                    </span>
                    <span className="mt-1 block text-xs font-semibold leading-5 text-text-muted">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-extrabold text-text">
                    Order status · {range.label}
                  </h3>
                  <span className="text-xs font-bold tabular-nums text-text-muted">
                    {formatAdminNumber(statusTotal)} total
                  </span>
                </div>
                {statusTotal > 0 ? (
                  <div className="mt-3 space-y-2.5">
                    {statusOrder
                      .filter(
                        (status) => (operations.statusCounts[status] ?? 0) > 0,
                      )
                      .map((status) => {
                        const count = operations.statusCounts[status] ?? 0;
                        const width = (count / statusTotal) * 100;

                        return (
                          <Link
                            className="group block"
                            href={`/admin/orders?status=${status}`}
                            key={status}
                          >
                            <span className="flex items-center justify-between gap-3 text-xs">
                              <span className="font-semibold text-text-muted group-hover:text-primary">
                                {orderStatusLabels[status]}
                              </span>
                              <span className="font-extrabold tabular-nums text-text">
                                {formatAdminNumber(count)}
                              </span>
                            </span>
                            <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-surface-muted">
                              <span
                                className="block h-full rounded-full bg-fresh"
                                style={{ width: `${Math.max(width, 3)}%` }}
                              />
                            </span>
                          </Link>
                        );
                      })}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-text-muted">
                    No orders were recorded in this period.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <WidgetError
              rangeKey={range.key}
              title="Fulfilment data could not be loaded"
            />
          )}
        </section>

        <section className="a1-admin-card overflow-hidden xl:col-span-8">
          <PanelHeader
            action={
              <Link
                className="flex min-h-10 items-center gap-1 text-sm font-extrabold text-primary hover:text-fresh"
                href="/admin/orders"
              >
                View all
                <AdminIcon className="h-4 w-4" name="chevron-right" />
              </Link>
            }
            eyebrow="Latest customer orders"
            title="Recent orders"
          />
          {recentOrders === null ? (
            <WidgetError
              rangeKey={range.key}
              title="Recent orders are temporarily unavailable"
            />
          ) : recentOrders.length === 0 ? (
            <DashboardEmptyState
              description="New customer orders will appear here."
              title="No orders yet"
            />
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[780px] text-left text-sm">
                  <thead className="border-b border-border bg-[#fafaf7] text-xs text-text-muted">
                    <tr>
                      <th className="px-5 py-3 font-bold">Order</th>
                      <th className="px-4 py-3 font-bold">Customer</th>
                      <th className="px-4 py-3 font-bold">Fulfilment</th>
                      <th className="px-4 py-3 font-bold">Placed</th>
                      <th className="px-4 py-3 text-right font-bold">Total</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-5 py-3 text-right font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-5 py-4">
                          <p className="font-extrabold text-text">
                            {order.orderNumber}
                          </p>
                          <p className="mt-0.5 text-xs text-text-muted">
                            {order._count.items} item
                            {order._count.items === 1 ? "" : "s"}
                          </p>
                        </td>
                        <td className="max-w-52 px-4 py-4">
                          <p className="truncate text-text-muted">
                            {order.customerEmail}
                          </p>
                          {order.isLikelyTestRecord ? (
                            <span className="mt-1 inline-flex rounded-md bg-[#f2f2ef] px-1.5 py-0.5 text-[0.66rem] font-bold text-text-muted">
                              Potential test record
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-4 text-text-muted">
                          {order.fulfillmentType === "PICKUP"
                            ? "Store pickup"
                            : "Delivery"}
                        </td>
                        <td className="px-4 py-4 text-text-muted">
                          {formatAdminDateTime(order.createdAt)}
                        </td>
                        <td className="px-4 py-4 text-right font-extrabold tabular-nums text-text">
                          {formatAdminCurrency(order.total, order.currency)}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            className="inline-flex min-h-10 items-center font-extrabold text-primary hover:text-fresh"
                            href={`/admin/orders/${order.id}`}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-border md:hidden">
                {recentOrders.map((order) => (
                  <article className="p-4" key={order.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words text-sm font-extrabold text-text [overflow-wrap:anywhere]">
                          {order.orderNumber}
                        </p>
                        <div className="mt-1">
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                      <p className="shrink-0 font-extrabold tabular-nums text-primary">
                        {formatAdminCurrency(order.total, order.currency)}
                      </p>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-text-muted">
                      {order.fulfillmentType === "PICKUP"
                        ? "Store pickup"
                        : "Delivery"}{" "}
                      · {order._count.items} item
                      {order._count.items === 1 ? "" : "s"}
                      <br />
                      {formatAdminDateTime(order.createdAt)}
                    </p>
                    <Link
                      className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-extrabold text-primary"
                      href={`/admin/orders/${order.id}`}
                    >
                      View order
                      <AdminIcon className="h-4 w-4" name="chevron-right" />
                    </Link>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="a1-admin-card overflow-hidden xl:col-span-4">
          <PanelHeader
            action={
              <Link
                className="flex min-h-10 items-center gap-1 text-sm font-extrabold text-primary hover:text-fresh"
                href="/admin/inventory"
              >
                View all
                <AdminIcon className="h-4 w-4" name="chevron-right" />
              </Link>
            }
            eyebrow="Current variant thresholds"
            title="Inventory watch"
          />
          {inventoryAlerts === null ? (
            <WidgetError
              rangeKey={range.key}
              title="Inventory alerts could not be loaded"
            />
          ) : inventoryAlerts.length === 0 ? (
            <DashboardEmptyState
              description="No active variants are below their configured stock threshold."
              href="/admin/inventory"
              linkLabel="View inventory"
              title="Inventory looks healthy"
            />
          ) : (
            <div className="divide-y divide-border">
              {inventoryAlerts.map((variant) => (
                <Link
                  className="flex min-h-[76px] items-center gap-3 px-4 py-3 hover:bg-surface-muted sm:px-5"
                  href={`/admin/inventory?q=${encodeURIComponent(variant.sku)}`}
                  key={variant.id}
                >
                  <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-white text-primary">
                    {variant.imageUrl ? (
                      <Image
                        alt=""
                        className="object-contain p-1"
                        fill
                        sizes="44px"
                        src={variant.imageUrl}
                      />
                    ) : (
                      <AdminIcon className="h-5 w-5" name="box" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-extrabold text-text">
                      {variant.productName}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-text-muted">
                      {variant.name} · {variant.sku}
                    </span>
                    <span
                      className={[
                        "mt-1 block text-xs font-bold",
                        variant.stock <= 0 ? "text-danger" : "text-warning",
                      ].join(" ")}
                    >
                      {variant.stock <= 0
                        ? "Out of stock"
                        : `${variant.stock} remaining`}{" "}
                      · Threshold {variant.lowStockThreshold}
                    </span>
                  </span>
                  <AdminIcon
                    className="h-4 w-4 shrink-0 text-text-muted"
                    name="chevron-right"
                  />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="a1-admin-card overflow-hidden xl:col-span-6">
          <PanelHeader
            action={
              <span className="rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-bold text-text-muted">
                {range.label}
              </span>
            }
            eyebrow="Paid non-cancelled orders"
            title="Top products"
          />
          {topProducts === null ? (
            <WidgetError
              rangeKey={range.key}
              title="Top products could not be loaded"
            />
          ) : topProducts.length === 0 ? (
            <DashboardEmptyState
              description="Top products will appear after eligible paid orders are recorded."
              title="No product sales in this period"
            />
          ) : (
            <ol className="divide-y divide-border">
              {topProducts.map((product, index) => (
                <li key={product.productId}>
                  <Link
                    className="flex min-h-[76px] items-center gap-3 px-4 py-3 hover:bg-surface-muted sm:px-5"
                    href={`/admin/products/${product.productId}/edit`}
                  >
                    <span className="w-5 shrink-0 text-center text-sm font-black text-text-muted">
                      {index + 1}
                    </span>
                    <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-white text-primary">
                      {product.imageUrl ? (
                        <Image
                          alt=""
                          className="object-contain p-1"
                          fill
                          sizes="44px"
                          src={product.imageUrl}
                        />
                      ) : (
                        <AdminIcon className="h-5 w-5" name="box" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-extrabold text-text">
                        {product.name}
                      </span>
                      <span className="mt-0.5 block text-xs text-text-muted">
                        {formatAdminNumber(product.unitsSold)} units ·{" "}
                        {formatAdminCurrency(product.revenue)}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-xs font-bold text-text-muted">
                        Current stock
                      </span>
                      <span className="block text-sm font-extrabold tabular-nums text-text">
                        {formatAdminNumber(product.currentStock)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="a1-admin-card overflow-hidden xl:col-span-3">
          <PanelHeader eyebrow="Current storefront health" title="Promotions" />
          {promotions ? (
            <div className="p-4 sm:p-5">
              <dl className="space-y-3">
                {[
                  ["Active weekly offers", promotions.weeklyOffers],
                  ["Active coupons", promotions.activeCoupons],
                  ["Coupons expiring in 7 days", promotions.expiringCoupons],
                  ["Active banners", promotions.activeBanners],
                  ["Scheduled banners", promotions.scheduledBanners],
                ].map(([label, value]) => (
                  <div
                    className="flex items-center justify-between gap-3"
                    key={label}
                  >
                    <dt className="text-sm text-text-muted">{label}</dt>
                    <dd className="font-extrabold tabular-nums text-text">
                      {formatAdminNumber(Number(value))}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 grid gap-2 border-t border-border pt-4">
                <Link
                  className="flex min-h-10 items-center justify-between rounded-lg px-2 text-sm font-bold text-primary hover:bg-fresh-soft"
                  href="/admin/coupons"
                >
                  Manage coupons
                  <AdminIcon className="h-4 w-4" name="chevron-right" />
                </Link>
                <Link
                  className="flex min-h-10 items-center justify-between rounded-lg px-2 text-sm font-bold text-primary hover:bg-fresh-soft"
                  href="/admin/banners"
                >
                  Manage banners
                  <AdminIcon className="h-4 w-4" name="chevron-right" />
                </Link>
              </div>
            </div>
          ) : (
            <WidgetError
              rangeKey={range.key}
              title="Promotion health could not be loaded"
            />
          )}
        </section>

        <section className="a1-admin-card overflow-hidden xl:col-span-3">
          <PanelHeader eyebrow="Common admin tasks" title="Quick actions" />
          <div className="grid grid-cols-2 gap-2 p-4">
            {[
              {
                href: "/admin/products/new",
                icon: "box" as const,
                label: "Add product",
              },
              {
                href: "/admin/inventory",
                icon: "inventory" as const,
                label: "Update stock",
              },
              {
                href: "/admin/orders?status=PENDING",
                icon: "orders" as const,
                label: "Pending orders",
              },
              {
                href: "/admin/coupons#new-coupon",
                icon: "coupon" as const,
                label: "Create coupon",
              },
              {
                href: "/admin/banners#new-banner",
                icon: "banner" as const,
                label: "Add banner",
              },
              {
                href: "/",
                icon: "store" as const,
                label: "Storefront",
              },
            ].map((item) => (
              <Link
                className="flex min-h-[82px] flex-col justify-between rounded-xl border border-border bg-[#fafaf7] p-3 text-sm font-extrabold text-text hover:border-primary/25 hover:bg-fresh-soft hover:text-primary"
                href={item.href}
                key={item.label}
              >
                <AdminIcon className="h-5 w-5 text-fresh" name={item.icon} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <p className="mt-5 text-xs leading-5 text-text-muted">
        Sales metrics cover {formatAdminShortDate(range.start)} to{" "}
        {formatAdminShortDate(new Date(range.end.getTime() - 1))}. Stock and
        fulfilment cards show current state. Metric definitions are documented
        in the admin dashboard guide.
      </p>
    </div>
  );
}
