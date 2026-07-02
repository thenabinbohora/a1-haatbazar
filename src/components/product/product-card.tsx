"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { StorefrontProductCard } from "@/lib/storefront";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { formatCurrency } from "@/components/product/price";
import { useCart } from "@/store/cart-store";

type ProductCardProps = {
  product: StorefrontProductCard;
  variant?: "standard" | "compact";
};

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "sale" | "fresh" }) {
  const toneClass =
    tone === "sale"
      ? "border-cta bg-cta-soft text-cta-hover"
      : tone === "fresh"
        ? "border-fresh bg-fresh-soft text-fresh"
        : "border-border bg-surface text-text-muted";

  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass}`}>
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

export function ProductCard({ product, variant = "standard" }: ProductCardProps) {
  const { addItem } = useCart();
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeTone, setNoticeTone] = useState<"success" | "error">("success");
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
    showInlineNotice(result.saved ? "Saved to wishlist" : "Removed from wishlist");
  }

  return (
    <article className="a1-lift group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
      <Link
        aria-label={`View ${product.name}`}
        className={[
          "relative block bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta",
          isCompact ? "h-56" : "aspect-square",
        ].join(" ")}
        href={`/products/${product.slug}`}
        scroll
      >
        {product.imageUrl ? (
          <Image
            alt={product.imageAlt}
            className={[
              "h-full w-full transition-transform duration-300 group-hover:scale-[1.02]",
              isCompact ? "object-contain p-4" : "object-cover",
            ].join(" ")}
            fill
            sizes={isCompact ? "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" : "(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            src={product.imageUrl}
            unoptimized
          />
        ) : (
          <ProductImagePlaceholder category={product.category.name} name={product.name} />
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {product.isOnSale ? <Badge tone="sale">{product.discountPercent}% off</Badge> : null}
          {product.isWeeklyOffer ? <Badge tone="sale">Weekly offer</Badge> : null}
          {product.isBestSeller ? <Badge>Best seller</Badge> : null}
        </div>
      </Link>
      <button
        aria-label={`Save ${product.name} to wishlist`}
        className="absolute right-3 top-3 z-10 min-h-9 cursor-pointer rounded-full border border-border bg-white/95 px-3 text-xs font-bold text-primary shadow-sm transition-colors hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        onClick={toggleWishlist}
        type="button"
      >
        Save
      </button>

      <div className={["flex flex-1 flex-col", isCompact ? "p-3.5" : "p-4"].join(" ")}>
        <div className="flex flex-wrap gap-2">
          <Badge tone={product.isInStock ? "fresh" : "neutral"}>
            {stockCopy(product)}
          </Badge>
          {product.variantCount > 1 ? <Badge>{product.variantCount} options</Badge> : null}
        </div>

        <div className={["mt-3", isCompact ? "min-h-24" : "min-h-28"].join(" ")}>
          <p className="text-xs font-semibold uppercase text-fresh">{product.category.name}</p>
          <h3 className="mt-1 line-clamp-2 text-base font-bold leading-6 text-text">
            <Link
              className="rounded-sm transition-colors hover:text-cta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href={`/products/${product.slug}`}
              scroll
            >
              {product.name}
            </Link>
          </h3>
          <p className={["mt-1 text-sm leading-5 text-text-muted", isCompact ? "line-clamp-1" : "line-clamp-2"].join(" ")}>{product.description}</p>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-text-muted">{product.variantLabel}</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <span className={["font-bold text-text", isCompact ? "text-lg" : "text-xl"].join(" ")}>
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
            "mt-3 flex min-h-5 items-center text-xs font-bold",
            noticeTone === "error" ? "text-danger" : "text-primary",
            notice ? "opacity-100" : "opacity-0",
          ].join(" ")}
          aria-live="polite"
        >
          {notice ? (
            <>
              <span aria-hidden="true" className="mr-1.5">
                ✓
              </span>
              <span className="line-clamp-1">{notice}</span>
            </>
          ) : (
            <span aria-hidden="true">&nbsp;</span>
          )}
        </div>

        <div className="mt-2 grid grid-cols-[0.9fr_1.1fr] gap-2">
          <Link
            className="inline-flex min-h-11 min-w-0 items-center justify-center whitespace-nowrap rounded-md border border-border/80 bg-transparent px-3 py-2 text-center text-sm font-bold text-text-muted transition-colors hover:border-primary/30 hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href={`/products/${product.slug}`}
            scroll
          >
            {detailLabel}
          </Link>
          {canDirectAdd ? (
            <button
              className="a1-primary-button min-w-0 cursor-pointer whitespace-nowrap px-3 py-2 text-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              onClick={addSingleVariant}
              type="button"
            >
              Add to cart
            </button>
          ) : (
            <Link
              className="a1-primary-button min-w-0 whitespace-nowrap px-3 py-2 text-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href={`/products/${product.slug}`}
              scroll
            >
              {product.variantCount > 1 ? optionLabel : detailLabel}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
