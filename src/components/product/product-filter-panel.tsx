"use client";

import Link from "next/link";
import { useEffect, useId, useState, type ReactNode } from "react";
import type { ProductFilterContext, StorefrontSearchParams } from "@/lib/product-filter-state";
import type { StorefrontFilters } from "@/lib/storefront";

type ProductFilterPanelProps = {
  context: ProductFilterContext;
  filters: StorefrontFilters;
  mode: "desktop" | "mobile";
  onApplyPrice?: () => void;
  onChange: (values: StorefrontSearchParams) => void;
  onPriceValidityChange?: (isValid: boolean) => void;
  values: StorefrontSearchParams;
};

type FilterGroupProps = {
  children: ReactNode;
  title: string;
};

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterGroup({ children, title }: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const panelId = `${id}-panel`;

  return (
    <section className="w-full max-w-full min-w-0 border-b border-border/80 last:border-b-0">
      <h3>
        <button
          aria-controls={panelId}
          aria-expanded={isOpen}
          className="flex min-h-12 w-full min-w-0 cursor-pointer items-center justify-between gap-3 py-2.5 text-left text-sm font-extrabold text-text transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta"
          onClick={() => setIsOpen((open) => !open)}
          type="button"
        >
          <span className="min-w-0 break-words">{title}</span>
          <ChevronIcon isOpen={isOpen} />
        </button>
      </h3>
      <div className="w-full max-w-full min-w-0 pb-4" hidden={!isOpen} id={panelId}>
        {children}
      </div>
    </section>
  );
}

function RadioRow({
  checked,
  count,
  label,
  name,
  onChange,
  value,
}: {
  checked: boolean;
  count?: number;
  label: string;
  name: string;
  onChange: () => void;
  value: string;
}) {
  return (
    <label className="flex min-h-11 w-full max-w-full min-w-0 cursor-pointer items-start gap-3 rounded-xl px-2 py-2 text-sm text-text transition-colors hover:bg-surface-muted">
      <input
        checked={checked}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
        name={name}
        onChange={onChange}
        type="radio"
        value={value}
      />
      <span className="flex min-w-0 flex-1 items-start justify-between gap-2 leading-5">
        <span className="min-w-0 break-words font-semibold">{label}</span>
        {typeof count === "number" ? (
          <span className="shrink-0 text-xs font-bold tabular-nums text-text-muted">{count}</span>
        ) : null}
      </span>
    </label>
  );
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 w-full max-w-full min-w-0 cursor-pointer items-start gap-3 rounded-xl px-2 py-2 text-sm text-text transition-colors hover:bg-surface-muted">
      <input
        checked={checked}
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span className="min-w-0 break-words font-semibold leading-5">{label}</span>
    </label>
  );
}

function getPriceError(values: StorefrontSearchParams) {
  const minimum = values.minPrice ? Number(values.minPrice) : undefined;
  const maximum = values.maxPrice ? Number(values.maxPrice) : undefined;

  if (minimum !== undefined && (!Number.isFinite(minimum) || minimum < 0)) {
    return "Minimum price must be $0 or more.";
  }

  if (maximum !== undefined && (!Number.isFinite(maximum) || maximum < 0)) {
    return "Maximum price must be $0 or more.";
  }

  if (minimum !== undefined && maximum !== undefined && maximum < minimum) {
    return "Maximum price cannot be lower than minimum price.";
  }

  return null;
}

