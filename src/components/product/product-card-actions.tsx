"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { StorefrontProductCard } from "@/lib/storefront";
import { FloatingFeedbackToast } from "@/components/ui/floating-feedback-toast";
import { useCart } from "@/store/cart-store";
import { useWishlist } from "@/store/wishlist-store";

type FloatingNotice = {
  actionHref?: string;
  actionLabel?: string;
  anchorRect?: DOMRect | null;
  message: string;
  tone: "success" | "error";
};

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

export function ProductCardWishlistAction({ product }: { product: StorefrontProductCard }) {
  const { isSaved: isProductSaved, setSaved } = useWishlist();
  const [floatingNotice, setFloatingNotice] = useState<FloatingNotice | null>(null);
  const heartButtonRef = useRef<HTMLButtonElement | null>(null);
  const isSaved = isProductSaved(product.id);

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
    <>
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
    </>
  );
}

export function ProductCardPurchaseActions({ product, productHref }: { product: StorefrontProductCard; productHref: string }) {
  const { addItem } = useCart();
  const [floatingNotice, setFloatingNotice] = useState<FloatingNotice | null>(null);
  const addButtonRef = useRef<HTMLButtonElement | null>(null);
  const canDirectAdd = product.sellableVariantCount === 1 && product.isInStock && product.leadVariantStock > 0;

  function addSingleVariant() {
    addItem({
      productId: product.id,
      variantId: product.leadVariantId,
      quantity: 1,
      maxStock: product.leadVariantStock,
    });

    setFloatingNotice({
      anchorRect: addButtonRef.current?.getBoundingClientRect() ?? null,
      message: "Added to cart",
      tone: "success",
    });
  }

  return (
    <>
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
            prefetch={false}
            scroll
          >
            Select pack
          </Link>
        )}
        <Link
          aria-label={`View details for ${product.name}`}
          className="relative mx-auto inline-flex min-h-7 w-fit items-center justify-center whitespace-nowrap rounded-sm px-1 text-center text-[0.72rem] font-bold text-primary/75 transition-colors after:absolute after:bottom-1 after:left-1 after:right-1 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 hover:text-primary hover:after:scale-x-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta focus-visible:after:scale-x-100 sm:text-xs"
          href={productHref}
          prefetch={false}
          scroll
        >
          View details
        </Link>
      </div>
    </>
  );
}
