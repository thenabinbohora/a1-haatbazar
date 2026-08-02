import type { Metadata } from "next";
import { ProductListingShell } from "@/components/product/product-listing-shell";
import {
  getPublicProducts,
  getStorefrontFilters,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

const collection = "featured" as const;

export const metadata: Metadata = {
  title: "Featured products",
  description:
    "Explore featured grocery picks selected by A1 Haat Bazar in Salisbury, Adelaide.",
  alternates: {
    canonical: "/featured",
  },
  openGraph: {
    title: "Featured products",
    description:
      "Explore featured grocery picks selected by A1 Haat Bazar in Salisbury, Adelaide.",
    url: "/featured",
  },
};

export default async function FeaturedPage() {
  const [filters, products] = await Promise.all([
    getStorefrontFilters({ collection }),
    getPublicProducts({ sort: "newest" }, { collection }),
  ]);

  return (
    <ProductListingShell
      basePath="/featured"
      collection={collection}
      description="Explore a rotating selection of useful pantry staples, fresh picks, and grocery favourites chosen by A1 Haat Bazar."
      emptyActionHref="/products"
      emptyActionLabel="Browse all groceries"
      emptyDescription="There are no featured products available right now. Browse the full grocery range for more choices."
      emptyTitle="Featured products coming soon"
      eyebrow="Curated collection"
      filters={filters}
      products={products}
      title="Featured products"
    />
  );
}
