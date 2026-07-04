import Link from "next/link";
import type { StorefrontProductCard } from "@/lib/storefront";
import { ProductCard } from "@/components/product/product-card";

type ProductGridProps = {
  products: StorefrontProductCard[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionHref?: string;
  emptyActionLabel?: string;
  variant?: "standard" | "related";
};

export function ProductGrid({
  products,
  emptyTitle = "No products found",
  emptyDescription = "Try a different search, category, or filter combination.",
  emptyActionHref,
  emptyActionLabel,
  variant = "standard",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
        <p className="text-lg font-bold text-text">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">{emptyDescription}</p>
        {emptyActionHref && emptyActionLabel ? (
          <Link
            className="a1-primary-button mt-4 inline-flex px-5 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href={emptyActionHref}
          >
            {emptyActionLabel}
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={
        variant === "related"
          ? "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
          : "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      }
    >
      {products.map((product, index) => (
        <ProductCard
          imagePriority={variant === "standard" && index < 2}
          key={product.id}
          product={product}
          variant={variant === "related" ? "compact" : "standard"}
        />
      ))}
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" aria-label="Loading products">
      {Array.from({ length: 8 }).map((_, index) => (
        <div className="rounded-lg border border-border bg-surface p-3 shadow-sm" key={index}>
          <div className="skeleton-shimmer aspect-square rounded-md" />
          <div className="skeleton-shimmer mt-4 h-4 w-24 rounded" />
          <div className="skeleton-shimmer mt-3 h-5 w-4/5 rounded" />
          <div className="skeleton-shimmer mt-2 h-4 w-full rounded" />
          <div className="skeleton-shimmer mt-5 h-10 rounded-md" />
        </div>
      ))}
    </div>
  );
}
