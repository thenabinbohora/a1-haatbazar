"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { removeWishlistItemAction } from "@/app/account/actions";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { formatCurrency } from "@/components/product/price";
import { useCart } from "@/store/cart-store";

export type WishlistItemView = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantCount: number;
  categoryName: string;
  imageUrl: string | null;
  imageAlt: string;
  variant: {
    id: string;
    name: string;
    price: number;
    salePrice: number | null;
    currency: string;
    stock: number;
  } | null;
};

function effectivePrice(item: WishlistItemView) {
  const variant = item.variant;

  if (!variant) {
    return null;
  }

  return variant.salePrice && variant.salePrice < variant.price ? variant.salePrice : variant.price;
}

function WishlistItemCard({ item }: { item: WishlistItemView }) {
  const { addItem } = useCart();
  const [notice, setNotice] = useState("");
  const productHref = `/products/${item.productSlug}`;
  const price = effectivePrice(item);
  const canAddToCart = Boolean(item.variant && item.variant.stock > 0);
  const needsVariantSelection = item.variantCount > 1;

  function addWishlistItemToCart() {
    if (!item.variant) {
      return;
    }

    const result = addItem({
      maxStock: item.variant.stock,
      productId: item.productId,
      quantity: 1,
      variantId: item.variant.id,
    });

    setNotice(result.wasAdjusted ? "Cart updated to available stock" : "Added to cart");
    window.setTimeout(() => setNotice(""), 2600);
  }

  return (
    <article className="grid grid-cols-[104px_minmax(0,1fr)] gap-4 rounded-2xl border border-border bg-surface p-3.5 shadow-sm transition-[border-color,box-shadow] hover:border-primary/30 hover:shadow-md sm:grid-cols-[120px_minmax(0,1fr)] sm:p-4 md:flex md:flex-col md:p-5">
      <Link
        aria-label={`View ${item.productName}`}
        className="relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta md:block"
        href={productHref}
        scroll
      >
        {item.imageUrl ? (
          <Image
            alt={item.imageAlt}
            className="h-full w-full object-contain p-2"
            fill
            sizes="(min-width: 768px) 33vw, 104px"
            src={item.imageUrl}
          />
        ) : (
          <ProductImagePlaceholder compact category={item.categoryName} name={item.productName} />
        )}
      </Link>

      <div className="flex min-w-0 flex-col">
        <p className="line-clamp-1 w-fit rounded-full border border-fresh/20 bg-fresh-soft px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-fresh sm:text-xs">
          {item.categoryName}
        </p>
        <Link
          className="mt-2 line-clamp-2 rounded-sm text-base font-black leading-5 text-text transition-colors hover:text-cta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:text-lg sm:leading-6"
          href={productHref}
          scroll
        >
          {item.productName}
        </Link>
        <p className="mt-1 line-clamp-1 text-sm font-medium text-text-muted">
          {item.variant ? item.variant.name : "No active variants"}
        </p>
        {price !== null && item.variant ? (
          <p className="mt-2 text-lg font-black tabular-nums text-primary">
            {formatCurrency(price, item.variant.currency)}
          </p>
        ) : null}

        <div className="mt-auto pt-3">
          <div className="grid items-center gap-2 min-[380px]:grid-cols-[1fr_auto]">
            {needsVariantSelection ? (
              <Link
                className="a1-primary-button min-h-11 min-w-0 rounded-xl px-3 py-2 text-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                href={productHref}
              >
                Select pack
              </Link>
            ) : (
              <button
                className="a1-primary-button min-h-11 min-w-0 cursor-pointer whitespace-nowrap rounded-xl px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!canAddToCart}
                onClick={addWishlistItemToCart}
                type="button"
              >
                {canAddToCart ? "Add to cart" : "Out of stock"}
              </button>
            )}
            <form action={removeWishlistItemAction} className="min-w-0">
              <input name="productId" type="hidden" value={item.productId} />
              <button
                className="min-h-11 w-full cursor-pointer rounded-xl border border-danger/45 bg-surface px-3 text-sm font-extrabold text-danger transition-colors hover:bg-danger-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger min-[380px]:w-auto"
                type="submit"
              >
                Remove
              </button>
            </form>
          </div>
          <p className="min-h-5 pt-1.5 text-xs font-bold text-primary" role="status">
            {notice}
          </p>
        </div>
      </div>
    </article>
  );
}

export function WishlistItems({ items }: { items: WishlistItemView[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <WishlistItemCard item={item} key={item.id} />
      ))}
    </div>
  );
}
