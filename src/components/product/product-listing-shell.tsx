import Link from "next/link";
import type { ReactNode } from "react";
import type { StorefrontFilters, StorefrontProductCard, StorefrontSearchParams } from "@/lib/storefront";
import { MobileSortControl, ProductFilters } from "@/components/product/product-filters";
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
  topContentPlacement?: "before-results" | "after-results";
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  showHeaderSearch?: boolean;
  compactMobileHeader?: boolean;
};

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProductListingShell({
  title,
  description,
  products,
  filters,
  values,
  lockedCategorySlug,
  eyebrow = "Full catalog",
  categoryLinks = [],
  topContent,
  topContentPlacement = "before-results",
  emptyTitle,
  emptyDescription,
  emptyActionHref,
  emptyActionLabel,
  showHeaderSearch = false,
  compactMobileHeader = false,
}: ProductListingShellProps) {
  const selectedCategory = values.category
    ? filters.categories.find((category) => category.slug === values.category)?.name ?? values.category
    : null;
  const selectedBrand = values.brand ? filters.brands.find((brand) => brand.slug === values.brand)?.name ?? values.brand : null;
  const filterFormAction = eyebrow === "Search" ? "/search" : "/products";
  const sortFormAction = eyebrow === "Search"
    ? "/search"
    : lockedCategorySlug
      ? `/category/${lockedCategorySlug}`
      : "/products";
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
      <section className="border-b border-border bg-gradient-to-b from-surface to-background">
        <div
          className={`mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 ${compactMobileHeader ? "py-5 sm:py-9" : "py-8 sm:py-10"}`}
        >
          <p className="inline-flex rounded-full border border-fresh/20 bg-fresh-soft px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-fresh">
            {eyebrow}
          </p>
          <div className={showHeaderSearch ? "mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end" : "mt-4"}>
            <div>
              <h1 className="max-w-4xl text-3xl font-black leading-[1.08] tracking-[-0.025em] text-text sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p className={`mt-3 max-w-2xl text-sm leading-6 text-text-muted sm:text-base sm:leading-7 ${compactMobileHeader ? "hidden sm:block" : ""}`}>
                {description}
              </p>
            </div>
            {showHeaderSearch ? (
              <form action="/search" className="w-full max-w-xl lg:max-w-none" role="search">
                <label className="sr-only" htmlFor="listing-search">
                  Search groceries
                </label>
                <div className="flex rounded-2xl border border-border bg-surface p-1.5 shadow-[0_8px_24px_rgba(24,38,27,0.08)] transition-[border-color,box-shadow] duration-200 focus-within:border-cta focus-within:shadow-[0_10px_28px_rgba(24,38,27,0.11)]">
                  <input
                    className="min-h-11 min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3 text-base text-text outline-none placeholder:text-text-muted/80 md:text-sm"
                    defaultValue={values.q ?? ""}
                    id="listing-search"
                    name="q"
                    placeholder="Search rice, tea, noodles"
                    type="search"
                  />
                  <button
                    className="a1-primary-button min-h-11 cursor-pointer gap-2 !rounded-xl px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                    type="submit"
                  >
                    <SearchIcon />
                    Search
                  </button>
                </div>
              </form>
            ) : null}
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

      <section className={`mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 ${compactMobileHeader ? "py-5 sm:py-8" : "py-7 sm:py-10"}`}>
        {topContent && topContentPlacement === "before-results" ? <div className="mb-6">{topContent}</div> : null}
        <div className="sticky top-[7rem] z-30 -mx-4 mb-5 border-y border-border bg-background px-4 py-2.5 shadow-[0_8px_20px_rgba(24,38,27,0.06)] sm:-mx-6 sm:px-6 md:static lg:hidden">
          <div className="relative">
            <details className="group">
              <summary className="flex min-h-12 w-[calc(50%-0.25rem)] cursor-pointer list-none items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 text-sm shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta">
                <span className="flex min-w-0 items-center gap-2 font-extrabold text-text">
                  <FilterIcon />
                  Filters
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-primary">
                  {activeFilters.length ? (
                    <span className="grid h-6 min-w-6 place-items-center rounded-full bg-cta-soft px-1.5 text-xs font-extrabold text-cta-hover">
                      {activeFilters.length}
                    </span>
                  ) : null}
                  <ChevronDownIcon />
                </span>
              </summary>
              <div className="polished-scrollbar mt-2 max-h-[calc(100dvh-12.5rem)] overflow-y-auto overscroll-contain rounded-2xl border border-border bg-surface p-3 shadow-[0_16px_36px_rgba(24,38,27,0.12)]">
                <ProductFilters
                  className="border-0"
                  compact
                  filters={filters}
                  formAction={filterFormAction}
                  lockedCategorySlug={lockedCategorySlug}
                  values={values}
                />
              </div>
            </details>
            <MobileSortControl
              className="absolute right-0 top-0 w-[calc(50%-0.25rem)]"
              formAction={sortFormAction}
              lockedCategorySlug={lockedCategorySlug}
              values={values}
            />
          </div>
          <p className="mt-2 px-1 text-xs font-semibold text-text-muted">
            <span className="font-extrabold text-text">{products.length}</span> {products.length === 1 ? "product" : "products"} found
          </p>
        </div>
        <div className="grid items-start gap-7 lg:grid-cols-[296px_minmax(0,1fr)] xl:gap-8">
          <ProductFilters
            className="polished-scrollbar hidden lg:sticky lg:top-44 lg:block lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto"
            filters={filters}
            formAction={filterFormAction}
            lockedCategorySlug={lockedCategorySlug}
            values={values}
          />
          <div className="min-w-0">
            <div className="mb-5 hidden min-h-14 flex-col gap-1 rounded-2xl border border-border bg-surface px-5 py-3 text-sm text-text-muted shadow-[0_6px_20px_rgba(24,38,27,0.05)] lg:flex xl:flex-row xl:items-center xl:justify-between">
              <p className="font-medium">
                <span className="text-base font-extrabold text-text">{products.length}</span> {products.length === 1 ? "product" : "products"} found
              </p>
              <p className="text-xs xl:text-sm">Live availability is rechecked before your order is confirmed.</p>
            </div>
            {activeFilters.length ? (
              <div className="a1-no-scrollbar -mx-4 mb-5 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0" aria-label="Active filters">
                {activeFilters.map((filter) => (
                  <span className="shrink-0 rounded-full border border-cta/30 bg-cta-soft px-3 py-1.5 text-xs font-bold text-cta-hover" key={filter}>
                    {filter}
                  </span>
                ))}
                <Link
                  className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-text-muted transition-[background-color,border-color,color] duration-200 hover:border-cta/40 hover:bg-surface-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href={lockedCategorySlug ? `/category/${lockedCategorySlug}` : "/products"}
                >
                  Clear filters
                </Link>
              </div>
            ) : null}
            <ProductGrid
              emptyActionHref={emptyActionHref}
              emptyActionLabel={emptyActionLabel}
              emptyDescription={emptyDescription}
              emptyTitle={emptyTitle}
              products={products}
            />
            {topContent && topContentPlacement === "after-results" ? <div className="mt-6">{topContent}</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
