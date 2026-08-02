import type { Metadata } from "next";
import { ProductListingShell } from "@/components/product/product-listing-shell";
import {
  getPublicProducts,
  getStorefrontFilters,
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

export default async function ProductsPage() {
  const [filters, products] = await Promise.all([
    getStorefrontFilters(),
    getPublicProducts({ sort: "newest" }),
  ]);

  return (
    <ProductListingShell
      basePath="/products"
      description="Browse authentic Nepali, Indian, Asian, and everyday grocery essentials, from pantry staples to fresh vegetables and weekly offers."
      filters={filters}
      products={products}
      title="Shop groceries"
    />
  );
}
