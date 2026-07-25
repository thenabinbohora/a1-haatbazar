"use client";

import Link from "next/link";
import { useRef } from "react";
import type { StorefrontFilters, StorefrontSearchParams } from "@/lib/storefront";

type ProductFiltersProps = {
  filters: StorefrontFilters;
  values: StorefrontSearchParams;
  lockedCategorySlug?: string;
  className?: string;
  compact?: boolean;
  formAction?: string;
};

type MobileSortControlProps = {
  values: StorefrontSearchParams;
  lockedCategorySlug?: string;
  className?: string;
  formAction?: string;
};

export function MobileSortControl({ values, lockedCategorySlug, className = "", formAction }: MobileSortControlProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const action = formAction ?? (lockedCategorySlug ? `/category/${lockedCategorySlug}` : "/products");

  return (
    <form action={action} className={className} ref={formRef}>
      {values.q ? <input name="q" type="hidden" value={values.q} /> : null}
      {!lockedCategorySlug && values.category ? <input name="category" type="hidden" value={values.category} /> : null}
      {values.brand ? <input name="brand" type="hidden" value={values.brand} /> : null}
      {values.minPrice ? <input name="minPrice" type="hidden" value={values.minPrice} /> : null}
      {values.maxPrice ? <input name="maxPrice" type="hidden" value={values.maxPrice} /> : null}
      {values.inStock ? <input name="inStock" type="hidden" value={values.inStock} /> : null}
      {values.sale ? <input name="sale" type="hidden" value={values.sale} /> : null}
      {values.freshVegetables ? <input name="freshVegetables" type="hidden" value={values.freshVegetables} /> : null}
      <label className="block">
        <span className="sr-only">Sort products</span>
        <select
          aria-label="Sort products"
          className="min-h-12 w-full cursor-pointer rounded-xl border border-border bg-surface px-3 text-base font-bold text-text shadow-sm outline-none transition-[border-color,box-shadow] focus:border-cta focus:ring-2 focus:ring-cta/20"
          defaultValue={values.sort ?? "newest"}
          name="sort"
          onChange={() => formRef.current?.requestSubmit()}
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: low to high</option>
          <option value="price-high">Price: high to low</option>
          <option value="popular">Best sellers</option>
          <option value="offers">Offers</option>
        </select>
      </label>
    </form>
  );
}

export function ProductFilters({
  className = "",
  filters,
  values,
  lockedCategorySlug,
  compact = false,
  formAction = "/products",
}: ProductFiltersProps) {
  const selectedCategory = lockedCategorySlug ?? values.category ?? "";
  const controlClass =
    "mt-2 min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-base text-text shadow-sm outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-muted/70 focus:border-cta focus:ring-2 focus:ring-cta/20 lg:text-sm";

  return (
    <aside className={`rounded-2xl border border-border bg-surface ${compact ? "p-0 shadow-none" : "p-5 shadow-[0_10px_32px_rgba(24,38,27,0.07)]"} ${className}`}>
      {!compact ? (
        <div className="border-b border-border/80 pb-4">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-fresh">Refine your shop</p>
          <h2 className="mt-1 text-lg font-extrabold text-text">Filters</h2>
          <p className="mt-1.5 text-sm leading-5 text-text-muted">Find the right brand, price, offer, or availability.</p>
        </div>
      ) : null}

      <form action={formAction} className={compact ? "space-y-4" : "mt-5 space-y-5"}>
        {values.q ? <input name="q" type="hidden" value={values.q} /> : null}

        <label className="block">
          <span className="text-sm font-bold text-text">Category</span>
          <select
            className={`${controlClass} cursor-pointer`}
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
            <span className="mt-2 block text-xs font-medium leading-5 text-text-muted">
              Choose another aisle and apply filters to switch categories.
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-text">Brand</span>
          <select
            className={`${controlClass} cursor-pointer`}
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

        <fieldset>
          <legend className="text-sm font-bold text-text">Price range</legend>
          <div className="mt-2 grid grid-cols-2 gap-2.5">
            <label className="block">
              <span className="sr-only">Minimum price</span>
              <input
                className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-base text-text shadow-sm outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-muted/70 focus:border-cta focus:ring-2 focus:ring-cta/20 lg:text-sm"
                defaultValue={values.minPrice ?? ""}
                inputMode="decimal"
                min="0"
                name="minPrice"
                placeholder="Min $"
                step="0.01"
                type="number"
              />
            </label>
            <label className="block">
              <span className="sr-only">Maximum price</span>
              <input
                className="min-h-11 w-full rounded-xl border border-border bg-surface px-3 text-base text-text shadow-sm outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-muted/70 focus:border-cta focus:ring-2 focus:ring-cta/20 lg:text-sm"
                defaultValue={values.maxPrice ?? ""}
                inputMode="decimal"
                min="0"
                name="maxPrice"
                placeholder="Max $"
                step="0.01"
                type="number"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-border bg-surface-muted p-3.5">
          <legend className="px-1 text-sm font-bold text-text">Availability & offers</legend>
          <div className="mt-1 space-y-1">
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 text-sm font-semibold text-text transition-colors duration-200 hover:bg-surface">
              <input
                className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                defaultChecked={values.inStock === "on"}
                name="inStock"
                type="checkbox"
              />
              In stock only
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 text-sm font-semibold text-text transition-colors duration-200 hover:bg-surface">
              <input
                className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                defaultChecked={values.sale === "on"}
                name="sale"
                type="checkbox"
              />
              Sale items
            </label>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 text-sm font-semibold text-text transition-colors duration-200 hover:bg-surface">
              <input
                className="h-4 w-4 shrink-0 cursor-pointer accent-primary"
                defaultChecked={values.freshVegetables === "on"}
                name="freshVegetables"
                type="checkbox"
              />
              Fresh vegetables
            </label>
          </div>
        </fieldset>

        <label className="block">
          <span className="text-sm font-bold text-text">Sort by</span>
          <select
            className={`${controlClass} cursor-pointer`}
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

        <div className={`grid gap-2.5 border-t border-border/80 pt-5 sm:grid-cols-2 lg:grid-cols-1 ${compact ? "sticky bottom-0 -mx-3 bg-surface px-3 pb-1" : ""}`}>
          <button
            className="a1-primary-button cursor-pointer !rounded-xl px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            type="submit"
          >
            Apply filters
          </button>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-center text-sm font-bold text-text transition-[background-color,border-color] duration-200 hover:border-cta/40 hover:bg-cta-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href={lockedCategorySlug ? `/category/${lockedCategorySlug}` : "/products"}
          >
            Clear filters
          </Link>
        </div>
      </form>
    </aside>
  );
}
