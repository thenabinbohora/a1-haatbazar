"use client";

import { useEffect, useRef, useState } from "react";
import { ProductFilterPanel } from "@/components/product/product-filter-panel";
import {
  clearProductFilters,
  countActiveProductFilters,
  type ProductFilterContext,
  type StorefrontSearchParams,
} from "@/lib/product-filter-state";
import type { StorefrontFilters } from "@/lib/storefront";

type DesktopFilterSidebarProps = {
  context: ProductFilterContext;
  disabled?: boolean;
  filters: StorefrontFilters;
  onNavigate: (values: StorefrontSearchParams) => void;
  values: StorefrontSearchParams;
};

function createValuesKey(values: StorefrontSearchParams) {
  return JSON.stringify([
    values.q,
    values.category,
    values.brand,
    values.minPrice,
    values.maxPrice,
    values.inStock,
    values.sale,
    values.featured,
    values.bestSeller,
    values.sort,
  ]);
}

export function DesktopFilterSidebar({
  context,
  disabled = false,
  filters,
  onNavigate,
  values,
}: DesktopFilterSidebarProps) {
  const [draft, setDraft] = useState(values);
  const [isPriceValid, setIsPriceValid] = useState(true);
  const activeCount = countActiveProductFilters(values, context);
  const valuesKey = createValuesKey(values);
  const previousValuesKey = useRef(valuesKey);

  useEffect(() => {
    if (previousValuesKey.current === valuesKey) {
      return;
    }

    previousValuesKey.current = valuesKey;
    setDraft(values);
    setIsPriceValid(true);
  }, [values, valuesKey]);

  function handleChange(next: StorefrontSearchParams) {
    const priceChanged =
      next.minPrice !== draft.minPrice || next.maxPrice !== draft.maxPrice;
    setDraft(next);

    if (priceChanged) {
      return;
    }

    const navigableValues = isPriceValid
      ? next
      : {
          ...next,
          minPrice: values.minPrice,
          maxPrice: values.maxPrice,
        };
    onNavigate(navigableValues);
  }

  return (
    <aside
      aria-label="Product filters"
      className="polished-scrollbar hidden w-full max-w-[280px] min-w-0 rounded-2xl border border-border bg-surface shadow-[0_10px_32px_rgba(24,38,27,0.07)] lg:sticky lg:block lg:max-h-[calc(100dvh-var(--site-header-offset)-2.5rem)] lg:overflow-y-auto"
      style={{
        top: "calc(var(--site-header-offset) + 1rem)",
      }}
    >
      <div className="sticky top-0 z-10 flex min-w-0 items-start justify-between gap-3 border-b border-border bg-surface px-5 py-4">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-fresh">
            Refine your shop
          </p>
          <h2 className="mt-0.5 text-lg font-extrabold text-text">Filters</h2>
        </div>
        {activeCount ? (
          <button
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-lg px-2 text-xs font-extrabold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-60"
            disabled={disabled}
            onClick={() => onNavigate(clearProductFilters(values))}
            type="button"
          >
            Reset
          </button>
        ) : null}
      </div>
      <div className="w-full max-w-full min-w-0 px-5 pb-2">
        <ProductFilterPanel
          context={context}
          filters={filters}
          mode="desktop"
          onApplyPrice={() => {
            if (isPriceValid) {
              onNavigate(draft);
            }
          }}
          onChange={handleChange}
          onPriceValidityChange={setIsPriceValid}
          values={draft}
        />
      </div>
    </aside>
  );
}
