import "server-only";

import { Prisma, type OrderStatus } from "@prisma/client";
import { cache } from "react";
import { STORE_TIME_ZONE } from "@/lib/admin-format";
import { eligibleSalesOrderStatuses } from "@/lib/admin/dashboard-rules";
import { prisma } from "@/lib/prisma";

export const dashboardRangeKeys = [
  "today",
  "7d",
  "30d",
  "month",
  "previous-month",
] as const;

export type DashboardRangeKey = (typeof dashboardRangeKeys)[number];
export type DashboardWidget =
  | "catalogue"
  | "inventory"
  | "operations"
  | "period"
  | "promotions"
  | "recent-orders"
  | "top-products"
  | "trend";

type LocalDateParts = {
  day: number;
  month: number;
  year: number;
};

export type DashboardRange = {
  end: Date;
  key: DashboardRangeKey;
  label: string;
  previousEnd: Date;
  previousStart: Date;
  start: Date;
};

const RANGE_LABELS: Record<DashboardRangeKey, string> = {
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  month: "This month",
  "previous-month": "Previous month",
};

const testDataExclusionEnabled =
  process.env.ADMIN_EXCLUDE_TEST_DATA?.toLowerCase() === "true";

function getLocalDateParts(value: Date): LocalDateParts {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: STORE_TIME_ZONE,
    year: "numeric",
  }).formatToParts(value);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    day: Number(lookup.day),
    month: Number(lookup.month),
    year: Number(lookup.year),
  };
}

function addLocalDays(value: LocalDateParts, amount: number): LocalDateParts {
  const date = new Date(Date.UTC(value.year, value.month - 1, value.day + amount));

  return {
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
  };
}

function startOfLocalMonth(value: LocalDateParts, offset = 0): LocalDateParts {
  const date = new Date(Date.UTC(value.year, value.month - 1 + offset, 1));

  return {
    day: 1,
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
  };
}

function localMidnightToUtc(value: LocalDateParts) {
  let timestamp = Date.UTC(value.year, value.month - 1, value.day);

  for (let pass = 0; pass < 2; pass += 1) {
    const rendered = new Intl.DateTimeFormat("en-CA", {
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
      minute: "2-digit",
      month: "2-digit",
      second: "2-digit",
      timeZone: STORE_TIME_ZONE,
      year: "numeric",
    }).formatToParts(new Date(timestamp));
    const lookup = Object.fromEntries(
      rendered.map((part) => [part.type, part.value]),
    );
    const renderedAsUtc = Date.UTC(
      Number(lookup.year),
      Number(lookup.month) - 1,
      Number(lookup.day),
      Number(lookup.hour),
      Number(lookup.minute),
      Number(lookup.second),
    );
    const expectedAsUtc = Date.UTC(value.year, value.month - 1, value.day);
    timestamp += expectedAsUtc - renderedAsUtc;
  }

  return new Date(timestamp);
}

function localDayCount(start: LocalDateParts, end: LocalDateParts) {
  return Math.round(
    (Date.UTC(end.year, end.month - 1, end.day) -
      Date.UTC(start.year, start.month - 1, start.day)) /
      86_400_000,
  );
}

export function parseDashboardRange(
  value: string | null | undefined,
  now = new Date(),
): DashboardRange {
  const key = dashboardRangeKeys.includes(value as DashboardRangeKey)
    ? (value as DashboardRangeKey)
    : "30d";
  const today = getLocalDateParts(now);
  let startParts: LocalDateParts;
  let endParts: LocalDateParts;

  switch (key) {
    case "today":
      startParts = today;
      endParts = addLocalDays(today, 1);
      break;
    case "7d":
      startParts = addLocalDays(today, -6);
      endParts = addLocalDays(today, 1);
      break;
    case "month":
      startParts = startOfLocalMonth(today);
      endParts = startOfLocalMonth(today, 1);
      break;
    case "previous-month":
      startParts = startOfLocalMonth(today, -1);
      endParts = startOfLocalMonth(today);
      break;
    case "30d":
    default:
      startParts = addLocalDays(today, -29);
      endParts = addLocalDays(today, 1);
      break;
  }

  const dayCount = localDayCount(startParts, endParts);
  const previousStartParts = addLocalDays(startParts, -dayCount);

  return {
    end: localMidnightToUtc(endParts),
    key,
    label: RANGE_LABELS[key],
    previousEnd: localMidnightToUtc(startParts),
    previousStart: localMidnightToUtc(previousStartParts),
    start: localMidnightToUtc(startParts),
  };
}

