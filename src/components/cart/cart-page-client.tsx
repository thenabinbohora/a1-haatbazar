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
        <div className="skeleton-shimmer h-32 rounded-2xl border border-border" key={item} />
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
  const [quoteRequestVersion, setQuoteRequestVersion] = useState(0);
  const quoteSignature = useMemo(() => JSON.stringify({ items, couponCode: appliedCouponCode }), [appliedCouponCode, items]);
  const currentQuote = quoteState?.signature === quoteSignature ? quoteState.quote : null;
  const quote = currentQuote ?? quoteState?.quote ?? null;
  const error = errorState?.signature === quoteSignature ? errorState.message : null;
  const isRefreshingQuote = isReady && items.length > 0 && !currentQuote && !error;
  const visibleQuoteItems = quote?.items.filter((quoteItem) =>
    items.some((cartItem) => cartItem.variantId === quoteItem.variantId),
  ) ?? [];
  const hasBlockingQuoteIssue =
    !currentQuote ||
    Boolean(error) ||
    currentQuote.items.length === 0 ||
    currentQuote.items.some(
      (item) => !item.isAvailable || item.wasAdjusted || item.quantity !== item.requestedQuantity,
    );
  const checkoutHref = currentQuote?.coupon?.isApplied
    ? `/checkout?coupon=${encodeURIComponent(currentQuote.coupon.code)}`
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
        setErrorState(null);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        setErrorState({ signature: quoteSignature, message: "Cart could not be refreshed. Please try again." });
      });

    return () => controller.abort();
  }, [appliedCouponCode, isReady, items, quoteRequestVersion, quoteSignature]);

  function applyCoupon() {
    setAppliedCouponCode(couponInput.trim().toUpperCase().replace(/\s+/g, ""));
  }

  function clearCoupon() {
    setCouponInput("");
    setAppliedCouponCode("");
  }

  function retryQuote() {
    setErrorState(null);
    setQuoteState((current) => (current?.signature === quoteSignature ? null : current));
    setQuoteRequestVersion((version) => version + 1);
  }

  function confirmClearCart() {
    if (window.confirm("Clear all items from your cart? This cannot be undone.")) {
      clearCart();
    }
  }

  function acceptAdjustedQuantity(item: CartQuoteItem) {
    if (item.quantity <= 0) {
      removeItem(item.variantId);
      return;
    }

    updateQuantity(item.variantId, item.quantity, item.stock);
  }

  if (!isReady) {
    return <CartLoadingState />;
  }

  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-8 text-center shadow-[0_18px_48px_rgba(18,60,46,0.07)]">
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
    <div className="grid min-w-0 gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:pb-0">
      <section className="min-w-0 rounded-2xl border border-border bg-surface shadow-sm">
        <div className="flex items-start justify-between gap-3 border-b border-border p-4 sm:items-center sm:p-5">
          <div>
            <p className="text-sm font-semibold uppercase text-fresh">Cart</p>
            <h1 className="mt-1 text-2xl font-bold text-text sm:text-3xl">Review your groceries</h1>
          </div>
          <button
            className="min-h-11 shrink-0 cursor-pointer rounded-lg px-2 text-xs font-bold text-danger underline-offset-4 transition-colors hover:bg-danger-soft hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger sm:px-3 sm:text-sm"
            onClick={confirmClearCart}
            type="button"
          >
            Clear cart
          </button>
        </div>

        <div className="p-3 sm:p-5">
          {error ? (
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-danger bg-danger-soft p-4 text-sm font-semibold text-danger sm:flex-row sm:items-center sm:justify-between" role="alert">
              <span>{error}</span>
              <button
                className="min-h-11 shrink-0 cursor-pointer rounded-xl border border-danger/40 bg-surface px-4 text-sm font-bold text-danger transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                onClick={retryQuote}
                type="button"
              >
                Try again
              </button>
            </div>
          ) : null}

          {isRefreshingQuote && (!quote || visibleQuoteItems.length === 0) ? <CartLoadingState /> : null}

          {isRefreshingQuote && quote && visibleQuoteItems.length > 0 ? (
            <div className="mb-3 flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 text-xs font-bold text-text-muted" role="status">
              <span className="h-2 w-2 animate-pulse rounded-full bg-fresh" aria-hidden="true" />
              Updating current prices and totals…
            </div>
          ) : null}

          {quote && visibleQuoteItems.length > 0 ? (
            <div className="grid gap-4">
              {visibleQuoteItems.map((item) => {
                const hasSale = item.originalPrice > item.unitPrice;
                const productHref = item.product.slug ? `/products/${item.product.slug}` : "/products";
                const localItem = items.find((cartItem) => cartItem.variantId === item.variantId);
                const renderedQuantity = currentQuote ? item.quantity : (localItem?.quantity ?? item.quantity);
                const renderedLineTotal = currentQuote ? item.lineTotal : item.unitPrice * renderedQuantity;
                const hasPendingStockAdjustment = Boolean(
                  currentQuote && item.isAvailable && item.wasAdjusted && item.quantity !== item.requestedQuantity,
                );

                return (
                  <article
                    className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-3 rounded-2xl border border-border bg-surface-muted/70 p-3 sm:grid-cols-[112px_1fr] sm:gap-4 sm:p-4"
                    key={item.variantId}
                  >
                    <Link
                      aria-label={`View ${item.product.name}`}
                      className="relative h-[88px] w-[88px] overflow-hidden rounded-xl border border-border bg-surface sm:h-auto sm:w-auto sm:aspect-square"
                      href={productHref}
                      scroll
                    >
                      {item.product.imageUrl ? (
                        <Image
                          alt={item.product.imageAlt}
                          className="h-full w-full object-contain p-2"
                          fill
                          sizes="(min-width: 640px) 112px, 88px"
                          src={item.product.imageUrl}
                        />
                      ) : (
                        <ProductImagePlaceholder compact category={item.product.categoryName} name={item.product.name} />
                      )}
                    </Link>

                    <div className="contents sm:grid sm:gap-4 md:grid-cols-[1fr_auto]">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase text-fresh">{item.product.categoryName}</p>
                        <Link className="mt-1 line-clamp-2 block text-base font-bold leading-5 text-text hover:text-cta-hover sm:text-lg sm:leading-6" href={productHref} scroll>
                          {item.product.name}
                        </Link>
                        <p className="mt-1 line-clamp-2 text-xs font-semibold text-text-muted sm:text-sm">
                          {item.variant.name}<span className="hidden sm:inline"> / SKU {item.variant.sku}</span>
                        </p>
                        <div className="mt-2 flex flex-wrap items-baseline gap-2 sm:mt-3">
                          <span className="text-base font-bold text-text sm:text-lg">{formatCurrency(item.unitPrice, item.currency)}</span>
                          {hasSale ? (
                            <span className="text-xs font-semibold text-text-muted line-through sm:text-sm">
                              {formatCurrency(item.originalPrice, item.currency)}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="col-span-2 grid gap-3 sm:col-span-1 md:min-w-48">
                        {currentQuote && item.reason ? (
                          <div className="rounded-xl border border-cta/30 bg-cta-soft px-3 py-2.5 text-sm font-semibold text-cta-hover">
                            <p>{item.reason}</p>
                            {hasPendingStockAdjustment ? (
                              <button
                                className="mt-2 min-h-11 cursor-pointer rounded-xl border border-cta/35 bg-surface px-3 text-xs font-extrabold text-cta-hover transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                                onClick={() => acceptAdjustedQuantity(item)}
                                type="button"
                              >
                                Update cart to {item.quantity}
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                        <div>
                          <label className="text-sm font-bold text-text" htmlFor={`quantity-${item.variantId}`}>
                            Quantity
                          </label>
                          <div className="mt-2 grid grid-cols-[44px_1fr_44px] overflow-hidden rounded-xl border border-border bg-surface">
                            <button
                              aria-label={`Decrease quantity for ${item.product.name}`}
                              className="min-h-11 cursor-pointer touch-manipulation border-r border-border text-lg font-bold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:text-text-muted"
                              disabled={!item.isAvailable || renderedQuantity <= 1}
                              onClick={() => updateQuantity(item.variantId, renderedQuantity - 1, item.stock)}
                              type="button"
                            >
                              -
                            </button>
                            <input
                              className="min-h-11 border-0 bg-surface px-2 text-center text-sm font-bold text-text"
                              disabled={!item.isAvailable}
                              id={`quantity-${item.variantId}`}
                              inputMode="numeric"
                              max={Math.max(item.stock, 1)}
                              min={1}
                              onChange={(event) => updateQuantity(item.variantId, Number(event.target.value), item.stock)}
                              type="number"
                              value={Math.max(renderedQuantity, 1)}
                            />
                            <button
                              aria-label={`Increase quantity for ${item.product.name}`}
                              className="min-h-11 cursor-pointer touch-manipulation border-l border-border text-lg font-bold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:text-text-muted"
                              disabled={!item.isAvailable || renderedQuantity >= item.stock}
                              onClick={() => updateQuantity(item.variantId, renderedQuantity + 1, item.stock)}
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
                            <p className="text-lg font-bold text-text">{formatCurrency(renderedLineTotal, item.currency)}</p>
                          </div>
                          <button
                            className="min-h-11 cursor-pointer touch-manipulation rounded-xl px-3 text-sm font-bold text-danger underline-offset-4 transition-colors hover:bg-danger-soft hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
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

      <aside className="min-w-0 rounded-2xl border border-border bg-surface p-5 shadow-[0_20px_52px_rgba(18,60,46,0.09)] lg:sticky lg:top-44">
        <p className="text-sm font-semibold uppercase text-fresh">Order summary</p>
        <h2 className="mt-1 text-2xl font-bold text-text">Estimated total</h2>

        <div className="mt-5 grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-text-muted">Subtotal</span>
            <span className="font-bold text-text">
              {currentQuote ? formatCurrency(currentQuote.summary.subtotal, currentQuote.summary.currency) : quote ? formatCurrency(quote.summary.subtotal, quote.summary.currency) : error ? "Unavailable" : "Updating..."}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-text-muted">Discount</span>
            <span className="font-bold text-text">
              {currentQuote ? formatCurrency(currentQuote.summary.discount, currentQuote.summary.currency) : quote ? formatCurrency(quote.summary.discount, quote.summary.currency) : error ? "Unavailable" : "Updating..."}
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
                {currentQuote ? formatCurrency(currentQuote.summary.estimatedTotal, currentQuote.summary.currency) : quote ? formatCurrency(quote.summary.estimatedTotal, quote.summary.currency) : error ? "Unavailable" : "Updating..."}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-border bg-surface-muted p-3.5 text-sm leading-6 text-text-muted">
          Choose delivery or pickup at checkout. Prices and stock are checked before your order is confirmed.
        </div>

        <div className="mt-5 rounded-xl border border-border bg-surface-muted p-3.5">
          <label className="text-sm font-bold text-text" htmlFor="coupon-code">
            Coupon code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-cta focus:shadow-[0_0_0_3px_rgba(192,79,26,0.16)]"
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
                "mt-3 rounded-xl border p-3 text-sm font-semibold",
                currentQuote?.coupon?.isApplied ? "border-fresh bg-fresh-soft text-fresh" : "border-danger bg-danger-soft text-danger",
              ].join(" ")}
              role={currentQuote?.coupon?.isApplied ? "status" : "alert"}
            >
              <p>{currentQuote?.coupon?.message ?? (error ? "Coupon could not be checked." : "Checking coupon...")}</p>
              <button className="mt-2 min-h-11 cursor-pointer rounded-lg px-2 text-xs font-bold underline" onClick={clearCoupon} type="button">
                Remove coupon
              </button>
            </div>
          ) : null}
        </div>

        {hasBlockingQuoteIssue ? (
          <div className="mt-5 rounded-xl border border-cta/30 bg-cta-soft p-3 text-sm font-semibold text-cta-hover" role="status">
            {error
              ? "Refresh your cart before continuing to checkout."
              : quote
                ? "Resolve unavailable or adjusted items before continuing to checkout."
                : "Checking current prices and stock before checkout."}
          </div>
        ) : null}

        {hasBlockingQuoteIssue ? (
          <span
            aria-disabled="true"
            className="mt-3 hidden min-h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-surface-muted px-5 text-sm font-bold text-text-muted lg:flex"
          >
            Continue to checkout
          </span>
        ) : (
          <Link
            className="a1-primary-button mt-5 hidden w-full rounded-xl px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta lg:flex"
            href={checkoutHref}
          >
            Continue to checkout
          </Link>
        )}
        <Link
          className="mt-3 flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          href="/products"
        >
          Continue shopping
        </Link>
      </aside>

      <div className="fixed bottom-[calc(var(--a1-bottom-nav-height)+env(safe-area-inset-bottom)+0.75rem)] left-[max(0.75rem,env(safe-area-inset-left))] right-[max(0.75rem,env(safe-area-inset-right))] z-30 flex items-center gap-3 rounded-2xl border border-border bg-surface/96 p-3 shadow-[0_16px_44px_rgba(18,60,46,0.2)] backdrop-blur-xl lg:hidden">
        <div className="min-w-0 flex-1" aria-live="polite">
          <p className="truncate text-[11px] font-bold uppercase tracking-[0.08em] text-text-muted">
            {isRefreshingQuote ? "Updating total" : "Estimated total"}
          </p>
          <p className="truncate text-lg font-black tabular-nums text-text">
            {quote ? formatCurrency(quote.summary.estimatedTotal, quote.summary.currency) : "Checking…"}
          </p>
        </div>
        {hasBlockingQuoteIssue ? (
          <span
            aria-disabled="true"
            className="flex min-h-12 shrink-0 cursor-not-allowed items-center justify-center rounded-xl bg-surface-muted px-4 text-sm font-bold text-text-muted"
          >
            {error ? "Cart unavailable" : currentQuote ? "Review updates" : "Checking cart"}
          </span>
        ) : (
          <Link
            className="a1-primary-button min-h-12 shrink-0 px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href={checkoutHref}
          >
            Checkout
          </Link>
        )}
      </div>
    </div>
  );
}
