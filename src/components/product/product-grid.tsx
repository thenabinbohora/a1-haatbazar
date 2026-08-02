import Link from "next/link";
import type { StorefrontProductCard } from "@/lib/storefront";
import { ProductCard } from "@/components/product/product-card";

type ProductGridProps = {
  products: StorefrontProductCard[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  emptyActionOnClick?: () => void;
  priorityImageCount?: number;
  variant?: "standard" | "related" | "rail" | "compactGrid" | "featuredGrid" | "bestSellersGrid";
};

export function ProductGrid({
  products,
  emptyTitle = "No products found",
  emptyDescription = "Try a different search, category, or filter combination.",
  emptyActionHref,
  emptyActionLabel,
  emptyActionOnClick,
  priorityImageCount = 2,
  variant = "standard",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-5 py-12 text-center shadow-[0_10px_32px_rgba(24,38,27,0.06)] sm:px-8 sm:py-16">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border bg-surface-muted text-primary shadow-sm">
          <svg aria-hidden="true" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
            <path d="M4 7.5h16M6.5 7.5l1-3h9l1 3M5 7.5v11h14v-11M9 11h6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-5 text-lg font-extrabold text-text sm:text-xl">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">{emptyDescription}</p>
        {emptyActionOnClick && emptyActionLabel ? (
          <button
            className="a1-primary-button mt-5 inline-flex cursor-pointer !rounded-xl px-5 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            onClick={emptyActionOnClick}
            type="button"
          >
            {emptyActionLabel}
          </button>
        ) : emptyActionHref && emptyActionLabel ? (
          <Link
            className="a1-primary-button mt-5 inline-flex !rounded-xl px-5 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href={emptyActionHref}
            prefetch={false}
          >
            {emptyActionLabel}
          </Link>
        ) : null}
      </div>
    );
  }

  const usesMobileRail = variant === "related" || variant === "rail";
  const usesCompactCards =
    usesMobileRail || variant === "compactGrid" || variant === "featuredGrid" || variant === "bestSellersGrid";

  return (
    <div
      className={
        variant === "related"
          ? "a1-no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-2 [-webkit-overflow-scrolling:touch] sm:-mx-6 sm:gap-4 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4"
          : variant === "rail"
            ? "a1-no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-2 [-webkit-overflow-scrolling:touch] sm:-mx-6 sm:gap-4 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            : variant === "featuredGrid" || variant === "bestSellersGrid"
              ? "grid w-full max-w-full min-w-0 auto-rows-fr grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4"
            : variant === "compactGrid"
              ? "grid w-full max-w-full min-w-0 auto-rows-fr grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:auto-rows-auto md:grid-cols-3 md:gap-y-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              : "grid w-full max-w-full min-w-0 grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      }
    >
      {products.map((product, index) => (
        <ProductCard
          className={
            usesMobileRail
              ? "w-[66vw] max-w-[15rem] shrink-0 snap-start md:w-auto md:max-w-none"
              : variant === "featuredGrid" || variant === "bestSellersGrid"
                ? "w-full max-w-full min-w-0"
                : undefined
          }
          imagePriority={variant === "standard" && index < priorityImageCount}
          key={product.id}
          product={product}
          variant={variant === "featuredGrid" ? "featured" : usesCompactCards ? "compact" : "standard"}
        />
      ))}
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div
      aria-label="Loading products"
      aria-live="polite"
      className="grid w-full max-w-full min-w-0 grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm" key={index}>
          <div className="skeleton-shimmer aspect-[4/3]" />
          <div className="p-3.5 sm:p-4">
            <div className="skeleton-shimmer h-5 w-24 rounded-full" />
            <div className="skeleton-shimmer mt-3 h-3 w-20 rounded" />
            <div className="skeleton-shimmer mt-2 h-5 w-4/5 rounded" />
            <div className="skeleton-shimmer mt-2 h-4 w-2/3 rounded" />
            <div className="mt-4 border-t border-border pt-3">
              <div className="skeleton-shimmer h-6 w-28 rounded" />
            </div>
            <div className="skeleton-shimmer mt-4 h-11 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
