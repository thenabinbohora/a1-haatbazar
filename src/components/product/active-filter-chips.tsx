"use client";

import {
  formatFilterPrice,
  type ProductFilterContext,
  type ProductFilterKey,
  type StorefrontSearchParams,
} from "@/lib/product-filter-state";
import type { StorefrontFilters } from "@/lib/storefront";

type ActiveFilterChipsProps = {
  context: ProductFilterContext;
  disabled?: boolean;
  filters: StorefrontFilters;
  onClear: () => void;
  onRemove: (key: ProductFilterKey) => void;
  values: StorefrontSearchParams;
};

type FilterChip = {
  key: ProductFilterKey;
  label: string;
};

function createFilterChips(
  filters: StorefrontFilters,
  values: StorefrontSearchParams,
  context: ProductFilterContext,
) {
  const categoryName = values.category
    ? filters.categories.find((category) => category.slug === values.category)?.name
    : undefined;
  const brandName = values.brand
    ? filters.brands.find((brand) => brand.slug === values.brand)?.name
    : undefined;
  const priceLabel =
    values.minPrice && values.maxPrice
      ? `${formatFilterPrice(values.minPrice)}–${formatFilterPrice(values.maxPrice)}`
      : values.minPrice
        ? `From ${formatFilterPrice(values.minPrice)}`
        : values.maxPrice
          ? `Under ${formatFilterPrice(values.maxPrice)}`
          : undefined;

  return [
    !context.lockedCategory && categoryName
      ? { key: "category", label: categoryName }
      : null,
    brandName ? { key: "brand", label: brandName } : null,
    priceLabel ? { key: "price", label: priceLabel } : null,
    values.inStock ? { key: "inStock", label: "In stock" } : null,
    context.collection !== "offers" && values.sale
      ? { key: "sale", label: "On sale" }
      : null,
    context.collection !== "featured" && values.featured
      ? { key: "featured", label: "Featured products" }
      : null,
    context.collection !== "best-sellers" && values.bestSeller
      ? { key: "bestSeller", label: "Best sellers" }
      : null,
  ].filter((chip): chip is FilterChip => Boolean(chip));
}

function RemoveIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d="m7 7 10 10M17 7 7 17" />
    </svg>
  );
}

export function ActiveFilterChips({
  context,
  disabled = false,
  filters,
  onClear,
  onRemove,
  values,
}: ActiveFilterChipsProps) {
  const chips = createFilterChips(filters, values, context);

  if (!chips.length) {
    return null;
  }

  return (
    <div
      aria-label="Active filters"
      className="mb-5 flex w-full max-w-full min-w-0 flex-wrap items-center gap-2"
      role="group"
    >
      {chips.map((chip) => (
        <span
          className="inline-flex max-w-full min-w-0 items-center rounded-full border border-cta/30 bg-cta-soft pl-3 text-xs font-extrabold text-cta-hover"
          key={chip.key}
        >
          <span className="min-w-0 break-words py-2 leading-4">{chip.label}</span>
          <button
            aria-label={`Remove ${chip.label} filter`}
            className="ml-1 grid min-h-10 min-w-10 shrink-0 cursor-pointer place-items-center rounded-full transition-colors hover:bg-cta/10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-60"
            disabled={disabled}
            onClick={() => onRemove(chip.key)}
            type="button"
          >
            <RemoveIcon />
          </button>
        </span>
      ))}
      {chips.length >= 2 ? (
        <button
          className="inline-flex min-h-10 cursor-pointer items-center rounded-full px-3 text-xs font-extrabold text-primary underline decoration-primary/30 underline-offset-4 transition-colors hover:decoration-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-60"
          disabled={disabled}
          onClick={onClear}
          type="button"
        >
          Clear all
        </button>
      ) : null}
    </div>
  );
}
