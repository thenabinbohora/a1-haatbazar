import Link from "next/link";
import type { StorefrontFilters, StorefrontSearchParams } from "@/lib/storefront";

type ProductFiltersProps = {
  filters: StorefrontFilters;
  values: StorefrontSearchParams;
  lockedCategorySlug?: string;
  className?: string;
};

export function ProductFilters({ className = "", filters, values, lockedCategorySlug }: ProductFiltersProps) {
  const selectedCategory = lockedCategorySlug ?? values.category ?? "";
  const formAction = "/products";

  return (
    <aside className={`rounded-lg border border-border bg-surface p-4 shadow-sm ${className}`}>
      <div>
        <h2 className="text-base font-bold text-text">Filters</h2>
        <p className="mt-1 text-sm text-text-muted">Switch aisles or refine by brand, price, offers, and availability.</p>
      </div>

      <form action={formAction} className="mt-5 space-y-4">
        {values.q ? <input name="q" type="hidden" value={values.q} /> : null}

        <label className="block">
          <span className="text-sm font-semibold text-text">Category</span>
          <select
            className="mt-2 min-h-11 w-full cursor-pointer rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta"
            defaultValue={selectedCategory}
            name="category"
          >
            <option value="">All categories</option>
            {filters.categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name} ({category.productCount})
              </option>
            ))}
          </select>
          {lockedCategorySlug ? (
            <span className="mt-1.5 block text-xs font-semibold text-text-muted">
              Choose another aisle and apply filters to switch categories.
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-text">Brand</span>
          <select
            className="mt-2 min-h-11 w-full cursor-pointer rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta"
            defaultValue={values.brand ?? ""}
            name="brand"
          >
            <option value="">All brands</option>
            {filters.brands.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-text">Min price</span>
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta"
              defaultValue={values.minPrice ?? ""}
              min="0"
              name="minPrice"
              placeholder="0"
              step="0.01"
              type="number"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Max price</span>
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta"
              defaultValue={values.maxPrice ?? ""}
              min="0"
              name="maxPrice"
              placeholder="50"
              step="0.01"
              type="number"
            />
          </label>
        </div>

        <div className="space-y-2 rounded-md border border-border bg-surface-muted p-3">
          <label className="flex items-center gap-3 text-sm font-semibold text-text">
            <input defaultChecked={values.inStock === "on"} name="inStock" type="checkbox" />
            In stock only
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-text">
            <input defaultChecked={values.sale === "on"} name="sale" type="checkbox" />
            Sale items
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-text">
            <input defaultChecked={values.freshVegetables === "on"} name="freshVegetables" type="checkbox" />
            Fresh vegetables
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-semibold text-text">Sort by</span>
          <select
            className="mt-2 min-h-11 w-full cursor-pointer rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta"
            defaultValue={values.sort ?? "newest"}
            name="sort"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price low to high</option>
            <option value="price-high">Price high to low</option>
            <option value="popular">Best sellers</option>
            <option value="offers">Offers</option>
          </select>
        </label>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          <button
            className="a1-primary-button cursor-pointer px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            type="submit"
          >
            Apply filters
          </button>
          <Link
            className="min-h-11 rounded-md border border-border bg-surface px-4 py-2 text-center text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href={lockedCategorySlug ? `/category/${lockedCategorySlug}` : "/products"}
          >
            Clear filters
          </Link>
        </div>
      </form>
    </aside>
  );
}
