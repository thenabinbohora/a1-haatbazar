"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { FloatingFeedbackToast } from "@/components/ui/floating-feedback-toast";
import type { StorefrontProductCard } from "@/lib/storefront";
import { useCart } from "@/store/cart-store";

type WeeklyOfferNotice = {
  anchorRect: DOMRect | null;
  message: string;
};

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      <path d="M3.5 4.5h2l1.7 9.1a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 1.9-1.4l1.3-5.2H6.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="19" r="1.25" />
      <circle cx="17" cy="19" r="1.25" />
    </svg>
  );
}

export function WeeklyOfferActions({ product, productHref }: { product: StorefrontProductCard; productHref: string }) {
  const { addItem } = useCart();
  const [notice, setNotice] = useState<WeeklyOfferNotice | null>(null);
  const addButtonRef = useRef<HTMLButtonElement | null>(null);
  const canDirectAdd = product.sellableVariantCount === 1 && product.isInStock && product.leadVariantStock > 0;

  function addSingleVariant() {
    const result = addItem({
      productId: product.id,
      variantId: product.leadVariantId,
      quantity: 1,
      maxStock: product.leadVariantStock,
    });

    setNotice({
      anchorRect: addButtonRef.current?.getBoundingClientRect() ?? null,
      message: result.wasAdjusted ? "Cart updated to available stock" : "Added to cart",
    });
  }

  return (
    <>
      {notice ? (
        <FloatingFeedbackToast
          anchorRect={notice.anchorRect}
          message={notice.message}
          onClose={() => setNotice(null)}
        />
      ) : null}
      <div className="pt-3">
        {!product.isInStock ? (
          <button
            aria-label={`${product.name} is out of stock`}
            className="inline-flex h-11 w-full cursor-not-allowed items-center justify-center rounded-xl bg-surface-muted px-3 py-2 text-sm font-extrabold text-text-muted disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            disabled
            type="button"
          >
            Out of stock
          </button>
        ) : canDirectAdd ? (
          <button
            aria-label={`Add ${product.name} to cart`}
            className="a1-primary-button h-11 w-full cursor-pointer gap-2 rounded-xl px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
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
            className="a1-primary-button h-11 w-full gap-2 rounded-xl px-3 py-2 text-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
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
