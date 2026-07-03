"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "@/components/product/price";
import { useCart } from "@/store/cart-store";
import { useCartDrawer } from "@/store/cart-drawer-store";

type QuoteItem = {
  productId: string;
  variantId: string;
  quantity: number;
  stock: number;
  unitPrice: number;
  originalPrice: number;
  currency: string;
  lineTotal: number;
  isAvailable: boolean;
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
  const panelRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const itemsKey = JSON.stringify(items.map((item) => [item.variantId, item.quantity]));
  const quote = quoteState?.data ?? null;
  const isLoading = items.length > 0 && quoteState?.key !== itemsKey;

  useEffect(() => {
    if (!isOpen || !isReady || items.length === 0) {
      return;
    }

    let cancelled = false;

    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: QuoteResponse | null) => {
        if (!cancelled && data) {
          setQuoteState({ key: itemsKey, data });
        }
      })
      .catch(() => null);

    return () => {
      cancelled = true;
    };
  }, [isOpen, isReady, items, itemsKey]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [close, isOpen]);

  if (!isOpen) {
    return null;
  }

  const currency = quote?.summary.currency ?? "AUD";
  const hasItems = items.length > 0;

  return (
    <div aria-hidden={false} className="fixed inset-0 z-50">
      <button
        aria-label="Close cart"
        className="a1-drawer-backdrop absolute inset-0 h-full w-full cursor-pointer bg-primary-muted/45 backdrop-blur-[2px]"
        onClick={close}
        type="button"
      />
      <div
        aria-label="Shopping cart"
        aria-modal="true"
        className="a1-drawer-panel absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-surface shadow-[-24px_0_60px_rgba(15,46,26,0.18)] outline-none"
        ref={panelRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-extrabold text-text">
            Your cart{" "}
            <span className="ml-1 rounded-full bg-fresh-soft px-2.5 py-0.5 text-sm font-bold text-fresh">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </h2>
          <button
            aria-label="Close cart"
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-border text-text-muted transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            onClick={close}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
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
                  close();
                  router.push("/products");
                }}
                type="button"
              >
                Shop groceries
              </button>
            </div>
          ) : isLoading && !quote ? (
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
          ) : (
            <ul className="divide-y divide-border">
              {quote?.items.map((item) => (
                <li className="flex gap-3.5 py-4 first:pt-1" key={item.variantId}>
                  <Link
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted"
                    href={`/products/${item.product.slug}`}
                    onClick={close}
                  >
                    {item.product.imageUrl ? (
                      <Image
                        alt={item.product.imageAlt}
                        className="h-full w-full object-cover"
                        fill
                        sizes="80px"
                        src={item.product.imageUrl}
                        unoptimized
                      />
                    ) : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          className="line-clamp-2 text-sm font-bold leading-5 text-text transition-colors hover:text-cta-hover"
                          href={`/products/${item.product.slug}`}
                          onClick={close}
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-0.5 text-xs font-semibold text-text-muted">{item.variant.name}</p>
                      </div>
                      <button
                        aria-label={`Remove ${item.product.name} from cart`}
                        className="shrink-0 cursor-pointer rounded-full p-1 text-text-muted transition-colors hover:text-danger focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                        onClick={() => removeItem(item.variantId)}
                        type="button"
                      >
                        <CloseIcon />
                      </button>
                    </div>

                    {item.isAvailable ? (
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center rounded-full border border-border">
                          <button
                            aria-label="Decrease quantity"
                            className="grid h-8 w-8 cursor-pointer place-items-center rounded-l-full text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1, item.stock)}
                            type="button"
                          >
                            -
                          </button>
                          <span className="min-w-8 text-center text-sm font-bold tabular-nums text-text">{item.quantity}</span>
                          <button
                            aria-label="Increase quantity"
                            className="grid h-8 w-8 cursor-pointer place-items-center rounded-r-full text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={item.quantity >= item.stock}
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1, item.stock)}
                            type="button"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold tabular-nums text-text">
                            {formatCurrency(item.lineTotal, item.currency)}
                          </p>
                          {item.unitPrice < item.originalPrice ? (
                            <p className="text-xs font-semibold tabular-nums text-text-muted line-through">
                              {formatCurrency(item.originalPrice * item.quantity, item.currency)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-xs font-bold text-danger">{item.reason ?? "Unavailable"}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {hasItems ? (
          <div className="border-t border-border bg-background/60 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-text-muted">Subtotal</span>
              <span className="text-lg font-extrabold tabular-nums text-text">
                {quote ? formatCurrency(quote.summary.subtotal, currency) : "Pending"}
              </span>
            </div>
            <p className="mt-1 text-xs text-text-muted">Coupons and delivery are confirmed at checkout.</p>
            <div className="mt-4 grid gap-2">
              <button
                className="a1-primary-button cursor-pointer px-5 text-sm"
                onClick={() => {
                  close();
                  router.push("/checkout");
                }}
                type="button"
              >
                Checkout securely
              </button>
              <button
                className="a1-secondary-button cursor-pointer px-5 text-sm"
                onClick={() => {
                  close();
                  router.push("/cart");
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
