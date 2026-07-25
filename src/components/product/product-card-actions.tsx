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
      className="h-5 w-5 transition-opacity duration-200"
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

function CartIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24">
      <path d="M3.5 4.5h2l1.7 9.1a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 1.9-1.4l1.3-5.2H6.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="19" r="1.25" />
      <circle cx="17" cy="19" r="1.25" />
    </svg>
  );
}

export function ProductCardWishlistAction({ product }: { product: StorefrontProductCard }) {
  const { isAuthenticated, isSaved: isProductSaved, setSaved, showSignInPrompt } = useWishlist();
  const [floatingNotice, setFloatingNotice] = useState<FloatingNotice | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
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
    if (isUpdating) {
      return;
    }

    if (!isAuthenticated) {
      showSignInPrompt();
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      if (response.status === 401) {
        showSignInPrompt();
        return;
      }

      if (!response.ok) {
        showFloatingNotice("Wishlist could not be updated", "error", heartButtonRef.current);
        return;
      }

      const result = (await response.json()) as { saved: boolean };
      setSaved(product.id, result.saved);
      showFloatingNotice(result.saved ? "Saved to wishlist" : "Removed from wishlist", "success", heartButtonRef.current);
    } catch {
      showFloatingNotice("Wishlist could not be updated", "error", heartButtonRef.current);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <>
      <button
        aria-busy={isUpdating}
        aria-label={
          !isAuthenticated
            ? `Sign in to save ${product.name} to wishlist`
            : isSaved
              ? `Remove ${product.name} from wishlist`
              : `Add ${product.name} to wishlist`
        }
        aria-pressed={isSaved}
        className={[
          "absolute right-2 top-2 z-10 grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-border/90 bg-surface/95 shadow-[0_4px_14px_rgba(24,38,27,0.12)] transition-[background-color,border-color,color] duration-200 hover:border-cta/50 hover:bg-cta-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-70 sm:right-3 sm:top-3",
          isSaved ? "text-danger" : "text-primary",
        ].join(" ")}
        disabled={isUpdating}
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
      <div>
        {!product.isInStock ? (
          <button
            aria-label={`${product.name} is out of stock`}
            className="min-h-11 w-full min-w-0 cursor-not-allowed overflow-hidden text-ellipsis whitespace-nowrap rounded-xl border border-border bg-surface-muted px-2 py-2 text-center text-xs font-extrabold text-text-muted sm:px-3 sm:text-sm"
            disabled
            type="button"
          >
            Out of stock
          </button>
        ) : canDirectAdd ? (
          <button
            aria-label={`Add ${product.name} to cart`}
            className="a1-primary-button min-h-11 w-full min-w-0 cursor-pointer gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap !rounded-xl px-2 py-2 text-center text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:gap-2 sm:px-3 sm:text-sm"
            onClick={addSingleVariant}
            ref={addButtonRef}
            type="button"
          >
            <CartIcon />
            <span>Add to cart</span>
          </button>
        ) : (
          <Link
            aria-label={`Select a pack for ${product.name}`}
            className="a1-primary-button min-h-11 w-full min-w-0 gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap !rounded-xl px-2 py-2 text-center text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:gap-2 sm:px-3 sm:text-sm"
            href={productHref}
            prefetch={false}
            scroll
          >
            <CartIcon />
            Select pack
          </Link>
        )}
      </div>
    </>
  );
}
