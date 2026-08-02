import type { Metadata } from "next";
import { ProductListingShell } from "@/components/product/product-listing-shell";
import {
  getPublicProducts,
  getStorefrontFilters,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

const collection = "offers" as const;

export const metadata: Metadata = {
  title: "Weekly offers",
  description:
    "Browse current weekly grocery offers and savings from A1 Haat Bazar in Salisbury, Adelaide.",
  alternates: {
    canonical: "/offers",
  },
  openGraph: {
    title: "Weekly offers",
    description:
      "Browse current weekly grocery offers and savings from A1 Haat Bazar in Salisbury, Adelaide.",
    url: "/offers",
  },
};

export default async function OffersPage() {
  const [filters, products] = await Promise.all([
    getStorefrontFilters({ collection }),
    getPublicProducts({ sort: "newest" }, { collection }),
  ]);

  return (
    <ProductListingShell
      basePath="/offers"
      collection={collection}
      description="Save on this week’s selected groceries, with current prices, pack options, and stock shown clearly."
      emptyActionHref="/products"
      emptyActionLabel="Browse all groceries"
      emptyDescription="There are no weekly offers available right now. Browse the full grocery range while new savings are prepared."
      emptyTitle="Weekly offers coming soon"
      eyebrow="Offers & savings"
      filters={filters}
      products={products}
      title="Weekly offers"
    />
  );
}
