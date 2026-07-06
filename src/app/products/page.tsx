import type { Metadata } from "next";
import { ProductListingShell } from "@/components/product/product-listing-shell";
import {
  getPublicProducts,
  getStorefrontFilters,
  normalizeStorefrontSearchParams,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop groceries",
  description:
    "Browse authentic Nepali, Indian, Asian, and everyday grocery essentials from A1 Haat Bazar in Salisbury, Adelaide.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Shop groceries",
    description:
      "Browse authentic Nepali, Indian, Asian, and everyday grocery essentials from A1 Haat Bazar in Salisbury, Adelaide.",
    url: "/products",
  },
};

type ProductsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const query = normalizeStorefrontSearchParams(await searchParams);
  const [products, filters] = await Promise.all([
    getPublicProducts(query),
    getStorefrontFilters(),
  ]);

  return (
    <ProductListingShell
      description="Browse authentic Nepali, Indian, Asian, and everyday grocery essentials, from pantry staples to fresh vegetables and weekly offers."
      filters={filters}
      products={products}
      title="Shop groceries"
      values={query}
    />
  );
}
