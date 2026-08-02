import Link from "next/link";
import type { ReactNode } from "react";
import { ProductFilterSystem } from "@/components/product/product-filter-system";
import { SearchListingFrame } from "@/components/search/search-listing-content";
import type {
  ProductCollection,
  ProductFilterContext,
} from "@/lib/product-filter-state";
import type { StorefrontFilters, StorefrontProductCard } from "@/lib/storefront";

type ProductListingShellProps = {
  basePath?: string;
  title: string;
  description: string;
  products: StorefrontProductCard[];
  filters: StorefrontFilters;
  lockedCategorySlug?: string;
  collection?: ProductCollection;
  eyebrow?: string;
  categoryLinks?: Array<{ name: string; slug: string }>;
  topContent?: ReactNode;
  topContentPlacement?: "before-results" | "after-results";
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
};

export function ProductListingShell({
  basePath = "/products",
  title,
  description,
  products,
  filters,
  lockedCategorySlug,
  collection,
  eyebrow = "Full catalog",
  categoryLinks = [],
  topContent,
  topContentPlacement = "before-results",
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
}: ProductListingShellProps) {
  const context: ProductFilterContext = {
    basePath,
    collection,
    lockedCategory: lockedCategorySlug
      ? { name: title, slug: lockedCategorySlug }
      : undefined,
  };
  const filterSystem = (
    <ProductFilterSystem
      context={context}
      emptyActionHref={emptyActionHref}
      emptyActionLabel={emptyActionLabel}
      emptyDescription={emptyDescription}
      emptyTitle={emptyTitle}
      filters={filters}
      products={products}
      searchBrowseDefaults={basePath === "/search"}
      topContent={topContent}
      topContentPlacement={topContentPlacement}
    />
  );

  if (basePath === "/search") {
    return (
      <div className="bg-background">
        <SearchListingFrame>{filterSystem}</SearchListingFrame>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-gradient-to-b from-surface to-background">
        <div
          className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
        >
          <p className="inline-flex rounded-full border border-fresh/20 bg-fresh-soft px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-fresh">
            {eyebrow}
          </p>
          <div className="mt-4">
            <div>
              <h1 className="max-w-4xl text-3xl font-black leading-[1.08] tracking-[-0.025em] text-text sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted sm:text-base sm:leading-7">
                {description}
              </p>
            </div>
          </div>

          {categoryLinks.length ? (
            <nav className="polished-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2" aria-label="Related categories">
              {categoryLinks.map((category) => (
                <Link
                  className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-border bg-surface px-4 py-2 text-sm font-bold text-text shadow-sm transition-[background-color,border-color,color] duration-200 hover:border-cta/50 hover:bg-cta-soft hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href={`/category/${category.slug}`}
                  key={category.slug}
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </section>

      <section
        className="mx-auto w-full max-w-7xl min-w-0 px-4 py-7 sm:px-6 sm:py-10 lg:px-8"
        id="product-results"
      >
        {filterSystem}
      </section>
    </div>
  );
}