export function ProductFilterPanel({
  context,
  filters,
  mode,
  onApplyPrice,
  onChange,
  onPriceValidityChange,
  values,
}: ProductFilterPanelProps) {
  const id = useId();
  const priceError = getPriceError(values);
  const priceErrorId = `${id}-price-error`;
  const hasBrandChoices = filters.brands.length > 1 || Boolean(values.brand);
  const showSale = context.collection !== "offers" && (filters.collectionCounts.onSale > 0 || values.sale);
  const showFeatured =
    context.collection !== "featured" &&
    (filters.collectionCounts.featured > 0 || values.featured);
  const showBestSellers =
    context.collection !== "best-sellers" &&
    (filters.collectionCounts.bestSellers > 0 || values.bestSeller);
  const showCollections = showSale || showFeatured || showBestSellers;

  useEffect(() => {
    onPriceValidityChange?.(!priceError);
  }, [onPriceValidityChange, priceError]);

  function update(nextValues: Partial<StorefrontSearchParams>) {
    onChange({ ...values, ...nextValues });
  }

  return (
    <div
      className="product-filter-surface w-full max-w-full min-w-0"
      data-filter-mode={mode}
    >
      <FilterGroup title="Category">
        {context.lockedCategory ? (
          <div className="w-full max-w-full min-w-0 rounded-xl border border-primary/15 bg-fresh-soft p-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-fresh">
              Current category
            </p>
            <p className="mt-1 min-w-0 break-words text-sm font-extrabold leading-5 text-primary">
              {context.lockedCategory.name}
            </p>
            <Link
              className="mt-2 inline-flex min-h-11 items-center rounded-lg text-sm font-bold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href="/categories"
            >
              Change category
            </Link>
          </div>
        ) : (
          <fieldset className="w-full max-w-full min-w-0">
            <legend className="sr-only">Choose a category</legend>
            <div className="grid w-full max-w-full min-w-0 gap-0.5">
              <RadioRow
                checked={!values.category}
                label="All categories"
                name={`${id}-category`}
                onChange={() => update({ category: undefined })}
                value=""
              />
              {filters.categories.map((category) => (
                <RadioRow
                  checked={values.category === category.slug}
                  count={category.productCount}
                  key={category.id}
                  label={category.name}
                  name={`${id}-category`}
                  onChange={() => update({ category: category.slug })}
                  value={category.slug}
                />
              ))}
            </div>
          </fieldset>
        )}
      </FilterGroup>

      {hasBrandChoices ? (
        <FilterGroup title="Brand">
          <fieldset className="w-full max-w-full min-w-0">
            <legend className="sr-only">Choose a brand</legend>
            <div className="grid w-full max-w-full min-w-0 gap-0.5">
              <RadioRow
                checked={!values.brand}
                label="All brands"
                name={`${id}-brand`}
                onChange={() => update({ brand: undefined })}
                value=""
              />
              {filters.brands.map((brand) => (
                <RadioRow
                  checked={values.brand === brand.slug}
                  key={brand.id}
                  label={brand.name}
                  name={`${id}-brand`}
                  onChange={() => update({ brand: brand.slug })}
                  value={brand.slug}
                />
              ))}
            </div>
          </fieldset>
        </FilterGroup>
      ) : null}

      <FilterGroup title="Price">
        <fieldset className="w-full max-w-full min-w-0">
          <legend className="sr-only">Australian dollar price range</legend>
          <div className="grid w-full max-w-full min-w-0 grid-cols-2 gap-2.5 max-[350px]:grid-cols-1">
            <label className="block w-full max-w-full min-w-0">
              <span className="text-xs font-bold text-text-muted">Minimum price</span>
              <span className="mt-1.5 flex min-h-11 w-full max-w-full min-w-0 items-center rounded-xl border border-border bg-surface shadow-sm focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/20">
                <span aria-hidden="true" className="shrink-0 pl-3 text-sm font-bold text-text-muted">
                  $
                </span>
                <input
                  aria-label="Minimum price"
                  aria-describedby={priceError ? priceErrorId : undefined}
                  aria-invalid={Boolean(priceError)}
                  className="min-h-11 min-w-0 flex-1 border-0 bg-transparent px-2 text-base text-text outline-none"
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => update({ minPrice: event.target.value || undefined })}
                  step="0.01"
                  type="number"
                  value={values.minPrice ?? ""}
                />
              </span>
            </label>
            <label className="block w-full max-w-full min-w-0">
              <span className="text-xs font-bold text-text-muted">Maximum price</span>
              <span className="mt-1.5 flex min-h-11 w-full max-w-full min-w-0 items-center rounded-xl border border-border bg-surface shadow-sm focus-within:border-cta focus-within:ring-2 focus-within:ring-cta/20">
                <span aria-hidden="true" className="shrink-0 pl-3 text-sm font-bold text-text-muted">
                  $
                </span>
                <input
                  aria-label="Maximum price"
                  aria-describedby={priceError ? priceErrorId : undefined}
                  aria-invalid={Boolean(priceError)}
                  className="min-h-11 min-w-0 flex-1 border-0 bg-transparent px-2 text-base text-text outline-none"
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => update({ maxPrice: event.target.value || undefined })}
                  step="0.01"
                  type="number"
                  value={values.maxPrice ?? ""}
                />
              </span>
            </label>
          </div>
          {priceError ? (
            <p className="mt-2 text-xs font-bold leading-5 text-danger" id={priceErrorId} role="alert">
              {priceError}
            </p>
          ) : null}
          {mode === "desktop" && onApplyPrice ? (
            <button
              className="mt-3 inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl border border-primary/20 bg-fresh-soft px-3 text-sm font-extrabold text-primary transition-colors hover:border-primary/40 hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:opacity-55"
              disabled={Boolean(priceError)}
              onClick={onApplyPrice}
              type="button"
            >
              Apply price
            </button>
          ) : null}
        </fieldset>
      </FilterGroup>

      <FilterGroup title="Availability">
        <fieldset className="w-full max-w-full min-w-0">
          <legend className="sr-only">Availability</legend>
          <CheckboxRow
            checked={Boolean(values.inStock)}
            label="In stock only"
            onChange={(checked) => update({ inStock: checked || undefined })}
          />
        </fieldset>
      </FilterGroup>

      {showCollections ? (
        <FilterGroup title="Offers & collections">
          <fieldset className="w-full max-w-full min-w-0">
            <legend className="sr-only">Offers and product collections</legend>
            <div className="grid w-full max-w-full min-w-0 gap-0.5">
              {showSale ? (
                <CheckboxRow
                  checked={Boolean(values.sale)}
                  label="On sale"
                  onChange={(checked) => update({ sale: checked || undefined })}
                />
              ) : null}
              {showBestSellers ? (
                <CheckboxRow
                  checked={Boolean(values.bestSeller)}
                  label="Best sellers"
                  onChange={(checked) => update({ bestSeller: checked || undefined })}
                />
              ) : null}
              {showFeatured ? (
                <CheckboxRow
                  checked={Boolean(values.featured)}
                  label="Featured products"
                  onChange={(checked) => update({ featured: checked || undefined })}
                />
              ) : null}
            </div>
          </fieldset>
        </FilterGroup>
      ) : null}
    </div>
  );
}
