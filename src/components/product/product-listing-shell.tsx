import Link from "next/link";
import type { ReactNode } from "react";
import type { StorefrontFilters, StorefrontProductCard, StorefrontSearchParams } from "@/lib/storefront";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGrid } from "@/components/product/product-grid";

type ProductListingShellProps = {
  title: string;
  description: string;
  products: StorefrontProductCard[];
  filters: StorefrontFilters;
  values: StorefrontSearchParams;
  lockedCategorySlug?: string;
  eyebrow?: string;
  categoryLinks?: Array<{ name: string; slug: string }>;
  topContent?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  showHeaderSearch?: boolean;
};

export function ProductListingShell({
  title,
  description,
  products,
  filters,
  values,
  lockedCategorySlug,
  eyebrow = "Shop groceries",
  categoryLinks = [],
  topContent,
  emptyTitle,
  emptyDescription,
  showHeaderSearch = false,
}: ProductListingShellProps) {
  const selectedCategory = values.category
    ? filters.categories.find((category) => category.slug === values.category)?.name ?? values.category
    : null;
  const selectedBrand = values.brand ? filters.brands.find((brand) => brand.slug === values.brand)?.name ?? values.brand : null;
  const activeFilters = [
    values.q ? `Search: ${values.q}` : null,
    selectedCategory ? `Category: ${selectedCategory}` : null,
    selectedBrand ? `Brand: ${selectedBrand}` : null,
    values.minPrice ? `Min: $${values.minPrice}` : null,
    values.maxPrice ? `Max: $${values.maxPrice}` : null,
    values.inStock ? "In stock" : null,
    values.sale ? "Sale items" : null,
    values.freshVegetables ? "Fresh vegetables" : null,
  ].filter((filter): filter is string => Boolean(filter));

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase text-fresh">{eyebrow}</p>
          <div className={showHeaderSearch ? "mt-3 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end" : "mt-3"}>
            <div>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight text-text sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-text-muted">{description}</p>
            </div>
            {showHeaderSearch ? (
              <form action="/search" className="w-full max-w-xl lg:w-[420px]" role="search">
                <label className="sr-only" htmlFor="listing-search">
                  Search groceries
                </label>
                <div className="flex rounded-lg border border-border bg-surface-muted p-1 shadow-sm">
                  <input
                    className="min-h-11 flex-1 rounded-md border border-transparent bg-white px-3 text-sm text-text placeholder:text-text-muted focus:border-cta"
                    defaultValue={values.q ?? ""}
                    id="listing-search"
                    name="q"
                    placeholder="Search rice, tea, noodles"
                    type="search"
                  />
                  <button
                    className="a1-primary-button cursor-pointer px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                    type="submit"
                  >
                    Search
                  </button>
                </div>
              </form>
            ) : null}
          </div>

          {categoryLinks.length ? (
            <div className="polished-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1" aria-label="Related categories">
              {categoryLinks.map((category) => (
                <Link
                  className="shrink-0 rounded-full border border-border bg-surface-muted px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-cta hover:bg-cta-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href={`/category/${category.slug}`}
                  key={category.slug}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {topContent ? <div className="mb-6">{topContent}</div> : null}
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="lg:hidden">
            <details className="rounded-lg border border-border bg-surface p-4 shadow-sm">
              <summary className="cursor-pointer text-sm font-bold text-primary">Filters and sort</summary>
              <ProductFilters className="mt-4 border-0 p-0 shadow-none" filters={filters} lockedCategorySlug={lockedCategorySlug} values={values} />
            </details>
          </div>
          <ProductFilters className="hidden lg:block lg:sticky lg:top-28" filters={filters} lockedCategorySlug={lockedCategorySlug} values={values} />
        <div>
          <div className="mb-4 flex flex-col gap-1 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-muted shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-semibold text-text">{products.length}</span> products found
            </p>
            <p>Prices and stock are checked before your order is confirmed.</p>
          </div>
          {activeFilters.length ? (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <span className="rounded-full border border-cta/30 bg-cta-soft px-3 py-1 text-xs font-bold text-cta-hover" key={filter}>
                  {filter}
                </span>
              ))}
              <Link
                className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-bold text-text-muted transition-colors hover:bg-surface-muted"
                href={lockedCategorySlug ? `/category/${lockedCategorySlug}` : "/products"}
              >
                Clear filters
              </Link>
            </div>
          ) : null}
          <ProductGrid emptyDescription={emptyDescription} emptyTitle={emptyTitle} products={products} />
        </div>
        </div>
      </section>
    </div>
  );
}