export function isLikelyTestRecord(email: string) {
  const normalized = email.trim().toLowerCase();

  return (
    normalized.endsWith("@example.com") ||
    normalized.includes("stage") ||
    normalized.includes("smoke") ||
    normalized.includes("+test")
  );
}

function testOrderWhere() {
  if (!testDataExclusionEnabled) {
    return {};
  }

  return {
    NOT: [
      { customerEmail: { endsWith: "@example.com", mode: "insensitive" as const } },
      { customerEmail: { contains: "stage", mode: "insensitive" as const } },
      { customerEmail: { contains: "smoke", mode: "insensitive" as const } },
      { customerEmail: { contains: "+test", mode: "insensitive" as const } },
    ],
  };
}

function testOrderSql(alias = "o") {
  if (!testDataExclusionEnabled) {
    return Prisma.empty;
  }

  return Prisma.sql`AND lower(${Prisma.raw(`"${alias}"."customerEmail"`)}::text) NOT LIKE '%@example.com'
    AND lower(${Prisma.raw(`"${alias}"."customerEmail"`)}::text) NOT LIKE '%stage%'
    AND lower(${Prisma.raw(`"${alias}"."customerEmail"`)}::text) NOT LIKE '%smoke%'
    AND lower(${Prisma.raw(`"${alias}"."customerEmail"`)}::text) NOT LIKE '%+test%'`;
}

function maybeFail(widget: DashboardWidget) {
  if (process.env.ADMIN_DASHBOARD_FAIL_WIDGET === widget) {
    throw new Error(`Dashboard widget unavailable: ${widget}`);
  }
}

type ShellInventoryRow = {
  lowStock: number;
  outOfStock: number;
};

export type AdminShellSummary = {
  hasError: boolean;
  lowStock: number | null;
  outOfStock: number | null;
  pendingOrders: number | null;
};

export const getAdminShellSummary = cache(
  async (): Promise<AdminShellSummary> => {
    try {
      const [pendingOrders, inventoryRows] = await Promise.all([
        prisma.order.count({
          where: {
            ...testOrderWhere(),
            status: {
              in: [
                "PENDING",
                "CONFIRMED",
                "PROCESSING",
                "READY_FOR_PICKUP",
                "OUT_FOR_DELIVERY",
              ],
            },
          },
        }),
        prisma.$queryRaw<ShellInventoryRow[]>(Prisma.sql`
          SELECT
            COUNT(*) FILTER (
              WHERE "stock" > 0 AND "stock" <= "lowStockThreshold"
            )::int AS "lowStock",
            COUNT(*) FILTER (WHERE "stock" <= 0)::int AS "outOfStock"
          FROM "ProductVariant"
          WHERE "status"::text = 'ACTIVE'
        `),
      ]);
      const inventory = inventoryRows[0] ?? { lowStock: 0, outOfStock: 0 };

      return {
        hasError: false,
        lowStock: Number(inventory.lowStock),
        outOfStock: Number(inventory.outOfStock),
        pendingOrders,
      };
    } catch (error) {
      console.error("Admin shell summary failed", error);

      return {
        hasError: true,
        lowStock: null,
        outOfStock: null,
        pendingOrders: null,
      };
    }
  },
);

type AggregateRow = {
  orderCount: number;
  revenue: Prisma.Decimal | number | null;
};

async function getEligibleAggregate(start: Date, end: Date) {
  const rows = await prisma.$queryRaw<AggregateRow[]>(Prisma.sql`
    SELECT
      COUNT(*)::int AS "orderCount",
      COALESCE(SUM("total"), 0) AS "revenue"
    FROM "Order" AS "o"
    WHERE "o"."createdAt" >= ${start}
      AND "o"."createdAt" < ${end}
      AND "o"."paymentStatus"::text = 'PAID'
      AND "o"."status"::text NOT IN ('CANCELLED', 'REFUNDED')
      AND "o"."currency" = 'AUD'
      ${testOrderSql()}
  `);
  const row = rows[0] ?? { orderCount: 0, revenue: 0 };

  return {
    orderCount: Number(row.orderCount),
    revenue: Number(row.revenue ?? 0),
  };
}

