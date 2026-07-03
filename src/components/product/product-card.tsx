"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { StorefrontProductCard } from "@/lib/storefront";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { formatCurrency } from "@/components/product/price";
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
    <span className={`rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold leading-4 sm:px-2.5 sm:py-1 sm:text-xs ${toneClass}`}>
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

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="mr-1.5 h-3.5 w-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.4"
      viewBox="0 0 24 24"
    >
      <path d="m5 12 4 4 10-9" />
    </svg>
  );
}

export function ProductCard({ product, variant = "standard", imagePriority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { isSaved: isProductSaved, setSaved } = useWishlist();
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<"success" | "error">("success");
  const isSaved = isProductSaved(product.id);
  const noticeTimerRef = useRef<number | null>(null);
  const canDirectAdd = product.sellableVariantCount === 1 && product.isInStock && product.leadVariantStock > 0;
  const isCompact = variant === "compact";
  const detailLabel = "View details";
  const optionLabel = "Select pack";

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  function showInlineNotice(message: string, tone: "success" | "error" = "success") {
    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }

    setNotice(message);
    setNoticeTone(tone);
    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimerRef.current = null;
    }, 3000);
  }

  function addSingleVariant() {
    addItem({
      productId: product.id,
      variantId: product.leadVariantId,
      quantity: 1,
      maxStock: product.leadVariantStock,
    });

    showInlineNotice("Added to cart");
  }

  async function toggleWishlist() {
    const response = await fetch("/api/wishlist/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });

    if (response.status === 401) {
      showInlineNotice("Sign in to save this product.", "error");
      return;
    }

    if (!response.ok) {
      showInlineNotice("Wishlist could not be updated.", "error");
      return;
    }

    const result = (await response.json()) as { saved: boolean };
    setSaved(product.id, result.saved);
    showInlineNotice(result.saved ? "Saved to wishlist" : "Removed from wishlist");
  }

  return (
    <article className="a1-lift group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <Link
        aria-label={`View ${product.name}`}
        className="relative block aspect-square bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        href={`/products/${product.slug}`}
        scroll
      >
        {product.imageUrl ? (
          <Image
            alt={product.imageAlt}
            className={[
              "h-full w-full transition-transform duration-300 group-hover:scale-[1.02]",
              isCompact ? "object-contain p-2.5 sm:p-4" : "object-cover",
            ].join(" ")}
            fill
            priority={imagePriority}
            sizes={isCompact ? "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : "(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            src={product.imageUrl}
            unoptimized
          />
        ) : (
          <ProductImagePlaceholder category={product.category.name} name={product.name} />
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
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
        type="button"
      >
        <HeartIcon filled={isSaved} />
      </button>

      <div className={["flex flex-1 flex-col", isCompact ? "p-3 sm:p-3.5" : "p-3 sm:p-4"].join(" ")}>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <Badge tone={product.isInStock ? "fresh" : "neutral"}>
            {stockCopy(product)}
          </Badge>
          {product.variantCount > 1 ? <Badge>{product.variantCount} options</Badge> : null}
        </div>

        <div className={["mt-2 sm:mt-3", isCompact ? "sm:min-h-24" : "sm:min-h-28"].join(" ")}>
          <p className="line-clamp-1 text-[0.68rem] font-semibold uppercase leading-4 text-fresh sm:text-xs">{product.category.name}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-text sm:text-base sm:leading-6">
            <Link
              className="rounded-sm transition-colors hover:text-cta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href={`/products/${product.slug}`}
              scroll
            >
              {product.name}
            </Link>
          </h3>
          <p className={["mt-1 hidden text-sm leading-5 text-text-muted sm:block", isCompact ? "line-clamp-1" : "line-clamp-2"].join(" ")}>{product.description}</p>
        </div>

        <div className="mt-3 flex items-end justify-between gap-3 sm:mt-4">
          <div>
            <p className="line-clamp-1 text-[0.68rem] font-semibold leading-4 text-text-muted sm:text-xs">{product.variantLabel}</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className={["font-bold tabular-nums text-text", isCompact ? "text-base sm:text-lg" : "text-base sm:text-xl"].join(" ")}>
                From {formatCurrency(product.startingPrice, product.currency)}
              </span>
              {product.compareAtPrice ? (
                <span className="text-sm font-semibold text-text-muted line-through">
                  {formatCurrency(product.compareAtPrice, product.currency)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={[
            "mt-2 flex min-h-5 items-center text-[0.68rem] font-bold sm:mt-3 sm:text-xs",
            noticeTone === "error" ? "text-danger" : "text-primary",
            notice ? "opacity-100" : "opacity-0",
          ].join(" ")}
          aria-live="polite"
        >
          {notice ? (
            <>
              <CheckIcon />
              <span className="line-clamp-1">{notice}</span>
            </>
          ) : (
            <span aria-hidden="true">&nbsp;</span>
          )}
        </div>

        <div className="mt-1.5 grid grid-cols-1 gap-2 sm:mt-2 sm:grid-cols-[0.9fr_1.1fr]">
          <Link
            className="hidden min-h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-md border border-border/80 bg-transparent px-3 py-2 text-center text-sm font-bold text-text-muted transition-colors hover:border-primary/30 hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:inline-flex"
            href={`/products/${product.slug}`}
            scroll
          >
            {detailLabel}
          </Link>
          {canDirectAdd ? (
            <button
              className="a1-primary-button min-h-10 min-w-0 cursor-pointer whitespace-nowrap px-2 py-2 text-center text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:min-h-11 sm:px-3 sm:text-sm"
              onClick={addSingleVariant}
              type="button"
            >
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add to cart</span>
            </button>
          ) : (
            <Link
              className="a1-primary-button min-h-10 min-w-0 whitespace-nowrap px-2 py-2 text-center text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:min-h-11 sm:px-3 sm:text-sm"
              href={`/products/${product.slug}`}
              scroll
            >
              {product.variantCount > 1 ? optionLabel : "Details"}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
