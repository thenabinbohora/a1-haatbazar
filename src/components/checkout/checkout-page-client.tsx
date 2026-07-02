"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { createCheckoutOrderAction, type CheckoutActionState } from "@/app/checkout/actions";
import { formatCurrency } from "@/components/product/price";
import { useCart } from "@/store/cart-store";

type CheckoutQuoteItem = {
  productId: string;
  variantId: string;
  quantity: number;
  requestedQuantity: number;
  stock: number;
  unitPrice: number;
  currency: string;
  lineTotal: number;
  isAvailable: boolean;
  wasAdjusted: boolean;
  reason: string | null;
  product: {
    name: string;
    slug: string;
    categoryName: string;
  };
  variant: {
    name: string;
    sku: string;
  };
};

type CheckoutQuote = {
  items: CheckoutQuoteItem[];
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

type CheckoutCustomer = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string | null;
    suburb: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
};

type CheckoutPageClientProps = {
  initialCouponCode?: string;
  customer?: CheckoutCustomer | null;
};

const initialState: CheckoutActionState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-sm font-semibold text-danger">{errors[0]}</p>;
}

function fieldClass(hasError?: boolean) {
  return [
    "mt-2 min-h-11 w-full rounded-md border bg-surface px-3 text-sm text-text focus:border-cta",
    hasError ? "border-danger" : "border-border",
  ].join(" ");
}

