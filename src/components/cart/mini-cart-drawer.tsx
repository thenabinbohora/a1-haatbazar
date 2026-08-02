"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/components/product/price";
import { useDismissibleLayer } from "@/components/ui/overlay-provider";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useModalIsolation } from "@/hooks/use-modal-isolation";
import { useResetOnNavigation } from "@/hooks/use-reset-on-navigation";
import { useCart } from "@/store/cart-store";
import { useCartDrawer } from "@/store/cart-drawer-store";

type QuoteItem = {
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

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type QuoteResponse = {
  items: QuoteItem[];
  summary: {
    subtotal: number;
    estimatedTotal: number;
    currency: string;
  };
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

function BasketIcon() {
  return (
    <svg aria-hidden="true" className="h-8 w-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 24 24">
      <path d="M7.5 10 10 5.5" />
      <path d="M16.5 10 14 5.5" />
      <path d="M4.5 10h15l-1.4 8.2a2 2 0 0 1-2 1.7H7.9a2 2 0 0 1-2-1.7L4.5 10Z" />
      <path d="M8.5 14h7" />
    </svg>
  );
}

export function MiniCartDrawer() {
  const { isOpen, close } = useCartDrawer();
  const { items, isReady, itemCount, updateQuantity, removeItem } = useCart();
  const [quoteState, setQuoteState] = useState<{ key: string; data: QuoteResponse } | null>(null);
  const [quoteErrorState, setQuoteErrorState] = useState<{ key: string; message: string } | null>(null);
  const [quoteRequestVersion, setQuoteRequestVersion] = useState(0);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const shouldRestoreFocusRef = useRef(true);
  const restoreScrollRef = useRef(true);
  const shouldRestoreScroll = useCallback(() => restoreScrollRef.current, []);
  const router = useRouter();

  const dismiss = useDismissibleLayer({
    contentRef: panelRef,
    kind: "drawer",
    onDismiss: (reason) => {
      restoreScrollRef.current = ![
        "navigation",
        "session-change",
      ].includes(reason);
      shouldRestoreFocusRef.current = ![
        "another-layer",
        "navigation",
        "session-change",
      ].includes(reason);
      close();
    },
    open: isOpen,
    restoreFocusOnDismiss: false,
    triggerRef: returnFocusRef,
  });

  const itemsKey = JSON.stringify(items.map((item) => [item.variantId, item.quantity]));
  const currentQuote = quoteState?.key === itemsKey ? quoteState.data : null;
  const quote = currentQuote ?? quoteState?.data ?? null;
  const quoteError = quoteErrorState?.key === itemsKey ? quoteErrorState.message : null;
  const hasItems = items.length > 0;
  const isRefreshing = isOpen && isReady && hasItems && !currentQuote && !quoteError;
  const visibleQuoteItems = quote?.items.filter((quoteItem) =>
    items.some((cartItem) => cartItem.variantId === quoteItem.variantId),
  ) ?? [];
  const hasBlockingQuoteIssue =
    !currentQuote ||
    Boolean(quoteError) ||
    currentQuote.items.length === 0 ||
    currentQuote.items.some(
      (item) => !item.isAvailable || item.wasAdjusted || item.quantity !== item.requestedQuantity,
    );

  useBodyScrollLock(isOpen, shouldRestoreScroll);
  useModalIsolation(isOpen, panelRef);
  useResetOnNavigation(() => {
    if (isOpen) {
      shouldRestoreFocusRef.current = false;
      restoreScrollRef.current = false;
      close();
    }
  });

  useEffect(() => {
    if (!isOpen || !isReady || items.length === 0) {
      return;
    }

    const controller = new AbortController();

    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Cart could not be refreshed.");
        }

        return (await response.json()) as QuoteResponse;
      })
      .then((data) => {
        setQuoteState({ key: itemsKey, data });
        setQuoteErrorState(null);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        setQuoteErrorState({ key: itemsKey, message: "Cart could not be refreshed. Please try again." });
      });

    return () => controller.abort();
  }, [isOpen, isReady, items, itemsKey, quoteRequestVersion]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    shouldRestoreFocusRef.current = true;
    restoreScrollRef.current = true;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getClientRects().length > 0 && element.getAttribute("aria-hidden") !== "true");

      if (focusableElements.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstElement || !panelRef.current.contains(activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);

      const returnTarget = returnFocusRef.current;
      if (shouldRestoreFocusRef.current && returnTarget?.isConnected) {
        window.requestAnimationFrame(() => returnTarget.focus());
      }
    };
  }, [close, isOpen]);

  function retryQuote() {
    setQuoteErrorState(null);
    setQuoteState((current) => (current?.key === itemsKey ? null : current));
    setQuoteRequestVersion((version) => version + 1);
  }

  function closeForNavigation() {
    shouldRestoreFocusRef.current = false;
    dismiss("navigation");
  }

  function acceptAdjustedQuantity(item: QuoteItem) {
    if (item.quantity <= 0) {
      removeItem(item.variantId);
      return;
    }

    updateQuantity(item.variantId, item.quantity, item.stock);
  }

  if (!isOpen) {
    return null;
  }

  const currency = quote?.summary.currency ?? "AUD";

  return (
    <div aria-hidden={false} className="fixed inset-0 z-[var(--z-layer-drawer)] h-[100dvh]">
      <button
        aria-label="Close cart"
        className="a1-drawer-backdrop absolute inset-0 h-full w-full cursor-pointer bg-primary-muted/45 backdrop-blur-[2px]"
        onClick={() => dismiss("outside-pointer")}
        type="button"
      />
      <div
        aria-label="Shopping cart"
        aria-modal="true"
        className="a1-drawer-panel absolute inset-y-0 right-0 flex h-[100dvh] max-h-[100dvh] w-full max-w-md flex-col bg-surface shadow-[-24px_0_60px_rgba(15,46,26,0.18)] outline-none sm:rounded-l-2xl"
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between border-b border-border pb-4 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-[calc(env(safe-area-inset-top)+1rem)]">
          <h2 className="text-lg font-extrabold text-text">
            Your cart{" "}
            <span className="ml-1 rounded-full bg-fresh-soft px-2.5 py-0.5 text-sm font-bold text-fresh">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </h2>
          <button
            aria-label="Close cart"
            className="grid h-12 w-12 shrink-0 cursor-pointer touch-manipulation place-items-center rounded-full border border-border text-text-muted transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            onClick={() => dismiss("action")}
            ref={closeButtonRef}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overscroll-contain overflow-y-auto py-4 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]">
          {quoteError && hasItems ? (
            <div className="mb-4 rounded-xl border border-danger bg-danger-soft p-4 text-sm font-semibold text-danger" role="alert">
              <p>{quoteError}</p>
              <button
                className="mt-3 min-h-11 cursor-pointer touch-manipulation rounded-xl border border-danger/40 bg-surface px-4 text-sm font-bold text-danger transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                onClick={retryQuote}
                type="button"
              >
                Try again
              </button>
            </div>
          ) : null}

          {!hasItems ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-fresh-soft text-fresh">
                <BasketIcon />
              </span>
              <div>
                <p className="text-base font-bold text-text">Your cart is empty</p>
                <p className="mt-1 text-sm text-text-muted">Fresh picks and pantry staples are one tap away.</p>
              </div>
              <button
                className="a1-primary-button cursor-pointer px-6 text-sm"
                onClick={() => {
                  closeForNavigation();
                  router.push("/products", { scroll: true });
                }}
                type="button"
              >
                Shop groceries
              </button>
            </div>
          ) : isRefreshing && (!quote || visibleQuoteItems.length === 0) ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div className="flex gap-3" key={item.variantId}>
                  <div className="skeleton-shimmer h-20 w-20 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="skeleton-shimmer h-4 w-3/4 rounded" />
                    <div className="skeleton-shimmer h-4 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : quote && visibleQuoteItems.length > 0 ? (
            <>
              {isRefreshing ? (
                <div className="mb-2 flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 text-xs font-bold text-text-muted" role="status">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-fresh" aria-hidden="true" />
                  Updating cart totals…
                </div>
              ) : null}
              <ul className="divide-y divide-border">
              {visibleQuoteItems.map((item) => {
                const localItem = items.find((cartItem) => cartItem.variantId === item.variantId);
                const renderedQuantity = currentQuote ? item.quantity : (localItem?.quantity ?? item.quantity);
                const renderedLineTotal = currentQuote ? item.lineTotal : item.unitPrice * renderedQuantity;
                const hasPendingStockAdjustment = Boolean(
                  currentQuote && item.isAvailable && item.wasAdjusted && item.quantity !== item.requestedQuantity,
                );

                return (
                <li className="flex gap-3 py-4 first:pt-1" key={item.variantId}>
                  <Link
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted"
                    href={`/products/${item.product.slug}`}
                    onClick={closeForNavigation}
                  >
                    {item.product.imageUrl ? (
                      <Image
                        alt={item.product.imageAlt}
                        className="h-full w-full object-contain p-1.5"
                        fill
                        sizes="80px"
                        src={item.product.imageUrl}
                      />
                    ) : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          className="line-clamp-2 text-sm font-bold leading-5 text-text transition-colors hover:text-cta-hover"
                          href={`/products/${item.product.slug}`}
                          onClick={closeForNavigation}
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-0.5 text-xs font-semibold text-text-muted">{item.variant.name}</p>
                      </div>
                      <button
                        aria-label={`Remove ${item.product.name} from cart`}
                        className="grid h-11 w-11 shrink-0 cursor-pointer touch-manipulation place-items-center rounded-full text-text-muted transition-colors hover:bg-danger-soft hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                        onClick={() => removeItem(item.variantId)}
                        type="button"
                      >
                        <CloseIcon />
                      </button>
                    </div>

                    {item.isAvailable ? (
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <div className="inline-flex items-center rounded-full border border-border">
                          <button
                            aria-label={`Decrease quantity for ${item.product.name}`}
                            className="grid h-11 w-11 cursor-pointer touch-manipulation place-items-center rounded-l-full text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={renderedQuantity <= 1}
                            onClick={() => updateQuantity(item.variantId, renderedQuantity - 1, item.stock)}
                            type="button"
                          >
                            -
                          </button>
                          <span className="min-w-9 text-center text-sm font-bold tabular-nums text-text">{renderedQuantity}</span>
                          <button
                            aria-label={`Increase quantity for ${item.product.name}`}
                            className="grid h-11 w-11 cursor-pointer touch-manipulation place-items-center rounded-r-full text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={renderedQuantity >= item.stock}
                            onClick={() => updateQuantity(item.variantId, renderedQuantity + 1, item.stock)}
                            type="button"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold tabular-nums text-text">
                            {formatCurrency(renderedLineTotal, item.currency)}
                          </p>
                          {item.unitPrice < item.originalPrice ? (
                            <p className="text-xs font-semibold tabular-nums text-text-muted line-through">
                              {formatCurrency(item.originalPrice * renderedQuantity, item.currency)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs font-bold text-danger">{item.reason ?? "Unavailable"}</p>
                    )}
                    {currentQuote && item.isAvailable && item.reason ? (
                      <div className="mt-2 rounded-xl border border-warning/40 bg-cta-soft p-2.5 text-xs font-bold leading-5 text-warning">
                        <p>{item.reason}</p>
                        {hasPendingStockAdjustment ? (
                          <button
                            className="mt-2 min-h-11 cursor-pointer touch-manipulation rounded-xl border border-warning/40 bg-surface px-3 text-xs font-extrabold text-warning transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                            onClick={() => acceptAdjustedQuantity(item)}
                            type="button"
                          >
                            Update cart to {item.quantity}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </li>
                );
              })}
              </ul>
            </>
          ) : null}
        </div>

        {hasItems ? (
          <div className="border-t border-border bg-background/60 pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-text-muted">{isRefreshing ? "Updating subtotal" : "Subtotal"}</span>
              <span className="text-lg font-extrabold tabular-nums text-text">
                {quote ? formatCurrency(quote.summary.subtotal, currency) : quoteError ? "Unavailable" : "Updating..."}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">Coupons and delivery are confirmed at checkout.</p>
            {hasBlockingQuoteIssue ? (
              <div className="mt-3 rounded-xl border border-warning bg-cta-soft p-3 text-xs font-bold leading-5 text-warning" role="status">
                {quoteError
                  ? "Refresh your cart before continuing to checkout."
                  : quote
                    ? "Resolve unavailable or adjusted items before checkout."
                    : "Checking current prices and stock before checkout."}
              </div>
            ) : null}
            <div className="mt-4 grid gap-2">
              <button
                className="a1-primary-button !min-h-12 cursor-pointer rounded-xl px-5 text-sm disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted disabled:shadow-none"
                disabled={hasBlockingQuoteIssue}
                onClick={() => {
                  if (hasBlockingQuoteIssue) {
                    return;
                  }

                  closeForNavigation();
                  router.push("/checkout", { scroll: true });
                }}
                type="button"
              >
                Checkout securely
              </button>
              <button
                className="a1-secondary-button !min-h-12 cursor-pointer px-5 text-sm"
                onClick={() => {
                  closeForNavigation();
                  router.push("/cart", { scroll: true });
                }}
                type="button"
              >
                View full cart
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
