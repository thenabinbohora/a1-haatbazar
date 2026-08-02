import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { StorefrontProductCard } from "@/lib/storefront";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { ProductCardPurchaseActions, ProductCardWishlistAction } from "@/components/product/product-card-actions";
import { formatCurrency } from "@/components/product/price";

type ProductCardProps = {
  product: StorefrontProductCard;
  variant?: "standard" | "compact" | "featured";
  imagePriority?: boolean;
  className?: string;
};

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "sale" | "fresh" }) {
  const toneClass =
    tone === "sale"
      ? "border-cta/35 bg-cta-soft text-cta-hover"
      : tone === "fresh"
        ? "border-fresh/25 bg-fresh-soft text-fresh"
        : "border-border/90 bg-surface/95 text-text-muted";

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border px-2 py-1 text-[0.7rem] font-extrabold leading-none tracking-[0.01em] shadow-sm sm:px-2.5 ${toneClass}`}
    >
      {children}
    </span>
  );
}

function stockCopy(product: StorefrontProductCard) {
  if (!product.isInStock) {
    return "Out of stock";
  }

  if (product.totalStock <= 5) {
    return `Only ${product.totalStock} left`;
  }

  return "In stock today";
}

export function ProductCard({ product, variant = "standard", imagePriority = false, className = "" }: ProductCardProps) {
  const isFeatured = variant === "featured";
  const isCompact = variant === "compact" || isFeatured;
  const productHref = `/products/${product.slug}`;

  return (
    <article
      className={`group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/90 bg-surface shadow-[0_8px_28px_rgba(24,38,27,0.07)] transition-[border-color,box-shadow] duration-200 hover:border-cta/35 hover:shadow-[0_16px_40px_rgba(24,38,27,0.12)] ${className}`}
      data-starting-price={product.startingPrice}
    >
      <Link
        aria-label={`View ${product.name}`}
        className="relative block aspect-[4/3] overflow-hidden bg-surface-muted focus-visible:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-cta"
        href={productHref}
        prefetch={false}
        scroll
      >
        {product.imageUrl ? (
          <Image
            alt={product.imageAlt}
            className={[
              "h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.025]",
              isFeatured ? "object-cover" : "object-contain p-3 sm:p-4",
            ].join(" ")}
            fill
            priority={imagePriority}
            sizes={
              isFeatured
                ? "(max-width: 639px) calc(50vw - 22px), (max-width: 767px) calc(50vw - 30px), (max-width: 1023px) calc(33.333vw - 27px), (max-width: 1279px) calc(25vw - 28px), 292px"
                : isCompact
                ? "(max-width: 359px) 76vw, (max-width: 639px) 280px, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
                : "(max-width: 359px) calc(100vw - 32px), (max-width: 639px) calc(50vw - 24px), (min-width: 1536px) 25vw, (min-width: 1024px) 33vw, 50vw"
            }
            src={product.imageUrl}
          />
        ) : (
          <ProductImagePlaceholder category={product.category.name} name={product.name} />
        )}

        <div className="absolute left-2.5 top-2.5 flex max-w-[calc(100%-3.75rem)] flex-wrap gap-1.5 sm:left-3 sm:top-3 sm:max-w-[calc(100%-4.5rem)]">
          {product.isOnSale ? (
            <Badge tone="sale">{product.discountPercent}% off</Badge>
          ) : product.isWeeklyOffer ? (
            <Badge tone="sale">Weekly offer</Badge>
          ) : product.isBestSeller ? (
            <Badge>Best seller</Badge>
          ) : null}
        </div>
      </Link>
      <ProductCardWishlistAction product={product} />

      <div className={["flex min-w-0 flex-1 flex-col", isCompact ? "p-3" : "p-2.5 sm:p-4"].join(" ")}>
        <div className="flex min-h-6 flex-wrap gap-1.5 overflow-hidden sm:min-h-7">
          <Badge tone={product.isInStock ? "fresh" : "neutral"}>
            {stockCopy(product)}
          </Badge>
          {product.variantCount > 1 ? <Badge>{product.variantCount} options</Badge> : null}
        </div>

        <div className="mt-2.5 flex min-w-0 flex-1 flex-col">
          <p className="line-clamp-1 text-[0.7rem] font-extrabold uppercase leading-4 tracking-[0.1em] text-fresh">
            {product.category.name}
          </p>
          <h3 className="mt-1 min-h-10 text-sm font-extrabold leading-5 text-text sm:min-h-12 sm:text-base sm:leading-6">
            <Link
              className="line-clamp-2 rounded-sm transition-colors duration-200 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href={productHref}
              prefetch={false}
              scroll
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-1 text-xs font-semibold leading-4 text-text-muted sm:mt-1.5">
            {product.variantLabel}
          </p>

          <div className="mt-auto pt-3">
            <div className="min-h-11 border-t border-border/70 pt-2.5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-text-muted">From</span>
                <span
                  className={[
                    "font-black leading-none tabular-nums text-primary",
                    isCompact ? "text-lg sm:text-xl" : "text-xl sm:text-2xl",
                  ].join(" ")}
                >
                  {product.compareAtPrice ? <span className="sr-only">Sale price </span> : null}
                  {formatCurrency(product.startingPrice, product.currency)}
                </span>
                {product.compareAtPrice ? (
                  <span className="text-xs font-semibold tabular-nums text-text-muted line-through sm:text-sm">
                    <span className="sr-only">Original price </span>
                    {formatCurrency(product.compareAtPrice, product.currency)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <ProductCardPurchaseActions product={product} productHref={productHref} />
      </div>
    </article>
  );
}
