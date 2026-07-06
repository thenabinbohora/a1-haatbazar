import type { Metadata } from "next";
import Link from "next/link";
import { ProductListingShell } from "@/components/product/product-listing-shell";
import {
  getFeaturedCategories,
  getPublicProducts,
  getStorefrontFilters,
  normalizeStorefrontSearchParams,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search grocery products by name, description, category, brand, and sale status.",
  robots: { index: false },
};

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = normalizeStorefrontSearchParams(await searchParams);
  const [products, filters, categories] = await Promise.all([
    query.q ? getPublicProducts(query) : getPublicProducts({ sort: "popular" }, { bestSeller: true, take: 8 }),
    getStorefrontFilters(),
    getFeaturedCategories(6),
  ]);
  const hasActiveQuery = Boolean(query.q);
  const title = query.q ? `Search results for "${query.q}"` : "Search groceries";
  const popularSearches = ["rice", "masala", "noodles", "tea", "momo", "dal", "fresh vegetables"];
  const browseContent = (
    <div className="grid gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm lg:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-sm font-bold uppercase text-fresh">
          {hasActiveQuery ? "More ways to browse" : "Popular searches"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {popularSearches.map((item) => (
            <Link
              className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-sm font-semibold text-text transition-colors hover:border-primary hover:bg-fresh-soft"
              href={`/search?q=${encodeURIComponent(item)}`}
              key={item}
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold uppercase text-fresh">Featured categories</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-sm font-semibold text-text transition-colors hover:border-primary hover:bg-fresh-soft"
              href={`/category/${category.slug}`}
              key={category.id}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ProductListingShell
      description={
        query.q
          ? "Search the A1 Haat Bazar catalog, then refine results with brand, price, offers, and stock filters."
          : "Search rice, masala, noodles, tea, snacks, frozen foods, fresh vegetables, or any grocery essential."
      }
      eyebrow="Search"
      emptyActionHref={hasActiveQuery ? "/products" : undefined}
      emptyActionLabel={hasActiveQuery ? "Browse all groceries" : undefined}
      emptyDescription={
        hasActiveQuery
          ? "No quick matches found. Try another search term, browse all groceries, or explore the suggestions below."
          : "Try rice, masala, noodles, tea, momo, dal, or fresh vegetables."
      }
      emptyTitle={hasActiveQuery ? `No results for "${query.q}"` : "No products found"}
      filters={filters}
      products={products}
      showHeaderSearch
      compactMobileHeader={hasActiveQuery}
      title={title}
      topContent={browseContent}
      topContentPlacement={hasActiveQuery ? "after-results" : "before-results"}
      values={query}
    />
  );
}