export async function getDashboardPeriodSummary(range: DashboardRange) {
  maybeFail("period");
  const [current, previous] = await Promise.all([
    getEligibleAggregate(range.start, range.end),
    getEligibleAggregate(range.previousStart, range.previousEnd),
  ]);

  return {
    averageOrderValue:
      current.orderCount > 0 ? current.revenue / current.orderCount : 0,
    orderCount: current.orderCount,
    previousAverageOrderValue:
      previous.orderCount > 0 ? previous.revenue / previous.orderCount : 0,
    previousOrderCount: previous.orderCount,
    previousRevenue: previous.revenue,
    revenue: current.revenue,
  };
}

type TrendRow = {
  day: string;
  orderCount: number;
  revenue: Prisma.Decimal | number;
};

function dateKey(value: LocalDateParts) {
  return `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
}

export async function getDashboardTrend(range: DashboardRange) {
  maybeFail("trend");
  const rows = await prisma.$queryRaw<TrendRow[]>(Prisma.sql`
    SELECT
      ("o"."createdAt" AT TIME ZONE ${STORE_TIME_ZONE})::date::text AS "day",
      COUNT(*)::int AS "orderCount",
      COALESCE(SUM("o"."total"), 0) AS "revenue"
    FROM "Order" AS "o"
    WHERE "o"."createdAt" >= ${range.start}
      AND "o"."createdAt" < ${range.end}
      AND "o"."paymentStatus"::text = 'PAID'
      AND "o"."status"::text NOT IN ('CANCELLED', 'REFUNDED')
      AND "o"."currency" = 'AUD'
      ${testOrderSql()}
    GROUP BY 1
    ORDER BY 1 ASC
  `);
  const rowMap = new Map(
    rows.map((row) => [
      row.day,
      { orderCount: Number(row.orderCount), revenue: Number(row.revenue) },
    ]),
  );
  const start = getLocalDateParts(range.start);
  const end = getLocalDateParts(range.end);
  const points = [];

  for (
    let cursor = start;
    dateKey(cursor) < dateKey(end);
    cursor = addLocalDays(cursor, 1)
  ) {
    const day = dateKey(cursor);
    const value = rowMap.get(day) ?? { orderCount: 0, revenue: 0 };

    points.push({
      averageOrderValue:
        value.orderCount > 0 ? value.revenue / value.orderCount : 0,
      date: day,
      orderCount: value.orderCount,
      revenue: value.revenue,
    });
  }

  return points;
}

export async function getDashboardCatalogue() {
  maybeFail("catalogue");
  const rows = await prisma.product.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const counts = Object.fromEntries(
    rows.map((row) => [row.status, row._count._all]),
  );

  return {
    active: counts.ACTIVE ?? 0,
    archived: counts.ARCHIVED ?? 0,
    draft: counts.DRAFT ?? 0,
    total: rows.reduce((sum, row) => sum + row._count._all, 0),
  };
}

export async function getDashboardOperations(range: DashboardRange) {
  maybeFail("operations");
  const [
    shell,
    statusRows,
    awaitingConfirmation,
    beingPrepared,
    readyForPickup,
    delivery,
  ] = await Promise.all([
    getAdminShellSummary(),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: {
        ...testOrderWhere(),
        createdAt: { gte: range.start, lt: range.end },
      },
    }),
    prisma.order.count({
      where: { ...testOrderWhere(), status: "PENDING" },
    }),
    prisma.order.count({
      where: {
        ...testOrderWhere(),
        status: { in: ["CONFIRMED", "PROCESSING"] },
      },
    }),
    prisma.order.count({
      where: { ...testOrderWhere(), status: "READY_FOR_PICKUP" },
    }),
    prisma.order.count({
      where: { ...testOrderWhere(), status: "OUT_FOR_DELIVERY" },
    }),
  ]);
  const statusCounts = Object.fromEntries(
    statusRows.map((row) => [row.status, row._count._all]),
  ) as Partial<Record<OrderStatus, number>>;

  return {
    fulfillment: {
      awaitingConfirmation,
      beingPrepared,
      delivery,
      readyForPickup,
    },
    inventory: shell,
    statusCounts,
  };
}

export async function getDashboardRecentOrders() {
  maybeFail("recent-orders");
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    where: testOrderWhere(),
    select: {
      _count: { select: { items: true } },
      createdAt: true,
      currency: true,
      customerEmail: true,
      fulfillmentType: true,
      id: true,
      orderNumber: true,
      status: true,
      total: true,
    },
  });

  return orders.map((order) => ({
    ...order,
    isLikelyTestRecord: isLikelyTestRecord(order.customerEmail),
    total: Number(order.total),
  }));
}

type InventoryAlertRow = {
  id: string;
  imageUrl: string | null;
  lowStockThreshold: number;
  name: string;
  productName: string;
  sku: string;
  stock: number;
};

export async function getDashboardInventoryAlerts() {
  maybeFail("inventory");
  const rows = await prisma.$queryRaw<InventoryAlertRow[]>(Prisma.sql`
    SELECT
      "v"."id",
      "v"."name",
      "v"."sku",
      "v"."stock",
      "v"."lowStockThreshold",
      "p"."name" AS "productName",
      COALESCE("v"."imageUrl", (
        SELECT "pi"."url"
        FROM "ProductImage" AS "pi"
        WHERE "pi"."productId" = "p"."id"
        ORDER BY "pi"."isPrimary" DESC, "pi"."sortOrder" ASC
        LIMIT 1
      )) AS "imageUrl"
    FROM "ProductVariant" AS "v"
    JOIN "Product" AS "p" ON "p"."id" = "v"."productId"
    WHERE "v"."status"::text = 'ACTIVE'
      AND "v"."stock" <= "v"."lowStockThreshold"
    ORDER BY
      CASE WHEN "v"."stock" <= 0 THEN 0 ELSE 1 END,
      "v"."stock" ASC,
      "v"."updatedAt" DESC
    LIMIT 5
  `);

  return rows.map((row) => ({
    ...row,
    lowStockThreshold: Number(row.lowStockThreshold),
    stock: Number(row.stock),
  }));
}

type TopProductRow = {
  currentStock: number;
  imageUrl: string | null;
  name: string;
  productId: string;
  revenue: Prisma.Decimal | number;
  unitsSold: number;
};

export async function getDashboardTopProducts(range: DashboardRange) {
  maybeFail("top-products");
  const rows = await prisma.$queryRaw<TopProductRow[]>(Prisma.sql`
    SELECT
      "oi"."productId",
      MIN("oi"."productName") AS "name",
      SUM("oi"."quantity")::int AS "unitsSold",
      COALESCE(SUM("oi"."lineTotal"), 0) AS "revenue",
      COALESCE((
        SELECT SUM("v"."stock")::int
        FROM "ProductVariant" AS "v"
        WHERE "v"."productId" = "oi"."productId"
          AND "v"."status"::text = 'ACTIVE'
      ), 0) AS "currentStock",
      (
        SELECT "pi"."url"
        FROM "ProductImage" AS "pi"
        WHERE "pi"."productId" = "oi"."productId"
        ORDER BY "pi"."isPrimary" DESC, "pi"."sortOrder" ASC
        LIMIT 1
      ) AS "imageUrl"
    FROM "OrderItem" AS "oi"
    JOIN "Order" AS "o" ON "o"."id" = "oi"."orderId"
    WHERE "o"."createdAt" >= ${range.start}
      AND "o"."createdAt" < ${range.end}
      AND "o"."paymentStatus"::text = 'PAID'
      AND "o"."status"::text NOT IN ('CANCELLED', 'REFUNDED')
      AND "o"."currency" = 'AUD'
      ${testOrderSql()}
    GROUP BY "oi"."productId"
    ORDER BY "unitsSold" DESC, "revenue" DESC
    LIMIT 5
  `);

  return rows.map((row) => ({
    ...row,
    currentStock: Number(row.currentStock),
    revenue: Number(row.revenue),
    unitsSold: Number(row.unitsSold),
  }));
}

export async function getDashboardPromotions(now = new Date()) {
  maybeFail("promotions");
  const expiringSoon = new Date(now.getTime() + 7 * 86_400_000);
  const [weeklyOffers, activeCoupons, expiringCoupons, activeBanners, scheduledBanners] =
    await Promise.all([
      prisma.product.count({
        where: { isWeeklyOffer: true, status: "ACTIVE" },
      }),
      prisma.coupon.count({
        where: {
          isActive: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
          ],
        },
      }),
      prisma.coupon.count({
        where: {
          expiresAt: { gt: now, lte: expiringSoon },
          isActive: true,
        },
      }),
      prisma.banner.count({
        where: {
          isActive: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
          ],
        },
      }),
      prisma.banner.count({
        where: { isActive: true, startsAt: { gt: now } },
      }),
    ]);

  return {
    activeBanners,
    activeCoupons,
    expiringCoupons,
    scheduledBanners,
    weeklyOffers,
  };
}

export const dashboardMetricsPolicy = {
  eligibleOrderStatuses: eligibleSalesOrderStatuses,
  testDataExclusionEnabled,
};
