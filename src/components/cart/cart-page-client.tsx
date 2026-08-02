"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { formatCurrency } from "@/components/product/price";
import { type CartStorageItem, useCart } from "@/store/cart-store";

const CART_COUPON_STORAGE_KEY = "grocery-store-pro.cart.coupon.v1";
const UNDO_DURATION_MS = 7_000;

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

type RemovedItem = {
  cartItem: CartStorageItem;
  name: string;
  stock: number;
};

function CartLoadingState() {
  return (
    <div aria-label="Loading cart" className="grid gap-0" role="status">
      {[1, 2, 3].map((item) => (
        <div
          className="grid min-h-32 grid-cols-[72px_minmax(0,1fr)] gap-3 border-b border-border p-3.5 last:border-b-0 md:grid-cols-[80px_minmax(0,1fr)_156px_104px] md:items-center md:p-4"
          key={item}
        >
          <span className="skeleton-shimmer aspect-square rounded-xl" />
          <span className="grid content-start gap-2 pt-1">
            <span className="skeleton-shimmer h-5 w-3/4 rounded" />
            <span className="skeleton-shimmer h-4 w-32 rounded" />
            <span className="skeleton-shimmer h-3 w-24 rounded" />
          </span>
          <span className="skeleton-shimmer col-span-2 h-11 rounded-xl md:col-span-1" />
          <span className="skeleton-shimmer hidden h-6 rounded md:block" />
        </div>
      ))}
      <span className="sr-only">Loading current prices and stock.</span>
    </div>
  );
}

function EmptyCartState() {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_18px_48px_rgba(18,60,46,0.07)]">
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-10 text-center sm:px-8 sm:py-12">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-fresh/20 bg-fresh-soft text-primary" aria-hidden="true">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" viewBox="0 0 24 24">
            <path d="M4 5h2l1.5 9.1a2 2 0 0 0 2 1.7h7.4a2 2 0 0 0 1.9-1.5L20 9H7" />
            <path d="M10 20h.01M17 20h.01" />
          </svg>
        </span>
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-text sm:text-3xl">Your cart is empty</h2>
        <p className="mt-2 text-sm leading-6 text-text-muted sm:text-base">Add groceries to begin your order.</p>
        <div className="mt-6 flex w-full max-w-sm flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link className="a1-primary-button min-h-12 flex-1 px-5 text-sm" href="/products">
            Start shopping
          </Link>
          <Link
            className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-bold text-primary transition-colors hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href="/offers"
          >
            View weekly offers
          </Link>
        </div>
      </div>
    </section>
  );
}

