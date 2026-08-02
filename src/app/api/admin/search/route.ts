import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/admin-guard";
import { orderStatusLabels } from "@/lib/admin/order-status";
import { prisma } from "@/lib/prisma";

const querySchema = z.string().trim().min(2).max(64);

export async function GET(request: NextRequest) {
  const { response } = await requireAdminApi();

  if (response) {
    return response;
  }

  const parsed = querySchema.safeParse(request.nextUrl.searchParams.get("q"));

  if (!parsed.success) {
    return NextResponse.json(
      { results: [] },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const query = parsed.data;

  try {
    const [products, categories, orders, coupons] = await Promise.all([
      prisma.product.findMany({
        orderBy: { updatedAt: "desc" },
        select: { id: true, name: true, status: true },
        take: 5,
        where: { name: { contains: query, mode: "insensitive" } },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true },
        take: 4,
        where: { name: { contains: query, mode: "insensitive" } },
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
        },
        take: 5,
        where: {
          OR: [
            { orderNumber: { contains: query, mode: "insensitive" } },
            { customerEmail: { contains: query, mode: "insensitive" } },
          ],
        },
      }),
      prisma.coupon.findMany({
        orderBy: { updatedAt: "desc" },
        select: { code: true, id: true, isActive: true, name: true },
        take: 4,
        where: {
          OR: [
            { code: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        },
      }),
    ]);

    return NextResponse.json(
      {
        results: [
          ...products.map((product) => ({
            detail: `${product.status.toLowerCase()} product`,
            href: `/admin/products/${product.id}/edit`,
            id: `product-${product.id}`,
            label: product.name,
            type: "Product",
          })),
          ...orders.map((order) => ({
            detail: orderStatusLabels[order.status],
            href: `/admin/orders/${order.id}`,
            id: `order-${order.id}`,
            label: order.orderNumber,
            type: "Order",
          })),
          ...categories.map((category) => ({
            detail: "Catalogue category",
            href: `/admin/categories?q=${encodeURIComponent(category.name)}`,
            id: `category-${category.id}`,
            label: category.name,
            type: "Category",
          })),
          ...coupons.map((coupon) => ({
            detail: coupon.isActive ? "Active coupon" : "Inactive coupon",
            href: `/admin/coupons?q=${encodeURIComponent(coupon.code)}`,
            id: `coupon-${coupon.id}`,
            label: `${coupon.code} · ${coupon.name}`,
            type: "Coupon",
          })),
        ],
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("Admin search failed", error);

    return NextResponse.json(
      { error: "Search is temporarily unavailable.", results: [] },
      {
        headers: { "Cache-Control": "no-store" },
        status: 503,
      },
    );
  }
}