function normalizeCoupon(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function CheckoutPageClient({ customer, initialCouponCode = "" }: CheckoutPageClientProps) {
  const { isReady, items } = useCart();
  const [state, formAction, isPending] = useActionState(createCheckoutOrderAction, initialState);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [couponInput, setCouponInput] = useState(initialCouponCode);
  const [appliedCouponCode, setAppliedCouponCode] = useState(normalizeCoupon(initialCouponCode));
  const [quoteState, setQuoteState] = useState<{ signature: string; quote: CheckoutQuote } | null>(null);
  const [errorState, setErrorState] = useState<{ signature: string; message: string } | null>(null);
  const quoteSignature = useMemo(() => JSON.stringify({ items, couponCode: appliedCouponCode }), [appliedCouponCode, items]);
  const quote = quoteState?.signature === quoteSignature ? quoteState.quote : null;
  const quoteError = errorState?.signature === quoteSignature ? errorState.message : null;
  const isLoadingQuote = isReady && items.length > 0 && !quote && !quoteError;
  const hasBlockingCartIssue =
    !quote ||
    quote.items.length === 0 ||
    quote.items.some((item) => !item.isAvailable || item.quantity !== item.requestedQuantity || item.stock < item.requestedQuantity);
  const paymentMethod = fulfillmentMethod === "DELIVERY" ? "PAY_ON_DELIVERY" : "PAY_AT_PICKUP";
  const paymentLabel = fulfillmentMethod === "DELIVERY" ? "Pay on delivery" : "Pay at pickup";
  const customerName = customer?.name ?? customer?.address?.fullName ?? "";
  const customerPhone = customer?.phone ?? customer?.address?.phone ?? "";

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

        return (await response.json()) as CheckoutQuote;
      })
      .then((data) => {
        setQuoteState({ signature: quoteSignature, quote: data });
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        setErrorState({ signature: quoteSignature, message: "Cart could not be refreshed. Please return to cart." });
      });

    return () => controller.abort();
  }, [appliedCouponCode, isReady, items, quoteSignature]);

  function applyCoupon() {
    setAppliedCouponCode(normalizeCoupon(couponInput));
  }

  if (!isReady) {
    return <div className="skeleton-shimmer h-80 rounded-lg border border-border" />;
  }

  if (items.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase text-fresh">Checkout</p>
        <h1 className="mt-2 text-3xl font-bold text-text">Your cart is empty</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-muted">
          Add groceries to your cart before starting checkout.
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
    <form action={formAction} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
      <input name="cartItems" type="hidden" value={JSON.stringify(items)} />
      <input name="fulfillmentMethod" type="hidden" value={fulfillmentMethod} />
      <input name="couponCode" type="hidden" value={quote?.coupon?.isApplied ? quote.coupon.code : appliedCouponCode} />
      <input name="paymentMethod" type="hidden" value={paymentMethod} />

      <div className="grid gap-6">
        {state.formError ? (
          <div className="rounded-md border border-danger bg-danger-soft p-4 text-sm font-semibold text-danger" role="alert">
            {state.formError}
          </div>
        ) : null}

        <nav className="rounded-lg border border-border bg-surface p-4 shadow-sm" aria-label="Checkout progress">
          <ol className="grid gap-2 text-sm font-bold text-text-muted sm:grid-cols-5">
            {["Cart", "Details", "Delivery", "Payment", "Review"].map((step, index) => (
              <li className="flex items-center gap-2" key={step}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs text-white">{index + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </nav>

        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase text-fresh">Fulfilment method</p>
          <h2 className="mt-1 text-2xl font-bold text-text">Choose how you want to receive your groceries</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["DELIVERY", "Delivery", "Delivery details will be confirmed by our team."],
              ["PICKUP", "Store pickup", "Pickup is free. We will contact you when your order is ready."],
            ].map(([value, title, text]) => {
              const isSelected = fulfillmentMethod === value;

              return (
                <label
                  className={[
                    "cursor-pointer rounded-lg border p-4 transition-colors",
                    isSelected ? "border-primary bg-fresh-soft" : "border-border bg-surface-muted hover:border-primary/50",
                  ].join(" ")}
                  key={value}
                >
                  <input
                    checked={isSelected}
                    className="sr-only"
                    name="fulfillmentChoice"
                    onChange={() => setFulfillmentMethod(value as "DELIVERY" | "PICKUP")}
                    type="radio"
                    value={value}
                  />
                  <span className="block text-base font-bold text-text">{title}</span>
                  <span className="mt-1 block text-sm leading-6 text-text-muted">{text}</span>
                </label>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase text-fresh">Customer details</p>
          <h2 className="mt-1 text-2xl font-bold text-text">Contact information</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-text">Full name</span>
              <input className={fieldClass(Boolean(state.fieldErrors?.customerName))} defaultValue={customerName} name="customerName" required />
              <FieldError errors={state.fieldErrors?.customerName} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-text">Email</span>
              <input className={fieldClass(Boolean(state.fieldErrors?.customerEmail))} defaultValue={customer?.email ?? ""} name="customerEmail" required type="email" />
              <FieldError errors={state.fieldErrors?.customerEmail} />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-text">Phone</span>
              <input className={fieldClass(Boolean(state.fieldErrors?.customerPhone))} defaultValue={customerPhone} name="customerPhone" required type="tel" />
              <FieldError errors={state.fieldErrors?.customerPhone} />
            </label>
          </div>
        </section>

        {fulfillmentMethod === "DELIVERY" ? (
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase text-fresh">Delivery address</p>
            <h2 className="mt-1 text-2xl font-bold text-text">Where should we deliver?</h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">Delivery fee: confirmed by staff.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-text">Address line 1 *</span>
                <input className={fieldClass(Boolean(state.fieldErrors?.addressLine1))} defaultValue={customer?.address?.line1 ?? ""} name="addressLine1" required />
                <FieldError errors={state.fieldErrors?.addressLine1} />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-text">Address line 2</span>
                <input className={fieldClass(Boolean(state.fieldErrors?.addressLine2))} defaultValue={customer?.address?.line2 ?? ""} name="addressLine2" />
                <FieldError errors={state.fieldErrors?.addressLine2} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-text">Suburb or city *</span>
                <input className={fieldClass(Boolean(state.fieldErrors?.suburb))} defaultValue={customer?.address?.suburb ?? ""} name="suburb" required />
                <FieldError errors={state.fieldErrors?.suburb} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-text">State *</span>
                <input className={fieldClass(Boolean(state.fieldErrors?.state))} defaultValue={customer?.address?.state ?? ""} name="state" required />
                <FieldError errors={state.fieldErrors?.state} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-text">Postcode *</span>
                <input className={fieldClass(Boolean(state.fieldErrors?.postalCode))} defaultValue={customer?.address?.postalCode ?? ""} name="postalCode" required />
                <FieldError errors={state.fieldErrors?.postalCode} />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-text">Country *</span>
                <input className={fieldClass(Boolean(state.fieldErrors?.country))} defaultValue={customer?.address?.country ?? "Australia"} name="country" required />
                <FieldError errors={state.fieldErrors?.country} />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-text">Delivery notes</span>
                <textarea
                  className="mt-2 min-h-24 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:border-cta"
                  name="deliveryNotes"
                  placeholder="Apartment access, preferred time, or handoff notes"
                />
              </label>
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase text-fresh">Store pickup</p>
            <h2 className="mt-1 text-2xl font-bold text-text">Pick up from A1 Haat Bazar</h2>
            <div className="mt-4 rounded-lg border border-primary/20 bg-fresh-soft p-4 text-sm leading-6 text-primary">
              <p className="font-bold">We will contact you when your order is packed and ready for pickup.</p>
              <p className="mt-1">Pickup is free.</p>
            </div>
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-text">Pickup notes</span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus:border-cta"
                name="pickupNotes"
                placeholder="Preferred pickup time or any notes for our team"
              />
            </label>
          </section>
        )}

        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase text-fresh">Coupon</p>
          <h2 className="mt-1 text-2xl font-bold text-text">Apply an offer code</h2>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              className="min-h-11 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm text-text placeholder:text-text-muted focus:border-cta"
              onChange={(event) => setCouponInput(event.target.value)}
              placeholder="Enter coupon code"
              type="text"
              value={couponInput}
            />
            <button
              className="a1-primary-button cursor-pointer px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              onClick={applyCoupon}
              type="button"
            >
              Apply
            </button>
          </div>
          {appliedCouponCode ? (
            <p
              className={[
                "mt-3 rounded-md border p-3 text-sm font-semibold",
                quote?.coupon?.isApplied ? "border-fresh bg-fresh-soft text-fresh" : "border-danger bg-danger-soft text-danger",
              ].join(" ")}
            >
              {quote?.coupon?.message ?? "Checking coupon..."}
            </p>
          ) : null}
        </section>

        <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase text-fresh">Payment</p>
          <h2 className="mt-1 text-2xl font-bold text-text">Payment method</h2>
          <div className="mt-5 grid gap-3">
            <div className="rounded-md border border-primary bg-fresh-soft p-4">
              <span className="block text-sm font-bold text-text">{paymentLabel}</span>
              <span className="mt-1 block text-sm leading-6 text-text-muted">
                {fulfillmentMethod === "DELIVERY"
                  ? "Pay when your order is delivered."
                  : "Pay when you collect your order from A1 Haat Bazar."}
              </span>
            </div>
            <div className="rounded-md border border-border bg-surface-muted p-4 text-text-muted">
              <span className="block text-sm font-bold">Online payment</span>
              <span className="mt-1 block text-sm leading-6">Coming soon. This option is not available yet.</span>
            </div>
          </div>
        </section>
      </div>

      <aside className="rounded-lg border border-border bg-surface p-5 shadow-sm lg:sticky lg:top-28">
        <p className="text-sm font-semibold uppercase text-fresh">Order summary</p>
        <h2 className="mt-1 text-2xl font-bold text-text">Review order</h2>

        {quoteError ? (
          <div className="mt-4 rounded-md border border-danger bg-danger-soft p-3 text-sm font-semibold text-danger">
            {quoteError}
          </div>
        ) : null}

        {isLoadingQuote ? <div className="skeleton-shimmer mt-5 h-40 rounded-md" /> : null}

        {quote ? (
          <>
            <div className="mt-5 grid gap-3">
              {quote.items.map((item) => (
                <div className="rounded-md border border-border bg-surface-muted p-3" key={item.variantId}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold leading-5 text-text">{item.product.name}</p>
                      <p className="mt-1 text-xs font-semibold text-text-muted">
                        {item.variant.name} / {item.requestedQuantity} x {formatCurrency(item.unitPrice, item.currency)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-text">{formatCurrency(item.lineTotal, item.currency)}</p>
                  </div>
                  {item.reason ? <p className="mt-2 text-xs font-semibold text-warning">{item.reason}</p> : null}
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 border-t border-border pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-text-muted">Subtotal</span>
                <span className="font-bold text-text">{formatCurrency(quote.summary.subtotal, quote.summary.currency)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-text-muted">Discount</span>
                <span className="font-bold text-text">{formatCurrency(quote.summary.discount, quote.summary.currency)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-text-muted">{fulfillmentMethod === "DELIVERY" ? "Delivery fee" : "Pickup"}</span>
                <span className="text-right font-bold text-text-muted">
                  {fulfillmentMethod === "DELIVERY" ? "Confirmed by staff" : "Free"}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-3">
                <span className="text-base font-bold text-text">Estimated total</span>
                <span className="text-xl font-bold text-text">
                  {formatCurrency(quote.summary.estimatedTotal, quote.summary.currency)}
                </span>
              </div>
            </div>
          </>
        ) : null}

        <div className="mt-5 rounded-md border border-border bg-surface-muted p-3 text-sm leading-6 text-text-muted">
          Your order will be confirmed after stock and {fulfillmentMethod === "DELIVERY" ? "delivery details" : "pickup details"} are checked.
        </div>

        {hasBlockingCartIssue ? (
          <div className="mt-5 rounded-md border border-warning bg-cta-soft p-3 text-sm font-semibold text-warning">
            Review your cart before checkout. Items must be available and within stock limits.
          </div>
        ) : null}

        <button
          className="a1-primary-button mt-5 w-full cursor-pointer px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted"
          disabled={isPending || hasBlockingCartIssue}
          type="submit"
        >
          {isPending ? "Placing order..." : fulfillmentMethod === "DELIVERY" ? "Place pay on delivery order" : "Place pickup order"}
        </button>
        <Link
          className="mt-3 flex min-h-12 items-center justify-center rounded-md border border-border bg-surface px-5 text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          href="/cart"
        >
          Back to cart
        </Link>
      </aside>
    </form>
  );
}
