"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import type { ReactNode } from "react";
import type { StorefrontProductCard } from "@/lib/storefront";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { formatCurrency } from "@/components/product/price";
import { FloatingFeedbackToast } from "@/components/ui/floating-feedback-toast";
import { useCart } from "@/store/cart-store";
import { useWishlist } from "@/store/wishlist-store";

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

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px] transition-transform duration-200"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      <path d="M12 20.3 4.9 13a4.9 4.9 0 0 1 0-6.9 4.7 4.7 0 0 1 6.8 0l.3.4.3-.4a4.7 4.7 0 0 1 6.8 0 4.9 4.9 0 0 1 0 6.9L12 20.3Z" />
    </svg>
  );
}

type FloatingNotice = {
  actionHref?: string;
  actionLabel?: string;
  anchorRect?: DOMRect | null;
  message: string;
  tone: "success" | "error";
};

export function ProductCard({ product, variant = "standard", imagePriority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { isSaved: isProductSaved, setSaved } = useWishlist();
  const [floatingNotice, setFloatingNotice] = useState<FloatingNotice | null>(null);
  const isSaved = isProductSaved(product.id);
  const heartButtonRef = useRef<HTMLButtonElement | null>(null);
  const addButtonRef = useRef<HTMLButtonElement | null>(null);
  const canDirectAdd = product.sellableVariantCount === 1 && product.isInStock && product.leadVariantStock > 0;
  const isCompact = variant === "compact";
  const detailLabel = "View details";
  const optionLabel = "Select pack";
  const productHref = `/products/${product.slug}`;

  function showFloatingNotice(
    message: string,
    tone: "success" | "error" = "success",
    anchor: HTMLElement | null = null,
    action?: Pick<FloatingNotice, "actionHref" | "actionLabel">,
  ) {
    setFloatingNotice({
      ...action,
      anchorRect: anchor?.getBoundingClientRect() ?? null,
      message,
      tone,
    });
  }

  function addSingleVariant() {
    addItem({
      productId: product.id,
      variantId: product.leadVariantId,
      quantity: 1,
      maxStock: product.leadVariantStock,
    });

    showFloatingNotice("Added to cart", "success", addButtonRef.current);
  }

  async function toggleWishlist() {
    const response = await fetch("/api/wishlist/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });

    if (response.status === 401) {
      const nextPath = `${window.location.pathname}${window.location.search}`;
      showFloatingNotice("Sign in to save items", "error", heartButtonRef.current, {
        actionHref: `/login?next=${encodeURIComponent(nextPath)}`,
        actionLabel: "Sign in",
      });
      return;
    }

    if (!response.ok) {
      showFloatingNotice("Wishlist could not be updated", "error", heartButtonRef.current);
      return;
    }

    const result = (await response.json()) as { saved: boolean };
    setSaved(product.id, result.saved);
    showFloatingNotice(result.saved ? "Saved to wishlist" : "Removed from wishlist", "success", heartButtonRef.current);
  }

  return (
    <article className="a1-lift group relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <Link
        aria-label={`View ${product.name}`}
        className="relative block aspect-[4/3] overflow-hidden bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        href={productHref}
        scroll
      >
        {product.imageUrl ? (
          <Image
            alt={product.imageAlt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            fill
            priority={imagePriority}
            sizes={isCompact ? "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : "(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            src={product.imageUrl}
            unoptimized
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
      <button
        aria-label={`Save ${product.name} to wishlist`}
        aria-pressed={isSaved}
        className={[
          "absolute right-2 top-2 z-10 grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-border bg-white/95 shadow-sm transition-[background,color,transform] duration-200 hover:scale-105 hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:right-3 sm:top-3 sm:h-10 sm:w-10",
          isSaved ? "text-danger" : "text-primary",
        ].join(" ")}
        onClick={toggleWishlist}
        ref={heartButtonRef}
        type="button"
      >
        <HeartIcon filled={isSaved} />
      </button>
      {floatingNotice ? (
        <FloatingFeedbackToast
          actionHref={floatingNotice.actionHref}
          actionLabel={floatingNotice.actionLabel}
          anchorRect={floatingNotice.anchorRect}
          message={floatingNotice.message}
          onClose={() => setFloatingNotice(null)}
          tone={floatingNotice.tone}
        />
      ) : null}

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

        <div className="flex flex-col gap-1">
          {!product.isInStock ? (
            <button
              aria-label={`${product.name} is out of stock`}
              className="min-h-10 w-full min-w-0 cursor-not-allowed overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-surface-muted px-2 py-2 text-center text-xs font-extrabold text-text-muted sm:min-h-11 sm:px-3 sm:text-sm"
              disabled
              type="button"
            >
              Out of stock
            </button>
          ) : canDirectAdd ? (
            <button
              aria-label={`Add ${product.name} to cart`}
              className="a1-primary-button min-h-10 w-full min-w-0 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap px-2 py-2 text-center text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:min-h-11 sm:px-3 sm:text-sm"
              onClick={addSingleVariant}
              ref={addButtonRef}
              type="button"
            >
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add to cart</span>
            </button>
          ) : (
            <Link
              aria-label={`Select a pack for ${product.name}`}
              className="a1-primary-button min-h-10 w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 py-2 text-center text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:min-h-11 sm:px-3 sm:text-sm"
              href={productHref}
              scroll
            >
              {optionLabel}
            </Link>
          )}
          <Link
            aria-label={`View details for ${product.name}`}
            className="relative mx-auto inline-flex min-h-7 w-fit items-center justify-center whitespace-nowrap rounded-sm px-1 text-center text-[0.72rem] font-bold text-primary/75 transition-colors after:absolute after:bottom-1 after:left-1 after:right-1 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 hover:text-primary hover:after:scale-x-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta focus-visible:after:scale-x-100 sm:text-xs"
            href={productHref}
            scroll
          >
            {detailLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
