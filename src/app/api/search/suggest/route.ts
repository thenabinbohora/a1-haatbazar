import { NextResponse } from "next/server";
import { getPublicProducts } from "@/lib/storefront";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 60);

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const products = await getPublicProducts({ q }, { take: 12 });
  const needle = q.toLowerCase();
  const ranked = [...products]
    .sort((a, b) => Number(b.name.toLowerCase().includes(needle)) - Number(a.name.toLowerCase().includes(needle)))
    .slice(0, 6);

  return NextResponse.json({
    suggestions: ranked.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      categoryName: product.category.name,
      imageUrl: product.imageUrl ?? null,
      startingPrice: product.startingPrice,
      currency: product.currency,
      isInStock: product.isInStock,
    })),
  });
}
