"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { formatCurrency } from "@/components/product/price";
import { useCart } from "@/store/cart-store";

type CartQuoteItem = {
  productId: string;
  variantId: string;
  quantity: number;
  requestedQuantity: number;
  stock: number;
  unitPrice: number;
  originalPrice: number;
  currency: string;
  lineTotal: number;
  isAvailable: boolean;
  wasAdjusted: boolean;
  reason: string | null;
  product: {
    name: string;
    slug: string;
    categoryName: string;
    imageUrl: string | null;
    imageAlt: string;
  };
  variant: {
    name: string;
    sku: string;
  };
};

type CartQuote = {
  items: CartQuoteItem[];
  coupon: {
    isApplied: boolean;
    code: string;
    name?: string;
    discount: number;
    message: string;
  } | null;
  summary: {
    subtotal: number;
    discount: number;
    deliveryFee: number | null;
    estimatedTotal: number;
    currency: string;
  };
};

function CartLoadingState() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((item) => (
        <div className="skeleton-shimmer h-32 rounded-lg border border-border" key={item} />
      ))}
    </div>
  );
}

export function CartPageClient() {
  const { clearCart, isReady, items, removeItem, updateQuantity } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [quoteState, setQuoteState] = useState<{ signature: string; quote: CartQuote } | null>(null);
  const [errorState, setErrorState] = useState<{ signature: string; message: string } | null>(null);
  const quoteSignature = useMemo(() => JSON.stringify({ items, couponCode: appliedCouponCode }), [appliedCouponCode, items]);
  const quote = quoteState?.signature === quoteSignature ? quoteState.quote : null;
  const error = errorState?.signature === quoteSignature ? errorState.message : null;
  const isLoadingQuote = isReady && items.length > 0 && !quote && !error;
  const checkoutHref = quote?.coupon?.isApplied
    ? `/checkout?coupon=${encodeURIComponent(quote.coupon.code)}`
    : "/checkout";

  useEffect(() => {
    if (!isReady || items.length === 0) {
      return;
    }

    const controller = new AbortController();

    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items, couponCode: appliedCouponCode || undefined }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Cart could not be refreshed.");
        }

        return (await response.json()) as CartQuote;
      })
      .then((data) => {
        setQuoteState({ signature: quoteSignature, quote: data });
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        setErrorState({ signature: quoteSignature, message: "Cart could not be refreshed. Please try again." });
      });

    return () => controller.abort();
  }, [appliedCouponCode, isReady, items, quoteSignature]);

  function applyCoupon() {
    setAppliedCouponCode(couponInput.trim().toUpperCase().replace(/\s+/g, ""));
  }

  function clearCoupon() {
    setCouponInput("");
    setAppliedCouponCode("");
  }

  if (!isReady) {
    return <CartLoadingState />;
  }

  if (items.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase text-fresh">Your cart</p>
        <h1 className="mt-2 text-3xl font-bold text-text">Your cart is empty</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-muted">
          Add rice, spices, snacks, frozen items, or fresh vegetables, then choose delivery or pickup at checkout.
        </p>
        <Link
          className="a1-primary-button mt-6 px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          href="/products"
        >
          Shop groceries
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <section className="rounded-lg border border-border bg-surface shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-fresh">Cart</p>
            <h1 className="mt-1 text-3xl font-bold text-text">Review your groceries</h1>
          </div>
          <button
            className="min-h-11 cursor-pointer rounded-md border border-danger bg-surface px-4 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
            onClick={clearCart}
            type="button"
          >
            Clear cart
          </button>
        </div>

        <div className="p-5">
          {error ? (
            <div className="mb-4 rounded-md border border-danger bg-danger-soft p-3 text-sm font-semibold text-danger">
              {error}
            </div>
          ) : null}

          {isLoadingQuote && !quote ? <CartLoadingState /> : null}

          {quote ? (
            <div className="grid gap-4">
              {quote.items.map((item) => {
                const hasSale = item.originalPrice > item.unitPrice;
                const productHref = item.product.slug ? `/products/${item.product.slug}` : "/products";

                return (
                  <article
                    className="grid gap-4 rounded-lg border border-border bg-surface-muted p-4 sm:grid-cols-[112px_1fr] sm:items-start"
                    key={item.variantId}
                  >
                    <Link
                      aria-label={`View ${item.product.name}`}
                      className="relative aspect-square overflow-hidden rounded-md border border-border bg-surface"
                      href={productHref}
                      scroll
                    >
                      {item.product.imageUrl ? (
                        <Image
                          alt={item.product.imageAlt}
                          className="h-full w-full object-cover"
                          fill
                          sizes="112px"
                          src={item.product.imageUrl}
                          unoptimized
                        />
                      ) : (
                        <ProductImagePlaceholder compact category={item.product.categoryName} name={item.product.name} />
                      )}
                    </Link>

                    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                      <div>
                        <p className="text-xs font-semibold uppercase text-fresh">{item.product.categoryName}</p>
                        <Link className="mt-1 block text-lg font-bold leading-6 text-text hover:text-cta-hover" href={productHref} scroll>
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-sm font-semibold text-text-muted">
                          {item.variant.name} / SKU {item.variant.sku}
                        </p>
                        <div className="mt-3 flex flex-wrap items-baseline gap-2">
                          <span className="text-lg font-bold text-text">{formatCurrency(item.unitPrice, item.currency)}</span>
                          {hasSale ? (
                            <span className="text-sm font-semibold text-text-muted line-through">
                              {formatCurrency(item.originalPrice, item.currency)}
                            </span>
                          ) : null}
                        </div>
                        {item.reason ? (
                          <p className="mt-3 rounded-md border border-warning bg-cta-soft px-3 py-2 text-sm font-semibold text-warning">
                            {item.reason}
                          </p>
                        ) : null}
                      </div>

                      <div className="grid gap-3 md:min-w-48">
                        <div>
                          <label className="text-sm font-bold text-text" htmlFor={`quantity-${item.variantId}`}>
                            Quantity
                          </label>
                          <div className="mt-2 grid grid-cols-[40px_1fr_40px] overflow-hidden rounded-md border border-border bg-surface">
                            <button
                              aria-label={`Decrease quantity for ${item.product.name}`}
                              className="min-h-10 cursor-pointer border-r border-border text-lg font-bold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:text-text-muted"
                              disabled={!item.isAvailable || item.quantity <= 1}
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1, item.stock)}
                              type="button"
                            >
                              -
                            </button>
                            <input
                              className="min-h-10 border-0 bg-surface px-2 text-center text-sm font-bold text-text"
                              disabled={!item.isAvailable}
                              id={`quantity-${item.variantId}`}
                              inputMode="numeric"
                              max={Math.max(item.stock, 1)}
                              min={1}
                              onChange={(event) => updateQuantity(item.variantId, Number(event.target.value), item.stock)}
                              type="number"
                              value={Math.max(item.quantity, 1)}
                            />
                            <button
                              aria-label={`Increase quantity for ${item.product.name}`}
                              className="min-h-10 cursor-pointer border-l border-border text-lg font-bold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:text-text-muted"
                              disabled={!item.isAvailable || item.quantity >= item.stock}
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1, item.stock)}
                              type="button"
                            >
                              +
                            </button>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-text-muted">
                            {item.stock > 0 ? `${item.stock} available today` : "Unavailable"}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase text-text-muted">Line total</p>
                            <p className="text-lg font-bold text-text">{formatCurrency(item.lineTotal, item.currency)}</p>
                          </div>
                          <button
                            className="min-h-10 cursor-pointer rounded-md border border-danger bg-surface px-3 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                            onClick={() => removeItem(item.variantId)}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <aside className="rounded-lg border border-border bg-surface p-5 shadow-sm lg:sticky lg:top-24">
        <p className="text-sm font-semibold uppercase text-fresh">Order summary</p>
        <h2 className="mt-1 text-2xl font-bold text-text">Estimated total</h2>

        <div className="mt-5 grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-text-muted">Subtotal</span>
            <span className="font-bold text-text">
              {formatCurrency(quote?.summary.subtotal ?? 0, quote?.summary.currency ?? "AUD")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-text-muted">Discount</span>
            <span className="font-bold text-text">
              {formatCurrency(quote?.summary.discount ?? 0, quote?.summary.currency ?? "AUD")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-text-muted">Delivery fee</span>
            <span className="text-right font-bold text-text-muted">Calculated at checkout</span>
          </div>
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-base font-bold text-text">Estimated total</span>
              <span className="text-xl font-bold text-text">
                {formatCurrency(quote?.summary.estimatedTotal ?? 0, quote?.summary.currency ?? "AUD")}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-md border border-border bg-surface-muted p-3 text-sm leading-6 text-text-muted">
          Choose delivery or pickup at checkout. Prices and stock are checked before your order is confirmed.
        </div>

        <div className="mt-5 rounded-lg border border-border bg-surface-muted p-3">
          <label className="text-sm font-bold text-text" htmlFor="coupon-code">
            Coupon code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              className="min-h-11 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-text-muted focus:border-cta"
              id="coupon-code"
              onChange={(event) => setCouponInput(event.target.value)}
              placeholder="Enter coupon code"
              type="text"
              value={couponInput}
            />
            <button
              className="a1-primary-button cursor-pointer px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              onClick={applyCoupon}
              type="button"
            >
              Apply
            </button>
          </div>
          {appliedCouponCode ? (
            <div
              className={[
                "mt-3 rounded-md border p-3 text-sm font-semibold",
                quote?.coupon?.isApplied ? "border-fresh bg-fresh-soft text-fresh" : "border-danger bg-danger-soft text-danger",
              ].join(" ")}
              role={quote?.coupon?.isApplied ? "status" : "alert"}
            >
              <p>{quote?.coupon?.message ?? "Checking coupon..."}</p>
              <button className="mt-2 text-xs font-bold underline" onClick={clearCoupon} type="button">
                Remove coupon
              </button>
            </div>
          ) : null}
        </div>

        <Link
          className="a1-primary-button mt-5 w-full px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          href={checkoutHref}
        >
          Continue to checkout
        </Link>
        <Link
          className="mt-3 flex min-h-12 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          href="/products"
        >
          Continue shopping
        </Link>
      </aside>
    </div>
  );
}
