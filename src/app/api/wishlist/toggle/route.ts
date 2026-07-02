import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user || (user.role !== "CUSTOMER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Sign in to use wishlist." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const productId = typeof body?.productId === "string" ? body.productId : "";

  if (!productId) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, status: "ACTIVE" },
    select: { id: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Product is unavailable." }, { status: 404 });
  }

  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.wishlist.create({ data: { userId: user.id, productId } });
  return NextResponse.json({ saved: true });
}
