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
    <article className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 rounded-lg border border-border bg-surface p-3 shadow-sm transition-colors hover:border-cta/50 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-4 sm:p-4 md:flex md:flex-col">
      <Link
        aria-label={`View ${item.productName}`}
        className="relative aspect-square overflow-hidden rounded-md border border-border bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta md:block"
        href={productHref}
        scroll
      >
        {item.imageUrl ? (
          <Image
            alt={item.imageAlt}
            className="h-full w-full object-cover"
            fill
            sizes="(min-width: 768px) 33vw, 104px"
            src={item.imageUrl}
            unoptimized
          />
        ) : (
          <ProductImagePlaceholder compact category={item.categoryName} name={item.productName} />
        )}
      </Link>

      <div className="flex min-w-0 flex-col">
        <p className="line-clamp-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-fresh sm:text-xs">
          {item.categoryName}
        </p>
        <Link
          className="mt-1 line-clamp-2 rounded-sm text-base font-extrabold leading-5 text-text transition-colors hover:text-cta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:text-lg sm:leading-6"
          href={productHref}
          scroll
        >
          {item.productName}
        </Link>
        <p className="mt-1 line-clamp-1 text-sm font-semibold text-text-muted">
          {item.variant ? item.variant.name : "No active variants"}
        </p>
        {price !== null && item.variant ? (
          <p className="mt-1 text-sm font-extrabold text-primary">
            {formatCurrency(price, item.variant.currency)}
          </p>
        ) : null}

        <div className="mt-auto pt-2">
          <div className="grid grid-cols-[1fr_auto] items-center gap-2">
            <button
              className="a1-primary-button min-h-10 min-w-0 cursor-pointer whitespace-nowrap px-3 py-2 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
              disabled={!canAddToCart}
              onClick={addWishlistItemToCart}
              type="button"
            >
              {canAddToCart ? "Add to cart" : "Out of stock"}
            </button>
            <form action={removeWishlistItemAction}>
              <input name="productId" type="hidden" value={item.productId} />
              <button
                className="min-h-10 cursor-pointer rounded-md border border-danger/45 bg-surface px-3 text-xs font-extrabold text-danger transition-colors hover:bg-danger-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger sm:text-sm"
                type="submit"
              >
                Remove
              </button>
            </form>
          </div>
          <p className="min-h-4 pt-1 text-xs font-bold text-primary" role="status">
            {notice}
          </p>
        </div>
      </div>
    </article>
  );
}

export function WishlistItems({ items }: { items: WishlistItemView[] }) {
  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <WishlistItemCard item={item} key={item.id} />
      ))}
    </div>
  );
}