function QuantityStepper({
  disabled,
  isUpdating,
  max,
  name,
  onChange,
  quantity,
}: {
  disabled: boolean;
  isUpdating: boolean;
  max: number;
  name: string;
  onChange: (quantity: number) => void;
  quantity: number;
}) {
  return (
    <div aria-busy={isUpdating} className="min-w-0">
      <span className="sr-only">Quantity</span>
      <div className="grid h-11 min-w-0 grid-cols-[44px_minmax(44px,1fr)_44px] overflow-hidden rounded-xl border border-border bg-surface">
        <button
          aria-label={`Decrease ${name} quantity`}
          className="grid cursor-pointer place-items-center border-r border-border text-xl font-semibold leading-none text-primary transition-colors hover:bg-fresh-soft focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted/55"
          disabled={disabled || isUpdating || quantity <= 1}
          onClick={() => onChange(quantity - 1)}
          type="button"
        >
          <span aria-hidden="true">−</span>
        </button>
        <output
          aria-label={`${name} quantity`}
          aria-live="polite"
          className="grid min-w-0 place-items-center bg-surface px-1 text-sm font-extrabold tabular-nums text-text"
        >
          {isUpdating ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-fresh/25 border-t-fresh motion-reduce:animate-none" aria-hidden="true" /> : quantity}
        </output>
        <button
          aria-label={`Increase ${name} quantity`}
          className="grid cursor-pointer place-items-center border-l border-border text-xl font-semibold leading-none text-primary transition-colors hover:bg-fresh-soft focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted/55"
          disabled={disabled || isUpdating || quantity >= max}
          onClick={() => onChange(quantity + 1)}
          type="button"
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  );
}

function CartItem({
  item,
  isUpdating,
  localQuantity,
  onAcceptAdjustment,
  onQuantityChange,
  onRemove,
  operationError,
  priceNotice,
}: {
  item: CartQuoteItem;
  isUpdating: boolean;
  localQuantity: number;
  onAcceptAdjustment: () => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  operationError?: string;
  priceNotice?: string;
}) {
  const hasSale = item.originalPrice > item.unitPrice;
  const savingsEach = Math.max(0, item.originalPrice - item.unitPrice);
  const productHref = item.product.slug ? `/products/${item.product.slug}` : "/products";
  const renderedLineTotal = item.unitPrice * localQuantity;
  const hasPendingStockAdjustment = item.isAvailable && item.wasAdjusted && item.quantity !== item.requestedQuantity;

  return (
    <article
      aria-busy={isUpdating}
      className="grid min-w-0 grid-cols-[76px_minmax(0,1fr)] gap-x-3 gap-y-3 border-b border-border px-3.5 py-4 last:border-b-0 md:grid-cols-[80px_minmax(0,1fr)_156px_112px] md:items-center md:gap-x-4 md:px-4 md:py-4"
    >
      <Link
        aria-label={`View ${item.product.name}`}
        className="relative aspect-square w-[76px] self-start overflow-hidden rounded-xl border border-border bg-surface-muted transition-colors hover:border-fresh/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta md:w-20"
        href={productHref}
      >
        {item.product.imageUrl ? (
          <Image
            alt={item.product.imageAlt}
            className="h-full w-full object-contain p-2"
            fill
            sizes="(min-width: 768px) 80px, 76px"
            src={item.product.imageUrl}
          />
        ) : (
          <ProductImagePlaceholder compact category={item.product.categoryName} name={item.product.name} />
        )}
      </Link>

      <div className="min-w-0">
        <Link
          className="line-clamp-2 block text-[15px] font-extrabold leading-5 text-text transition-colors hover:text-cta-hover sm:text-base sm:leading-6"
          href={productHref}
        >
          {item.product.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-xs font-semibold text-text-muted sm:text-sm">{item.variant.name}</p>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span aria-label={`Current price ${formatCurrency(item.unitPrice, item.currency)}`} className="text-base font-extrabold tabular-nums text-text">{formatCurrency(item.unitPrice, item.currency)}</span>
          {hasSale ? (
            <span className="text-xs font-semibold text-text-muted line-through" aria-label={`Original price ${formatCurrency(item.originalPrice, item.currency)}`}>
              {formatCurrency(item.originalPrice, item.currency)}
            </span>
          ) : null}
        </div>
        {hasSale ? (
          <p className="mt-0.5 text-xs font-bold text-fresh">Save {formatCurrency(savingsEach, item.currency)} each</p>
        ) : null}
        <p className={`mt-1.5 flex items-center gap-1.5 text-xs font-bold ${item.isAvailable ? "text-fresh" : "text-danger"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${item.isAvailable ? "bg-fresh" : "bg-danger"}`} aria-hidden="true" />
          {item.isAvailable ? `In stock · ${item.stock} available` : "Unavailable"}
        </p>
      </div>

      <div className="col-span-2 min-w-0 md:col-span-1">
        <QuantityStepper
          disabled={!item.isAvailable}
          isUpdating={isUpdating}
          max={Math.max(item.stock, 1)}
          name={item.product.name}
          onChange={onQuantityChange}
          quantity={Math.max(localQuantity, 1)}
        />
      </div>

      <div className="col-span-2 flex min-h-11 items-end justify-between gap-3 md:col-span-1 md:min-h-0 md:flex-col md:items-end md:justify-center md:gap-0.5">
        <div className="min-w-0 md:text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-text-muted md:sr-only">Line total</p>
          <p className="truncate text-lg font-extrabold tabular-nums text-text">{formatCurrency(renderedLineTotal, item.currency)}</p>
        </div>
        <button
          aria-label={`Remove ${item.product.name} from cart`}
          className="inline-flex min-h-11 shrink-0 cursor-pointer items-end rounded-lg px-2.5 pb-0.5 text-sm font-bold text-cta-hover underline-offset-4 transition-colors hover:bg-cta-soft hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta md:min-h-9 md:px-1.5 md:pb-0 md:text-xs"
          disabled={isUpdating}
          onClick={onRemove}
          type="button"
        >
          Remove
        </button>
      </div>

      {priceNotice ? (
        <div className="col-span-full rounded-xl border border-info/25 bg-sky-50 px-3 py-2.5 text-sm text-text" role="status">
          <p className="font-extrabold text-info">Price updated</p>
          <p className="mt-0.5 text-xs font-semibold leading-5 text-text-muted">{priceNotice}</p>
        </div>
      ) : null}

      {item.reason ? (
        <div className={`col-span-full rounded-xl border px-3 py-2.5 text-sm ${item.isAvailable ? "border-warning/25 bg-amber-50 text-warning" : "border-danger/25 bg-danger-soft/55 text-danger"}`} role="alert">
          <p className="font-bold leading-5">{item.reason}</p>
          {hasPendingStockAdjustment ? (
            <button
              className="mt-2 min-h-11 cursor-pointer rounded-lg border border-current/25 bg-surface px-3 text-xs font-extrabold transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              onClick={onAcceptAdjustment}
              type="button"
            >
              Update quantity to {item.quantity}
            </button>
          ) : null}
        </div>
      ) : null}

      {operationError ? (
        <div className="col-span-full rounded-xl border border-danger/25 bg-danger-soft/55 px-3 py-2.5 text-sm" role="alert">
          <p className="font-extrabold text-danger">Quantity update failed</p>
          <p className="mt-0.5 text-xs font-semibold leading-5 text-text-muted">{operationError}</p>
        </div>
      ) : null}
    </article>
  );
}

function PricingSummary({ quote, refreshing }: { quote: CartQuote | null; refreshing: boolean }) {
  const currency = quote?.summary.currency ?? "AUD";
  const total = quote ? formatCurrency(quote.summary.estimatedTotal, currency) : "Checking…";

  return (
    <div aria-busy={refreshing} className="grid gap-2 text-sm">
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-text-muted">Subtotal</span>
        <span className="font-extrabold tabular-nums text-text">{quote ? formatCurrency(quote.summary.subtotal, currency) : "Checking…"}</span>
      </div>
      {quote && quote.summary.discount > 0 ? (
        <div className="flex items-center justify-between gap-4 text-fresh">
          <span className="font-semibold">Coupon savings</span>
          <span className="font-extrabold tabular-nums">−{formatCurrency(quote.summary.discount, currency)}</span>
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-text-muted">Delivery</span>
        <span className="text-right font-bold text-text-muted">At checkout</span>
      </div>
      <div className="mt-0.5 border-t border-border pt-3">
        <div className="flex items-end justify-between gap-4">
          <span className="text-base font-extrabold text-text">Estimated total</span>
          <span className="text-2xl font-black tabular-nums tracking-tight text-primary">{total}</span>
        </div>
        <p className="mt-1 text-right text-[11px] font-semibold text-text-muted">AUD · GST included where applicable</p>
      </div>
    </div>
  );
}

function CouponControl({
  appliedCouponCode,
  coupon,
  expanded,
  input,
  isApplying,
  onApply,
  onChange,
  onRemove,
  onToggle,
  removalMessage,
}: {
  appliedCouponCode: string;
  coupon: CartQuote["coupon"] | null | undefined;
  expanded: boolean;
  input: string;
  isApplying: boolean;
  onApply: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (value: string) => void;
  onRemove: () => void;
  onToggle: () => void;
  removalMessage: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isApplied = Boolean(appliedCouponCode && coupon?.isApplied);
  const hasAttemptedCoupon = Boolean(appliedCouponCode);
  const couponError = hasAttemptedCoupon && coupon && !coupon.isApplied ? coupon.message : "";

  useEffect(() => {
    if (expanded && !isApplied) {
      inputRef.current?.focus();
    }
  }, [expanded, isApplied]);

  return (
    <div className="border-t border-border pt-3">
      {isApplied && coupon ? (
        <div className="flex min-w-0 items-start justify-between gap-3 rounded-xl border border-fresh/25 bg-fresh-soft px-3.5 py-3" role="status">
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-primary">{coupon.code} applied</p>
            <p className="mt-0.5 text-xs font-semibold text-fresh">You saved {formatCurrency(coupon.discount, "AUD")}</p>
          </div>
          <button className="min-h-11 shrink-0 cursor-pointer rounded-lg px-2 text-xs font-extrabold text-primary underline-offset-4 hover:bg-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" onClick={onRemove} type="button">
            Remove
          </button>
        </div>
      ) : (
        <>
          <button
            aria-controls="cart-coupon-form"
            aria-expanded={expanded}
            className="flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg text-left text-sm font-extrabold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            onClick={onToggle}
            type="button"
          >
            <span>
              Have a coupon? <span className="font-semibold text-cta-hover">Add code</span>
            </span>
            <svg aria-hidden="true" className={`h-4 w-4 transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {expanded ? (
            <form className="mt-2" id="cart-coupon-form" onSubmit={onApply}>
              <label className="sr-only" htmlFor="coupon-code">Coupon code</label>
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
                <input
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="h-11 min-w-0 rounded-xl border border-border bg-surface px-3 text-base font-semibold uppercase text-text outline-none placeholder:normal-case placeholder:font-normal placeholder:text-text-muted focus:border-cta focus:shadow-[0_0_0_3px_rgba(192,79,26,0.14)] sm:text-sm"
                  id="coupon-code"
                  maxLength={40}
                  onChange={(event) => onChange(event.target.value)}
                  placeholder="Enter coupon code"
                  ref={inputRef}
                  spellCheck={false}
                  type="text"
                  value={input}
                />
                <button className="a1-primary-button h-11 cursor-pointer rounded-xl px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60" disabled={isApplying || !input.trim()} type="submit">
                  {isApplying ? "Applying…" : "Apply"}
                </button>
              </div>
              <div className="min-h-6 pt-1.5">
                {couponError ? <p className="text-xs font-bold leading-5 text-danger" role="alert">{couponError}</p> : null}
                {isApplying ? <p className="text-xs font-semibold text-text-muted" role="status">Checking this code…</p> : null}
              </div>
            </form>
          ) : null}
        </>
      )}
      {removalMessage ? <p className="mt-2 text-xs font-bold leading-5 text-warning" role="status">{removalMessage}</p> : null}
    </div>
  );
}

function ClearCartDialog({
  cancelButtonRef,
  dialogRef,
  onCancel,
  onClear,
}: {
  cancelButtonRef: RefObject<HTMLButtonElement | null>;
  dialogRef: RefObject<HTMLDialogElement | null>;
  onCancel: () => void;
  onClear: () => void;
}) {
  return (
    <dialog
      aria-describedby="clear-cart-description"
      aria-labelledby="clear-cart-title"
      className="a1-cart-dialog m-auto w-[min(92vw,28rem)] rounded-2xl border border-border bg-surface p-0 text-text shadow-[0_24px_80px_rgba(18,60,46,0.28)]"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();
        const clickedOutside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;

        if (clickedOutside) {
          onCancel();
        }
      }}
      ref={dialogRef}
    >
      <div className="p-5 sm:p-6">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-danger-soft text-danger" aria-hidden="true">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
            <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
          </svg>
        </span>
        <h2 className="mt-4 text-xl font-extrabold text-text" id="clear-cart-title">Clear your cart?</h2>
        <p className="mt-2 text-sm leading-6 text-text-muted" id="clear-cart-description">This will remove all items from your cart.</p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button className="min-h-11 cursor-pointer rounded-xl border border-border bg-surface px-4 text-sm font-bold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" onClick={onCancel} ref={cancelButtonRef} type="button">
            Cancel
          </button>
          <button className="min-h-11 cursor-pointer rounded-xl bg-danger px-4 text-sm font-bold text-white transition-colors hover:bg-[#8f1c13] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger" onClick={onClear} type="button">
            Clear cart
          </button>
        </div>
      </div>
    </dialog>
  );
}

function MobileCheckoutBar({
  onCheckout,
  pending,
  quote,
}: {
  onCheckout: () => void;
  pending: boolean;
  quote: CartQuote | null;
}) {
  return (
    <div className="fixed inset-x-0 bottom-[calc(var(--mobile-nav-height)+var(--safe-area-bottom))] z-[var(--z-layer-sticky)] border-t border-border bg-surface/98 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] shadow-[0_-8px_22px_rgba(18,60,46,0.1)] backdrop-blur-xl xl:hidden" data-mobile-cart-bar data-testid="mobile-checkout-bar">
      <div className="mx-auto flex h-[var(--mobile-cart-bar-height)] max-w-3xl items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-extrabold uppercase tracking-[0.08em] text-text-muted">Estimated total</p>
          <p className="truncate text-lg font-black tabular-nums leading-tight text-primary">{quote ? formatCurrency(quote.summary.estimatedTotal, quote.summary.currency) : "Checking…"}</p>
        </div>
        <button className="a1-primary-button min-h-11 shrink-0 cursor-pointer rounded-xl px-5 text-sm disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted disabled:shadow-none" disabled={pending} onClick={onCheckout} type="button">
          {pending ? "Continuing…" : "Checkout"}
        </button>
        {pending ? <span className="sr-only" role="status">Continuing to checkout</span> : null}
      </div>
    </div>
  );
}

export function CartPageClient() {
  const router = useRouter();
  const { addItem, clearCart, isReady, items, removeItem, updateQuantity } = useCart();
  const [couponReady, setCouponReady] = useState(false);
  const [couponExpanded, setCouponExpanded] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [couponRemovalMessage, setCouponRemovalMessage] = useState("");
  const [quoteState, setQuoteState] = useState<{ signature: string; quote: CartQuote } | null>(null);
  const [errorState, setErrorState] = useState<{ signature: string; message: string } | null>(null);
  const [quoteRequestVersion, setQuoteRequestVersion] = useState(0);
  const [updatingVariantIds, setUpdatingVariantIds] = useState<string[]>([]);
  const [itemOperationErrors, setItemOperationErrors] = useState<Record<string, string>>({});
  const [removedItem, setRemovedItem] = useState<RemovedItem | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutNavigationStarted, setCheckoutNavigationStarted] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [mobileSummaryExpanded, setMobileSummaryExpanded] = useState(false);
  const [priceNotices, setPriceNotices] = useState<Record<string, string>>({});
  const clearCartTriggerRef = useRef<HTMLButtonElement>(null);
  const clearDialogRef = useRef<HTMLDialogElement>(null);
  const cancelClearRef = useRef<HTMLButtonElement>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousQuoteRef = useRef<CartQuote | null>(null);
  const quantityRollbackRef = useRef(new Map<string, number>());
  const validatedCouponCodeRef = useRef("");
  const quoteSignature = useMemo(() => JSON.stringify({ items, couponCode: appliedCouponCode }), [appliedCouponCode, items]);
  const currentQuote = quoteState?.signature === quoteSignature ? quoteState.quote : null;
  const quote = currentQuote ?? quoteState?.quote ?? null;
  const error = errorState?.signature === quoteSignature ? errorState.message : null;
  const isRefreshingQuote = isReady && couponReady && items.length > 0 && !currentQuote && !error;
  const visibleQuoteItems = quote?.items.filter((quoteItem) => items.some((cartItem) => cartItem.variantId === quoteItem.variantId)) ?? [];
  const hasItemIssue = Boolean(currentQuote?.items.some((item) => !item.isAvailable || item.wasAdjusted || item.quantity !== item.requestedQuantity));
  const hasCouponIssue = Boolean(appliedCouponCode && currentQuote && !currentQuote.coupon?.isApplied);
  const hasBlockingQuoteIssue = !currentQuote || Boolean(error) || currentQuote.items.length === 0 || hasItemIssue || hasCouponIssue;
  const checkoutHref = currentQuote?.coupon?.isApplied ? `/checkout?coupon=${encodeURIComponent(currentQuote.coupon.code)}` : "/checkout";

  useEffect(() => {
    if (!isReady) {
      return;
    }

    queueMicrotask(() => {
      const storedCoupon = window.localStorage.getItem(CART_COUPON_STORAGE_KEY)?.trim() ?? "";
      setCouponInput(storedCoupon);
      setAppliedCouponCode(storedCoupon);
      validatedCouponCodeRef.current = storedCoupon;
      setCouponReady(true);
    });
  }, [isReady]);

  useEffect(() => {
    if (!isReady || !couponReady || items.length === 0) {
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
        if (previousQuoteRef.current) {
          const nextNotices: Record<string, string> = {};

          for (const nextItem of data.items) {
            const previousItem = previousQuoteRef.current.items.find((item) => item.variantId === nextItem.variantId);

            if (previousItem && previousItem.unitPrice !== nextItem.unitPrice) {
              nextNotices[nextItem.variantId] = `This item changed from ${formatCurrency(previousItem.unitPrice, nextItem.currency)} to ${formatCurrency(nextItem.unitPrice, nextItem.currency)}. Your total has been updated.`;
            }
          }

          if (Object.keys(nextNotices).length > 0) {
            setPriceNotices((current) => ({ ...current, ...nextNotices }));
          }
        }

        previousQuoteRef.current = data;
        setQuoteState({ signature: quoteSignature, quote: data });
        setErrorState(null);
        setUpdatingVariantIds([]);
        quantityRollbackRef.current.clear();

        if (appliedCouponCode && data.coupon?.isApplied) {
          validatedCouponCodeRef.current = data.coupon.code;
          window.localStorage.setItem(CART_COUPON_STORAGE_KEY, data.coupon.code);
        } else if (appliedCouponCode && validatedCouponCodeRef.current === appliedCouponCode && data.coupon && !data.coupon.isApplied) {
          setCouponRemovalMessage(`${appliedCouponCode} was removed because your cart no longer meets its requirements.`);
          setAppliedCouponCode("");
          validatedCouponCodeRef.current = "";
          setCouponInput("");
          window.localStorage.removeItem(CART_COUPON_STORAGE_KEY);
        }
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        const pendingRollbacks = [...quantityRollbackRef.current.entries()];
        quantityRollbackRef.current.clear();
        setUpdatingVariantIds([]);

        for (const [variantId, previousQuantity] of pendingRollbacks) {
          updateQuantity(variantId, previousQuantity);
        }

        if (pendingRollbacks.length > 0) {
          setItemOperationErrors((current) => ({
            ...current,
            ...Object.fromEntries(pendingRollbacks.map(([variantId]) => [variantId, "Quantity could not be updated. Try again."])),
          }));
        }

        setErrorState({ signature: quoteSignature, message: "Your cart could not be refreshed. Please try again." });
      });

    return () => controller.abort();
  }, [appliedCouponCode, couponReady, isReady, items, quoteRequestVersion, quoteSignature, updateQuantity]);

  useEffect(() => {
    const dialog = clearDialogRef.current;

    if (!dialog) {
      return;
    }

    if (clearDialogOpen && !dialog.open) {
      dialog.showModal();
      window.requestAnimationFrame(() => cancelClearRef.current?.focus());
    } else if (!clearDialogOpen && dialog.open) {
      dialog.close();
    }
  }, [clearDialogOpen]);

  useEffect(() => () => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
  }, []);

  const retryQuote = useCallback(() => {
    setErrorState(null);
    setQuoteState((current) => (current?.signature === quoteSignature ? null : current));
    setQuoteRequestVersion((version) => version + 1);
  }, [quoteSignature]);

  function applyCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = couponInput.trim().toUpperCase();

    if (!code || code === appliedCouponCode) {
      return;
    }

    setCouponRemovalMessage("");
    setAppliedCouponCode(code);
  }

  function editCoupon(value: string) {
    setCouponInput(value);
    setCouponRemovalMessage("");

    if (appliedCouponCode) {
      setAppliedCouponCode("");
    }
  }

  function clearCoupon() {
    setCouponInput("");
    setAppliedCouponCode("");
    validatedCouponCodeRef.current = "";
    setCouponExpanded(false);
    setCouponRemovalMessage("Coupon removed. Your total has been updated.");
    window.localStorage.removeItem(CART_COUPON_STORAGE_KEY);
  }

  function changeQuantity(item: CartQuoteItem, quantity: number) {
    if (updatingVariantIds.includes(item.variantId) || quantity < 1 || quantity > item.stock || !Number.isInteger(quantity)) {
      return;
    }

    setCheckoutMessage("");
    setItemOperationErrors((current) => {
      const next = { ...current };
      delete next[item.variantId];
      return next;
    });
    quantityRollbackRef.current.set(item.variantId, item.requestedQuantity);
    setUpdatingVariantIds((current) => [...current, item.variantId]);
    updateQuantity(item.variantId, quantity, item.stock);
  }

  function acceptAdjustedQuantity(item: CartQuoteItem) {
    if (item.quantity <= 0) {
      removeCartItem(item);
      return;
    }

    changeQuantity(item, item.quantity);
  }

  function removeCartItem(item: CartQuoteItem) {
    const cartItem = items.find((candidate) => candidate.variantId === item.variantId);

    if (!cartItem) {
      return;
    }

    removeItem(item.variantId);
    setRemovedItem({ cartItem, name: item.product.name, stock: item.stock });

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }

    undoTimerRef.current = setTimeout(() => setRemovedItem(null), UNDO_DURATION_MS);
  }

  function undoRemove() {
    if (!removedItem) {
      return;
    }

    addItem({ ...removedItem.cartItem, maxStock: removedItem.stock > 0 ? removedItem.stock : undefined });
    setRemovedItem(null);

    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }
  }

  function closeClearDialog() {
    setClearDialogOpen(false);
    window.requestAnimationFrame(() => {
      if (clearCartTriggerRef.current?.isConnected) {
        clearCartTriggerRef.current.focus();
      }
    });
  }

  function confirmClearCart() {
    clearCart();
    previousQuoteRef.current = null;
    setQuoteState(null);
    setAppliedCouponCode("");
    validatedCouponCodeRef.current = "";
    setCouponInput("");
    setClearDialogOpen(false);
    window.localStorage.removeItem(CART_COUPON_STORAGE_KEY);
  }

  async function prepareCheckout() {
    if (checkoutPending || hasBlockingQuoteIssue) {
      return;
    }

    setCheckoutPending(true);
    setCheckoutMessage("");

    try {
      const response = await fetch("/api/cart/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Cart-Intent": "checkout",
        },
        body: JSON.stringify({ items, couponCode: appliedCouponCode || undefined }),
      });

      if (!response.ok) {
        throw new Error("Checkout preparation failed.");
      }

      const checkedQuote = (await response.json()) as CartQuote;
      const changedPrices: Record<string, string> = {};

      for (const checkedItem of checkedQuote.items) {
        const previousItem = currentQuote?.items.find((item) => item.variantId === checkedItem.variantId);

        if (previousItem && previousItem.unitPrice !== checkedItem.unitPrice) {
          changedPrices[checkedItem.variantId] = `This item changed from ${formatCurrency(previousItem.unitPrice, checkedItem.currency)} to ${formatCurrency(checkedItem.unitPrice, checkedItem.currency)}. Your total has been updated.`;
        }
      }

      previousQuoteRef.current = checkedQuote;
      setQuoteState({ signature: quoteSignature, quote: checkedQuote });
      setPriceNotices((current) => ({ ...current, ...changedPrices }));

      const checkedHasIssues = checkedQuote.items.length === 0 || checkedQuote.items.some((item) => !item.isAvailable || item.wasAdjusted || item.quantity !== item.requestedQuantity);
      const checkedCouponIssue = Boolean(appliedCouponCode && !checkedQuote.coupon?.isApplied);

      if (checkedHasIssues || checkedCouponIssue || Object.keys(changedPrices).length > 0) {
        setMobileSummaryExpanded(true);
        setCheckoutMessage("Your cart was updated before checkout. Review the highlighted changes to continue.");
        return;
      }

      setCheckoutNavigationStarted(true);
      router.push(checkoutHref);
    } catch {
      setMobileSummaryExpanded(true);
      setCheckoutMessage("We could not verify your cart right now. Try again shortly.");
    } finally {
      setCheckoutPending(false);
    }
  }

  if (!isReady || !couponReady) {
    return (
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <CartLoadingState />
      </section>
    );
  }

  if (items.length === 0) {
    return <EmptyCartState />;
  }

  const displayedQuote = quote;
  const disabledReason = error
    ? "Refresh your cart before continuing to checkout."
    : hasCouponIssue
      ? "Remove or correct the coupon before continuing to checkout."
      : hasItemIssue
        ? "Resolve the highlighted item updates before continuing to checkout."
        : "Checking current prices and stock before checkout.";
  const displayedTotal = displayedQuote
    ? formatCurrency(displayedQuote.summary.estimatedTotal, displayedQuote.summary.currency)
    : "Checking…";

  return (
    <>
      <div className="grid min-w-0 gap-4 pb-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start xl:gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]" data-mobile-cart-page>
        <section aria-labelledby="cart-items-heading" className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_10px_28px_rgba(18,60,46,0.05)]">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-muted/35 px-4 py-3 sm:px-5">
            <div>
              <h2 className="text-lg font-extrabold text-text" id="cart-items-heading">Cart items</h2>
              <p className="mt-0.5 text-xs font-semibold text-text-muted">{items.length} {items.length === 1 ? "item" : "items"}</p>
            </div>
            <button
              className="min-h-11 shrink-0 cursor-pointer rounded-lg px-2.5 text-xs font-bold text-cta-hover underline-offset-4 transition-colors hover:bg-cta-soft hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              onClick={() => setClearDialogOpen(true)}
              ref={clearCartTriggerRef}
              type="button"
            >
              Clear cart
            </button>
          </div>

          {error ? (
            <div className="m-4 flex flex-col gap-3 rounded-xl border border-danger/25 bg-danger-soft/60 p-3.5 text-sm sm:m-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
              <div>
                <p className="font-extrabold text-danger">Cart failed to load</p>
                <p className="mt-0.5 font-semibold text-text-muted">{error}</p>
              </div>
              <button className="min-h-11 shrink-0 cursor-pointer rounded-xl border border-danger/25 bg-surface px-4 text-sm font-bold text-danger transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger" onClick={retryQuote} type="button">Retry</button>
            </div>
          ) : null}

          {isRefreshingQuote && (!quote || visibleQuoteItems.length === 0) ? <CartLoadingState /> : null}

          {isRefreshingQuote && quote && visibleQuoteItems.length > 0 ? (
            <div className="mx-4 mt-4 flex min-h-10 items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 text-xs font-bold text-text-muted sm:mx-5" role="status">
              <span className="h-2 w-2 animate-pulse rounded-full bg-fresh motion-reduce:animate-none" aria-hidden="true" />
              Updating prices, stock and totals…
            </div>
          ) : null}

          {quote && visibleQuoteItems.length > 0 ? (
            <div className="min-w-0">
              {visibleQuoteItems.map((item) => {
                const localItem = items.find((cartItem) => cartItem.variantId === item.variantId);
                const localQuantity = currentQuote ? item.quantity : (localItem?.quantity ?? item.quantity);

                return (
                  <CartItem
                    isUpdating={updatingVariantIds.includes(item.variantId)}
                    item={item}
                    key={item.variantId}
                    localQuantity={localQuantity}
                    onAcceptAdjustment={() => acceptAdjustedQuantity(item)}
                    onQuantityChange={(quantity) => changeQuantity(item, quantity)}
                    onRemove={() => removeCartItem(item)}
                    operationError={itemOperationErrors[item.variantId]}
                    priceNotice={priceNotices[item.variantId]}
                  />
                );
              })}
            </div>
          ) : null}
        </section>

        <div className="a1-cart-summary-column min-w-0 self-start">
          <aside aria-labelledby="order-summary-heading" className="min-w-0 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_12px_34px_rgba(18,60,46,0.065)] xl:overflow-visible xl:p-4" data-testid="order-summary">
            <div className="flex items-center justify-between gap-3 xl:mb-3">
              <h2 className="min-w-0 flex-1 text-lg font-extrabold tracking-tight text-text xl:text-xl" id="order-summary-heading">
                <button
                  aria-controls="mobile-order-summary-details"
                  aria-expanded={mobileSummaryExpanded}
                  className="flex min-h-[58px] w-full cursor-pointer items-center justify-between gap-3 px-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta xl:hidden"
                  onClick={() => setMobileSummaryExpanded((current) => !current)}
                  type="button"
                >
                  <span>Order summary</span>
                  <span className="flex items-center gap-2.5">
                    <span className="text-base font-black tabular-nums text-primary">{displayedTotal}</span>
                    <svg aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none ${mobileSummaryExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </button>
                <span className="hidden xl:inline">Order summary</span>
              </h2>
              {isRefreshingQuote ? <span className="hidden text-[11px] font-bold text-text-muted xl:inline" role="status">Updating…</span> : null}
            </div>

            <div className={`${mobileSummaryExpanded ? "block motion-safe:animate-[a1-cart-summary-reveal_180ms_ease-out]" : "hidden"} border-t border-border px-4 pb-3 pt-4 xl:block xl:animate-none xl:border-0 xl:p-0`} id="mobile-order-summary-details">
              <PricingSummary quote={displayedQuote} refreshing={isRefreshingQuote} />

              <div className="mt-4">
                <CouponControl
                appliedCouponCode={appliedCouponCode}
                coupon={currentQuote?.coupon ?? quote?.coupon}
                expanded={couponExpanded}
                input={couponInput}
                isApplying={Boolean(appliedCouponCode && !currentQuote)}
                onApply={applyCoupon}
                onChange={editCoupon}
                onRemove={clearCoupon}
                onToggle={() => {
                  setCouponExpanded((current) => !current);
                  setCouponRemovalMessage("");
                  if (appliedCouponCode && !currentQuote?.coupon?.isApplied) {
                    setAppliedCouponCode("");
                  }
                }}
                removalMessage={couponRemovalMessage}
              />
              </div>

              <div className="mt-3 flex gap-2.5 px-0.5 text-xs font-semibold leading-[1.45] text-text-muted">
                <svg aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-fresh" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
                  <path d="M12 21s6-5.2 6-10.7a6 6 0 1 0-12 0C6 15.8 12 21 12 21Z" />
                  <circle cx="12" cy="10" r="2" />
                </svg>
                <p>Choose delivery or free Salisbury pickup at checkout. Prices and stock are confirmed before ordering.</p>
              </div>

              <div className={`${hasBlockingQuoteIssue || checkoutMessage ? "pt-3" : ""}`} id="checkout-status">
                {hasBlockingQuoteIssue ? <p className="text-xs font-bold leading-5 text-warning" role="status">{disabledReason}</p> : null}
                {checkoutMessage ? <p className={`text-xs font-bold leading-5 ${checkoutMessage.startsWith("We could not") ? "text-danger" : "text-warning"}`} role="alert">{checkoutMessage}</p> : null}
              </div>

              <div className="mt-2.5 hidden xl:block">
                <button
                  aria-describedby="checkout-status"
                  className="a1-primary-button min-h-11 w-full cursor-pointer rounded-xl px-5 text-sm disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted disabled:shadow-none"
                  disabled={hasBlockingQuoteIssue || checkoutPending}
                  onClick={prepareCheckout}
                  type="button"
                >
                  {checkoutPending ? "Checking your cart…" : "Continue to checkout"}
                </button>
              </div>
            </div>
            <Link className="mt-2 hidden min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-bold text-primary transition-colors hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta xl:flex" href="/products">
              Continue shopping
            </Link>
          </aside>
          <Link className="mx-auto mt-3 flex min-h-11 w-fit items-center justify-center rounded-lg px-4 text-sm font-bold text-primary underline-offset-4 transition-colors hover:bg-fresh-soft hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta xl:hidden" data-testid="mobile-continue-shopping" href="/products">
            Continue shopping
          </Link>
        </div>
      </div>

      <p aria-atomic="true" aria-live="polite" className="sr-only">Estimated total {displayedTotal}</p>

      {!hasBlockingQuoteIssue && !clearDialogOpen && !checkoutNavigationStarted ? (
        <MobileCheckoutBar onCheckout={prepareCheckout} pending={checkoutPending} quote={displayedQuote} />
      ) : null}

      {removedItem ? (
        <div className="fixed bottom-[calc(var(--mobile-nav-height)+var(--mobile-cart-bar-height)+var(--safe-area-bottom)+0.75rem)] left-4 right-4 z-[var(--z-layer-alert)] mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary px-4 py-3 text-sm text-white shadow-[0_16px_40px_rgba(18,60,46,0.24)] xl:bottom-6 xl:left-auto xl:right-6" role="status">
          <p className="min-w-0 truncate font-semibold"><span className="font-extrabold">{removedItem.name}</span> removed</p>
          <button className="min-h-11 shrink-0 cursor-pointer rounded-lg px-2.5 font-extrabold text-[#F4D889] underline-offset-4 hover:bg-white/10 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" onClick={undoRemove} type="button">Undo</button>
        </div>
      ) : null}

      <ClearCartDialog cancelButtonRef={cancelClearRef} dialogRef={clearDialogRef} onCancel={closeClearDialog} onClear={confirmClearCart} />
    </>
  );
}
