import type { Metadata } from "next";
import { ProductListingShell } from "@/components/product/product-listing-shell";
import {
  getPublicProducts,
  getStorefrontFilters,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

const collection = "best-sellers" as const;

export const metadata: Metadata = {
  title: "Best sellers",
  description:
    "Shop popular grocery favourites selected as best sellers at A1 Haat Bazar in Salisbury, Adelaide.",
  alternates: {
    canonical: "/best-sellers",
  },
  openGraph: {
    title: "Best sellers",
    description:
      "Shop popular grocery favourites selected as best sellers at A1 Haat Bazar in Salisbury, Adelaide.",
    url: "/best-sellers",
  },
};

export default async function BestSellersPage() {
  const [filters, products] = await Promise.all([
    getStorefrontFilters({ collection }),
    getPublicProducts({ sort: "newest" }, { collection }),
  ]);

  return (
    <ProductListingShell
      basePath="/best-sellers"
      collection={collection}
      description="Browse dependable pantry staples and familiar grocery favourites that are popular with local shoppers."
      emptyActionHref="/products"
      emptyActionLabel="Browse all groceries"
      emptyDescription="There are no best sellers available right now. Browse the full grocery range for more choices."
      emptyTitle="Best sellers coming soon"
      eyebrow="Popular picks"
      filters={filters}
      products={products}
      title="Best sellers"
    />
  );
}
