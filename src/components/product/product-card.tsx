import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { StorefrontProductCard } from "@/lib/storefront";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { ProductCardPurchaseActions, ProductCardWishlistAction } from "@/components/product/product-card-actions";
import { formatCurrency } from "@/components/product/price";

type ProductCardProps = {
  product: StorefrontProductCard;
  variant?: "standard" | "compact";
  imagePriority?: boolean;
};

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "sale" | "fresh" }) {
  const toneClass =
    tone === "sale"
      ? "border-cta bg-cta-soft text-cta-hover"
      : tone === "fresh"
        ? "border-fresh bg-fresh-soft text-fresh"
        : "border-border bg-surface text-text-muted";

  return (
    <span className={`inline-flex max-w-full items-center rounded-full border px-2 py-0.5 text-[0.66rem] font-bold leading-4 sm:text-[0.72rem] ${toneClass}`}>
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

export function ProductCard({ product, variant = "standard", imagePriority = false }: ProductCardProps) {
  const isCompact = variant === "compact";
  const productHref = `/products/${product.slug}`;

  return (
    <article className="a1-lift group relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <Link
        aria-label={`View ${product.name}`}
        className="relative block aspect-[4/3] overflow-hidden bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        href={productHref}
        prefetch={false}
        scroll
      >
        {product.imageUrl ? (
          <Image
            alt={product.imageAlt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            fill
            priority={imagePriority}
            sizes={
              isCompact
                ? "(max-width: 359px) 76vw, (max-width: 639px) 280px, (min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
                : "(max-width: 359px) calc(100vw - 32px), (max-width: 639px) calc(50vw - 24px), (min-width: 1536px) 25vw, (min-width: 1024px) 33vw, 50vw"
            }
            src={product.imageUrl}
          />
        ) : (
          <ProductImagePlaceholder category={product.category.name} name={product.name} />
        )}

        <div className="absolute left-2 top-2 flex max-w-[calc(100%-3.5rem)] flex-wrap gap-1.5 sm:left-3 sm:top-3 sm:max-w-[calc(100%-4.25rem)] sm:gap-2">
          {product.isOnSale ? <Badge tone="sale">{product.discountPercent}% off</Badge> : null}
          {product.isWeeklyOffer ? <Badge tone="sale">Weekly offer</Badge> : null}
          {product.isBestSeller ? <Badge>Best seller</Badge> : null}
        </div>
      </Link>
      <ProductCardWishlistAction product={product} />

      <div className={["flex min-w-0 flex-1 flex-col", isCompact ? "p-3" : "p-3 sm:p-3.5"].join(" ")}>
        <div className="flex min-h-6 flex-wrap gap-1.5 overflow-hidden sm:min-h-7">
          <Badge tone={product.isInStock ? "fresh" : "neutral"}>
            {stockCopy(product)}
          </Badge>
          {product.variantCount > 1 ? <Badge>{product.variantCount} options</Badge> : null}
        </div>

        <div className="mt-1.5 flex min-w-0 flex-1 flex-col sm:mt-2">
          <p className="line-clamp-1 text-[0.68rem] font-extrabold uppercase leading-4 tracking-[0.08em] text-fresh sm:text-[0.72rem]">{product.category.name}</p>
          <h3 className="mt-1 min-h-10 text-sm font-bold leading-5 text-text sm:min-h-12 sm:text-base sm:leading-6">
            <Link
              className="line-clamp-2 rounded-sm transition-colors hover:text-cta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href={productHref}
              prefetch={false}
              scroll
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-1 text-[0.7rem] font-bold leading-4 text-text-muted sm:mt-1.5 sm:text-xs">
            {product.variantLabel}
          </p>

          <div className="mt-auto pt-2 sm:pt-2.5">
            <div className="min-h-10 sm:min-h-11">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className={["font-extrabold tabular-nums text-text", isCompact ? "text-base sm:text-lg" : "text-lg sm:text-xl"].join(" ")}>
                  From {formatCurrency(product.startingPrice, product.currency)}
                </span>
                {product.compareAtPrice ? (
                  <span className="text-xs font-bold text-text-muted line-through sm:text-sm">
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
