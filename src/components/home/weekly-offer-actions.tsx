"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { StorefrontProductCard } from "@/lib/storefront";
import { useCart } from "@/store/cart-store";

export function WeeklyOfferActions({ product, productHref }: { product: StorefrontProductCard; productHref: string }) {
  const { addItem } = useCart();
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const canDirectAdd = product.sellableVariantCount === 1 && product.isInStock && product.leadVariantStock > 0;

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  function addSingleVariant() {
    const result = addItem({
      productId: product.id,
      variantId: product.leadVariantId,
      quantity: 1,
      maxStock: product.leadVariantStock,
    });

    setNotice(result.wasAdjusted ? "Cart updated to available stock" : "Added to cart");

    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }

    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimerRef.current = null;
    }, 2800);
  }

  return (
    <div className="pt-1.5 sm:pt-2">
      <div className="min-h-5 text-xs font-bold leading-5 text-primary sm:min-h-6 sm:text-sm" aria-live="polite">
        {notice ?? ""}
      </div>
      {!product.isInStock ? (
        <button
          aria-label={`${product.name} is out of stock`}
          className="mt-1.5 min-h-11 w-full cursor-not-allowed rounded-xl bg-surface-muted px-3 py-2 text-sm font-extrabold text-text-muted disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          disabled
          type="button"
        >
          Out of stock
        </button>
      ) : canDirectAdd ? (
        <button
          aria-label={`Add ${product.name} to cart`}
          className="a1-primary-button mt-1.5 min-h-11 w-full cursor-pointer rounded-xl px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          onClick={addSingleVariant}
          type="button"
        >
          <span className="sm:hidden">Add</span>
          <span className="hidden sm:inline">Add to cart</span>
        </button>
      ) : (
        <Link
          aria-label={`Select a pack for ${product.name}`}
          className="a1-primary-button mt-1.5 min-h-11 w-full rounded-xl px-3 py-2 text-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          href={productHref}
          prefetch={false}
          scroll
        >
          Select pack
        </Link>
      )}
    </div>
  );
}
