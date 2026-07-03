import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();

  // Guests simply have no saved items; this is not an error state.
  if (!user || (user.role !== "CUSTOMER" && user.role !== "ADMIN")) {
    return NextResponse.json({ productIds: [] });
  }

  const entries = await prisma.wishlist.findMany({
    where: { userId: user.id },
    select: { productId: true },
  });

  return NextResponse.json({ productIds: entries.map((entry) => entry.productId) });
}
