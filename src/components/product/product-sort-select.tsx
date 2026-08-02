"use client";

import { PRODUCT_SORT_OPTIONS, type ProductSort } from "@/lib/product-filter-state";

type ProductSortSelectProps = {
  className?: string;
  disabled?: boolean;
  onChange: (sort: ProductSort) => void;
  showVisibleLabel?: boolean;
  value?: ProductSort;
};

export function ProductSortSelect({
  className = "",
  disabled = false,
  onChange,
  showVisibleLabel = false,
  value = "recommended",
}: ProductSortSelectProps) {
  return (
    <label
      className={`flex min-w-0 items-center gap-2 ${className}`}
    >
      <span
        className={
          showVisibleLabel
            ? "sr-only lg:not-sr-only lg:shrink-0 lg:text-sm lg:font-bold lg:text-text-muted"
            : "sr-only"
        }
      >
        Sort by
      </span>
      <span className="relative block min-w-0 flex-1 lg:w-48 lg:flex-none">
        <select
          className="min-h-11 w-full min-w-0 cursor-pointer appearance-none truncate rounded-lg border border-border bg-surface py-2 pl-2 pr-6 text-base font-semibold text-text shadow-[0_1px_2px_rgba(24,38,27,0.05)] outline-none transition-[background-color,border-color,box-shadow] duration-200 hover:border-primary/35 hover:bg-fresh-soft focus:border-cta focus:ring-2 focus:ring-cta/20 disabled:cursor-wait disabled:opacity-65 lg:pl-3 lg:pr-8 lg:text-sm"
          data-product-sort
          disabled={disabled}
          onChange={(event) => onChange(event.target.value as ProductSort)}
          value={value}
        >
          {PRODUCT_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary lg:right-2.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </label>
  );
}
