"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { ActiveFilterChips } from "@/components/product/active-filter-chips";
import { DesktopFilterSidebar } from "@/components/product/desktop-filter-sidebar";
import { MobileFilterDrawer } from "@/components/product/mobile-filter-drawer";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductSortSelect } from "@/components/product/product-sort-select";
import {
  buildProductListingHref,
  clearProductFilters,
  filterAndSortStorefrontProducts,
  hasActiveProductFilters,
  normalizeStorefrontSearchParams,
  removeProductFilter,
  storefrontSearchParamsRecord,
  type ProductFilterContext,
  type ProductFilterKey,
  type StorefrontSearchParams,
} from "@/lib/product-filter-state";
import type {
  StorefrontFilters,
  StorefrontProductCard,
} from "@/lib/storefront";

type ProductFilterSystemProps = {
  context: ProductFilterContext;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  emptyDescription?: string;
  emptyTitle?: string;
  filters: StorefrontFilters;
  products: StorefrontProductCard[];
  searchBrowseDefaults?: boolean;
  topContent?: ReactNode;
  topContentPlacement?: "before-results" | "after-results";
};

function showProductResults() {
  document.getElementById("product-results")?.scrollIntoView({
    behavior: "auto",
    block: "start",
  });
}

export function ProductFilterSystem({
  context,
  emptyActionHref,
  emptyActionLabel,
  emptyDescription,
  emptyTitle,
  filters,
  products,
  searchBrowseDefaults = false,
  topContent,
  topContentPlacement = "before-results",
}: ProductFilterSystemProps) {
  const searchParams = useSearchParams();
  const currentValues = normalizeStorefrontSearchParams(
    storefrontSearchParamsRecord(searchParams),
    {
      brandSlugs: filters.brands.map((brand) => brand.slug),
      categorySlugs: filters.categories.map((category) => category.slug),
      collection: context.collection,
      lockedCategorySlug: context.lockedCategory?.slug,
    },
  );
  const hasFilters = hasActiveProductFilters(currentValues, context);
  const hasListingQuery = Boolean(currentValues.q) || hasFilters;
  const searchQuery = searchBrowseDefaults ? currentValues.q : undefined;
  const visibleProducts =
    searchBrowseDefaults && !hasListingQuery
      ? filterAndSortStorefrontProducts(products, {
          bestSeller: true,
          sort: "best-selling",
        }).slice(0, 8)
      : filterAndSortStorefrontProducts(products, currentValues);
  const resolvedEmptyActionHref = hasFilters
    ? undefined
    : searchQuery
      ? "/products"
    : emptyActionHref;
  const resolvedEmptyActionLabel = hasFilters
    ? "Clear filters"
    : searchQuery
      ? "Browse all groceries"
      : emptyActionLabel;
  const resolvedEmptyDescription = hasFilters
    ? "No products match the current filters. Remove a filter or clear them to see more groceries."
    : searchQuery
      ? "No quick matches found. Try another search term, browse all groceries, or explore the suggestions below."
      : emptyDescription;
  const resolvedEmptyTitle = searchQuery
    ? `No results for "${searchQuery}"`
    : emptyTitle;
  const resolvedTopContentPlacement = searchBrowseDefaults
    ? hasListingQuery
      ? "after-results"
      : "before-results"
    : topContentPlacement;
  function navigate(
    nextValues: StorefrontSearchParams,
    options: { includeResultsHash?: boolean } = {},
  ) {
    const href = buildProductListingHref(context.basePath, nextValues, {
      includeResultsHash: options.includeResultsHash,
    });
    const targetUrl = new URL(href, window.location.origin);
    const currentPathAndSearch = `${window.location.pathname}${window.location.search}`;
    const targetPathAndSearch = `${targetUrl.pathname}${targetUrl.search}`;

    if (
      targetPathAndSearch === currentPathAndSearch &&
      targetUrl.hash === window.location.hash
    ) {
      if (options.includeResultsHash) {
        showProductResults();
      }
      return;
    }

    // Next integrates native history updates with useSearchParams. The
    // catalogue already has its scoped product set, so query interactions can
    // update synchronously without an error-prone same-route RSC round trip.
    window.history.pushState(null, "", href);

    if (options.includeResultsHash) {
      showProductResults();
    }
  }

  function removeFilter(key: ProductFilterKey) {
    navigate(removeProductFilter(currentValues, key), {
      includeResultsHash: true,
    });
  }

  return (
    <div className="w-full max-w-full min-w-0">
      {topContent && resolvedTopContentPlacement === "before-results" ? (
        <div className="mb-6">{topContent}</div>
      ) : null}

      <div className="grid w-full max-w-full min-w-0 items-start gap-7 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] xl:gap-8">
        <DesktopFilterSidebar
          context={context}
          filters={filters}
          onNavigate={(nextValues) =>
            navigate(nextValues, { includeResultsHash: true })
          }
          values={currentValues}
        />

        <div className="w-full max-w-full min-w-0">
          <div
            className="sticky top-[var(--site-header-offset)] z-30 -mx-4 mb-5 grid min-w-0 grid-cols-2 gap-2 border-y border-border bg-background px-4 py-2 shadow-[0_6px_16px_rgba(24,38,27,0.05)] max-[430px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:flex lg:min-h-11 lg:items-center lg:justify-between lg:gap-4 lg:border-x-0 lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0 lg:pb-2 lg:shadow-none"
            data-product-results-toolbar
          >
            <p
              aria-atomic="true"
              aria-live="polite"
              className="order-3 col-span-2 min-w-0 px-1 text-xs font-semibold text-text-muted lg:order-1 lg:col-auto lg:px-0 lg:text-sm"
            >
              <span className="font-extrabold tabular-nums text-text">
                {visibleProducts.length}
              </span>{" "}
              {visibleProducts.length === 1 ? "product" : "products"} found
            </p>
            <div className="order-1 min-w-0 lg:hidden">
              <MobileFilterDrawer
                context={context}
                filters={filters}
                onApply={(nextValues) =>
                  navigate(nextValues, {
                    includeResultsHash: true,
                  })
                }
                values={currentValues}
              />
            </div>
            <ProductSortSelect
              className="order-2 w-full lg:w-auto"
              onChange={(sort) => navigate({ ...currentValues, sort })}
              showVisibleLabel
              value={currentValues.sort}
            />
          </div>

          <ActiveFilterChips
            context={context}
            filters={filters}
            onClear={() =>
              navigate(clearProductFilters(currentValues), {
                includeResultsHash: true,
              })
            }
            onRemove={removeFilter}
            values={currentValues}
          />

          <div
            className="relative w-full max-w-full min-w-0"
            id="product-results-grid"
          >
            <ProductGrid
              emptyActionHref={resolvedEmptyActionHref}
              emptyActionLabel={resolvedEmptyActionLabel}
              emptyActionOnClick={
                hasFilters
                  ? () =>
                      navigate(clearProductFilters(currentValues), {
                        includeResultsHash: true,
                      })
                  : undefined
              }
              emptyDescription={resolvedEmptyDescription}
              emptyTitle={resolvedEmptyTitle}
              products={visibleProducts}
            />
            {topContent && resolvedTopContentPlacement === "after-results" ? (
              <div className="mt-6">{topContent}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
