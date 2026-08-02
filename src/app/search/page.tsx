import type { Metadata } from "next";
import { ProductListingShell } from "@/components/product/product-listing-shell";
import { SearchBrowseContent } from "@/components/search/search-listing-content";
import {
  getFeaturedCategories,
  getPublicProducts,
  getStorefrontFilters,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search grocery products by name, description, category, brand, and sale status.",
  robots: { index: false },
};

export default async function SearchPage() {
  const [filters, categories, products] = await Promise.all([
    getStorefrontFilters(),
    getFeaturedCategories(6),
    getPublicProducts({ sort: "newest" }),
  ]);
  return (
    <ProductListingShell
      basePath="/search"
      description="Search rice, masala, noodles, tea, snacks, frozen foods, fresh vegetables, or any grocery essential."
      eyebrow="Search"
      emptyDescription="Try rice, masala, noodles, tea, momo, dal, or fresh vegetables."
      emptyTitle="No products found"
      filters={filters}
      products={products}
      title="Search groceries"
      topContent={<SearchBrowseContent categories={categories} />}
      topContentPlacement="before-results"
    />
  );
}
