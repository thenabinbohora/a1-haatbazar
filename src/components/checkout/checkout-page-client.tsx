"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createCheckoutOrderAction, type CheckoutActionState } from "@/app/checkout/actions";
import { formatCurrency } from "@/components/product/price";
import { STORE_CONFIG } from "@/config/store";
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

function FieldError({ errors, id }: { errors?: string[]; id: string }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-sm font-semibold text-danger" id={id} role="alert">{errors[0]}</p>;
}

function fieldClass(hasError?: boolean) {
  return [
    "mt-2 min-h-12 w-full rounded-xl border bg-surface px-3.5 text-base text-text outline-none transition-[border-color,box-shadow] placeholder:text-text-muted focus:border-cta focus:shadow-[0_0_0_3px_rgba(217,107,43,0.16)]",
    hasError ? "border-danger" : "border-border",
  ].join(" ");
}

function normalizeCoupon(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function MobileCheckoutSummary({
  fulfillmentMethod,
  hasBlockingIssue,
  isLoading,
  onRetry,
  quote,
  quoteError,
}: {
  fulfillmentMethod: "DELIVERY" | "PICKUP";
  hasBlockingIssue: boolean;
  isLoading: boolean;
  onRetry: () => void;
  quote: CheckoutQuote | null;
  quoteError: string | null;
}) {
  const totalLabel = fulfillmentMethod === "DELIVERY" ? "Items total" : "Order total";

  return (
    <details className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm lg:hidden" open={hasBlockingIssue || undefined}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta">
        <span>
          <span className="block text-xs font-extrabold uppercase tracking-[0.12em] text-fresh">Order summary</span>
          <span className="mt-0.5 block text-sm font-bold text-text">
            {quote ? `${quote.items.length} ${quote.items.length === 1 ? "item" : "items"}` : isLoading ? "Checking cart…" : "Review required"}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-right">
            <span className="block text-[0.68rem] font-bold text-text-muted">{totalLabel}</span>
            <span className="block text-lg font-black tabular-nums text-primary">
              {quote ? formatCurrency(quote.summary.estimatedTotal, quote.summary.currency) : "—"}
            </span>
          </span>
          <svg aria-hidden="true" className="h-5 w-5 text-primary transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
        </span>
      </summary>
      <div className="border-t border-border px-4 py-4">
        {quoteError ? (
          <div className="rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm font-semibold text-danger" role="alert">
            <p>{quoteError}</p>
            <button className="mt-2 min-h-11 rounded-xl border border-danger/40 bg-white px-4 font-bold" onClick={onRetry} type="button">Try again</button>
          </div>
        ) : null}
        {isLoading ? <div className="skeleton-shimmer h-20 rounded-xl" role="status" aria-label="Updating order summary" /> : null}
        {quote ? (
          <>
            <div className="grid gap-2.5">
              {quote.items.map((item) => (
                <div className="flex items-start justify-between gap-3 text-sm" key={item.variantId}>
                  <p className="min-w-0 flex-1 font-semibold leading-5 text-text"><span className="line-clamp-1">{item.product.name}</span><span className="block text-xs font-medium text-text-muted">{item.variant.name} · Qty {item.requestedQuantity}</span>{item.reason ? <span className="mt-1 block text-xs font-bold text-cta-hover">{item.reason}</span> : null}</p>
                  <p className="shrink-0 font-extrabold tabular-nums text-text">{formatCurrency(item.lineTotal, item.currency)}</p>
                </div>
              ))}
            </div>
            {hasBlockingIssue ? (
              <div className="mt-3 rounded-xl border border-cta/35 bg-cta-soft p-3 text-sm font-semibold leading-6 text-cta-hover" role="alert">
                <p>One or more items need attention before checkout.</p>
                <Link className="mt-1 inline-flex min-h-11 items-center font-extrabold underline underline-offset-4" href="/cart">Update cart</Link>
              </div>
            ) : null}
            {fulfillmentMethod === "DELIVERY" ? <p className="mt-3 rounded-xl bg-cta-soft px-3 py-2 text-xs font-semibold leading-5 text-cta-hover">Delivery availability and fee are confirmed before fulfilment. This is the items total.</p> : null}
          </>
        ) : null}
      </div>
    </details>
  );
}

export function CheckoutPageClient({ customer, initialCouponCode = "" }: CheckoutPageClientProps) {
  const { isReady, items } = useCart();
  const [state, formAction, isPending] = useActionState(createCheckoutOrderAction, initialState);
  const [fulfillmentMethod, setFulfillmentMethod] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [couponInput, setCouponInput] = useState(initialCouponCode);
  const [appliedCouponCode, setAppliedCouponCode] = useState(normalizeCoupon(initialCouponCode));
  const [quoteState, setQuoteState] = useState<{ signature: string; quote: CheckoutQuote } | null>(null);
  const [errorState, setErrorState] = useState<{ signature: string; message: string } | null>(null);
  const [quoteRequestVersion, setQuoteRequestVersion] = useState(0);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);
  const checkoutFormRef = useRef<HTMLFormElement | null>(null);
  const [addressDraft, setAddressDraft] = useState(() => ({
    addressLine1: customer?.address?.line1 ?? "",
    addressLine2: customer?.address?.line2 ?? "",
    country: customer?.address?.country ?? "Australia",
    deliveryNotes: "",
    postalCode: customer?.address?.postalCode ?? "",
    state: customer?.address?.state ?? "",
    suburb: customer?.address?.suburb ?? "",
  }));
  const [pickupNotesDraft, setPickupNotesDraft] = useState("");
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
  const submitLabel = isPending
    ? fulfillmentMethod === "DELIVERY" ? "Requesting order…" : "Placing order…"
    : fulfillmentMethod === "DELIVERY" ? "Request delivery order" : "Place pickup order";
  const mobileSubmitLabel = isPending
    ? fulfillmentMethod === "DELIVERY" ? "Requesting…" : "Placing…"
    : fulfillmentMethod === "DELIVERY" ? "Request order" : "Place order";
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
        setErrorState(null);
      })
      .catch((fetchError: unknown) => {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") {
          return;
        }

        setErrorState({ signature: quoteSignature, message: "Cart could not be refreshed. Please return to cart." });
      });

    return () => controller.abort();
  }, [appliedCouponCode, isReady, items, quoteRequestVersion, quoteSignature]);

  useEffect(() => {
    if (state.formError) {
      errorSummaryRef.current?.focus();
    }
  }, [state.formError]);

  function applyCoupon() {
    setAppliedCouponCode(normalizeCoupon(couponInput));
  }

  function clearCoupon() {
    setCouponInput("");
    setAppliedCouponCode("");
  }

  function retryQuote() {
    setErrorState(null);
    setQuoteState(null);
    setQuoteRequestVersion((version) => version + 1);
  }

  function changeFulfillmentMethod(nextMethod: "DELIVERY" | "PICKUP") {
    if (fulfillmentMethod === "DELIVERY" && nextMethod === "PICKUP" && checkoutFormRef.current) {
      const formData = new FormData(checkoutFormRef.current);
      setAddressDraft({
        addressLine1: String(formData.get("addressLine1") ?? ""),
        addressLine2: String(formData.get("addressLine2") ?? ""),
        country: String(formData.get("country") ?? "Australia"),
        deliveryNotes: String(formData.get("deliveryNotes") ?? ""),
        postalCode: String(formData.get("postalCode") ?? ""),
        state: String(formData.get("state") ?? ""),
        suburb: String(formData.get("suburb") ?? ""),
      });
    }

    if (fulfillmentMethod === "PICKUP" && nextMethod === "DELIVERY" && checkoutFormRef.current) {
      const formData = new FormData(checkoutFormRef.current);
      setPickupNotesDraft(String(formData.get("pickupNotes") ?? ""));
    }

    setFulfillmentMethod(nextMethod);
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
    <form action={formAction} aria-busy={isPending} className="grid gap-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-8 lg:pb-0" ref={checkoutFormRef}>
      <input name="cartItems" type="hidden" value={JSON.stringify(items)} />
      <input name="fulfillmentMethod" type="hidden" value={fulfillmentMethod} />
      <input name="couponCode" type="hidden" value={quote?.coupon?.isApplied ? quote.coupon.code : ""} />
      <input name="paymentMethod" type="hidden" value={paymentMethod} />

      <div aria-disabled={isPending} className="grid gap-6" inert={isPending}>
        {state.formError ? (
          <div className="rounded-xl border border-danger/35 bg-danger-soft p-4 text-sm font-semibold text-danger outline-none" ref={errorSummaryRef} role="alert" tabIndex={-1}>
            {state.formError}
          </div>
        ) : null}

        <nav className="rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm" aria-label="Checkout progress">
          <ol className="grid grid-cols-3 items-center text-xs font-bold sm:text-sm">
            <li className="text-fresh">
              <Link className="flex min-h-11 items-center gap-2 rounded-xl underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cta" href="/cart">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-fresh-soft" aria-hidden="true">✓</span>
                <span>Cart</span>
              </Link>
            </li>
            <li aria-current="step" className="flex items-center justify-center gap-2 text-primary">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs text-white">2</span>
              <span>Checkout</span>
            </li>
            <li className="flex items-center justify-end gap-2 text-text-muted">
              <span className="grid h-7 w-7 place-items-center rounded-full border border-border bg-surface-muted text-xs">3</span>
              <span className="hidden sm:inline">Confirmation</span>
            </li>
          </ol>
        </nav>

        <MobileCheckoutSummary
          fulfillmentMethod={fulfillmentMethod}
          hasBlockingIssue={hasBlockingCartIssue}
          isLoading={isLoadingQuote}
          onRetry={retryQuote}
          quote={quote}
          quoteError={quoteError}
        />

        <fieldset className="rounded-2xl border border-border bg-surface p-4 shadow-[0_16px_42px_rgba(18,60,46,0.06)] sm:p-6">
          <legend>
            <span className="block text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">Fulfilment method</span>
            <span className="mt-1 block text-xl font-extrabold text-text sm:text-2xl">How would you like your groceries?</span>
          </legend>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["DELIVERY", "Delivery", "Delivery details will be confirmed by our team."],
              ["PICKUP", "Store pickup", "Pickup is free. We will contact you when your order is ready."],
            ].map(([value, title, text]) => {
              const isSelected = fulfillmentMethod === value;

              return (
                <label
                  className={[
                    "min-h-24 cursor-pointer rounded-xl border p-4 transition-[border-color,background-color,box-shadow] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cta",
                    isSelected ? "border-primary bg-fresh-soft shadow-[0_8px_20px_rgba(18,60,46,0.08)]" : "border-border bg-surface hover:border-primary/40 hover:bg-surface-muted",
                  ].join(" ")}
                  key={value}
                >
                  <input
                    checked={isSelected}
                    className="sr-only"
                    name="fulfillmentChoice"
                    onChange={() => changeFulfillmentMethod(value as "DELIVERY" | "PICKUP")}
                    type="radio"
                    value={value}
                  />
                  <span className="flex items-center gap-2 text-base font-extrabold text-text">
                    <span className={[
                      "grid h-5 w-5 place-items-center rounded-full border",
                      isSelected ? "border-primary bg-primary" : "border-border bg-white",
                    ].join(" ")}>
                      {isSelected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                    </span>
                    {title}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-text-muted">{text}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_16px_42px_rgba(18,60,46,0.06)] sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">Customer details</p>
          <h2 className="mt-1 text-xl font-extrabold text-text sm:text-2xl">Contact information</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-semibold text-text">Full name</span>
              <input aria-describedby={state.fieldErrors?.customerName ? "customer-name-error" : undefined} aria-invalid={Boolean(state.fieldErrors?.customerName)} autoComplete="name" className={fieldClass(Boolean(state.fieldErrors?.customerName))} defaultValue={customerName} enterKeyHint="next" id="customer-name" name="customerName" required />
              <FieldError errors={state.fieldErrors?.customerName} id="customer-name-error" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-text">Email</span>
              <input aria-describedby={state.fieldErrors?.customerEmail ? "customer-email-error" : undefined} aria-invalid={Boolean(state.fieldErrors?.customerEmail)} autoComplete="email" className={fieldClass(Boolean(state.fieldErrors?.customerEmail))} defaultValue={customer?.email ?? ""} enterKeyHint="next" id="customer-email" name="customerEmail" required type="email" />
              <FieldError errors={state.fieldErrors?.customerEmail} id="customer-email-error" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-text">Phone</span>
              <input aria-describedby={state.fieldErrors?.customerPhone ? "customer-phone-error" : undefined} aria-invalid={Boolean(state.fieldErrors?.customerPhone)} autoComplete="tel" className={fieldClass(Boolean(state.fieldErrors?.customerPhone))} defaultValue={customerPhone} enterKeyHint="next" id="customer-phone" inputMode="tel" name="customerPhone" required type="tel" />
              <FieldError errors={state.fieldErrors?.customerPhone} id="customer-phone-error" />
            </label>
          </div>
        </section>

        {fulfillmentMethod === "DELIVERY" ? (
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_16px_42px_rgba(18,60,46,0.06)] sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">Delivery address</p>
            <h2 className="mt-1 text-xl font-extrabold text-text sm:text-2xl">Where should we deliver?</h2>
            <p className="mt-2 rounded-xl bg-cta-soft px-3.5 py-3 text-sm leading-6 text-text-muted">Local delivery availability and any delivery fee are confirmed by our team before fulfilment. The order total below excludes delivery; store pickup is free.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-text">Address line 1 *</span>
                <input aria-describedby={state.fieldErrors?.addressLine1 ? "address-line1-error" : undefined} aria-invalid={Boolean(state.fieldErrors?.addressLine1)} autoComplete="shipping address-line1" className={fieldClass(Boolean(state.fieldErrors?.addressLine1))} defaultValue={addressDraft.addressLine1} enterKeyHint="next" id="address-line1" name="addressLine1" required />
                <FieldError errors={state.fieldErrors?.addressLine1} id="address-line1-error" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-text">Address line 2</span>
                <input aria-describedby={state.fieldErrors?.addressLine2 ? "address-line2-error" : undefined} aria-invalid={Boolean(state.fieldErrors?.addressLine2)} autoComplete="shipping address-line2" className={fieldClass(Boolean(state.fieldErrors?.addressLine2))} defaultValue={addressDraft.addressLine2} enterKeyHint="next" id="address-line2" name="addressLine2" />
                <FieldError errors={state.fieldErrors?.addressLine2} id="address-line2-error" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-text">Suburb or city *</span>
                <input aria-describedby={state.fieldErrors?.suburb ? "suburb-error" : undefined} aria-invalid={Boolean(state.fieldErrors?.suburb)} autoComplete="shipping address-level2" className={fieldClass(Boolean(state.fieldErrors?.suburb))} defaultValue={addressDraft.suburb} enterKeyHint="next" id="suburb" name="suburb" required />
                <FieldError errors={state.fieldErrors?.suburb} id="suburb-error" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-text">State *</span>
                <input aria-describedby={state.fieldErrors?.state ? "state-error" : undefined} aria-invalid={Boolean(state.fieldErrors?.state)} autoComplete="shipping address-level1" className={fieldClass(Boolean(state.fieldErrors?.state))} defaultValue={addressDraft.state} enterKeyHint="next" id="state" name="state" required />
                <FieldError errors={state.fieldErrors?.state} id="state-error" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-text">Postcode *</span>
                <input aria-describedby={state.fieldErrors?.postalCode ? "postal-code-error" : undefined} aria-invalid={Boolean(state.fieldErrors?.postalCode)} autoComplete="shipping postal-code" className={fieldClass(Boolean(state.fieldErrors?.postalCode))} defaultValue={addressDraft.postalCode} enterKeyHint="next" id="postal-code" inputMode="numeric" maxLength={4} name="postalCode" pattern="[0-9]{4}" required />
                <FieldError errors={state.fieldErrors?.postalCode} id="postal-code-error" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-text">Country *</span>
                <input aria-describedby={state.fieldErrors?.country ? "country-error" : undefined} aria-invalid={Boolean(state.fieldErrors?.country)} autoComplete="shipping country-name" className={fieldClass(Boolean(state.fieldErrors?.country))} defaultValue={addressDraft.country} enterKeyHint="done" id="country" name="country" required />
                <FieldError errors={state.fieldErrors?.country} id="country-error" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-semibold text-text">Delivery notes</span>
                <textarea
                  className="mt-2 min-h-24 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-base text-text outline-none focus:border-cta focus:shadow-[0_0_0_3px_rgba(217,107,43,0.16)]"
                  defaultValue={addressDraft.deliveryNotes}
                  name="deliveryNotes"
                  placeholder="Apartment access, preferred time, or handoff notes"
                />
              </label>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_16px_42px_rgba(18,60,46,0.06)] sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">Store pickup</p>
            <h2 className="mt-1 text-xl font-extrabold text-text sm:text-2xl">Pick up from {STORE_CONFIG.storeName}</h2>
            <div className="mt-4 rounded-xl border border-primary/20 bg-fresh-soft p-4 text-sm leading-6 text-primary">
              <p className="font-bold">We will contact you when your order is packed and ready for pickup.</p>
              <p className="mt-1">Pickup is free.</p>
              <address className="mt-2 not-italic">{STORE_CONFIG.address}</address>
              <p>{STORE_CONFIG.openingHours}</p>
            </div>
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-text">Pickup notes</span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-xl border border-border bg-surface px-3.5 py-3 text-base text-text outline-none focus:border-cta focus:shadow-[0_0_0_3px_rgba(217,107,43,0.16)]"
                name="pickupNotes"
                defaultValue={pickupNotesDraft}
                placeholder="Preferred pickup time or any notes for our team"
              />
            </label>
          </section>
        )}

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_16px_42px_rgba(18,60,46,0.06)] sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">Offer code</p>
          <h2 className="mt-1 text-xl font-extrabold text-text sm:text-2xl">Have a coupon?</h2>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <label className="sr-only" htmlFor="checkout-coupon">Coupon code</label>
            <input
              autoCapitalize="characters"
              autoComplete="off"
              className="min-h-12 min-w-0 flex-1 rounded-xl border border-border bg-surface px-3.5 text-base uppercase text-text outline-none placeholder:normal-case placeholder:text-text-muted focus:border-cta focus:shadow-[0_0_0_3px_rgba(217,107,43,0.16)]"
              id="checkout-coupon"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyCoupon();
                }
              }}
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
            <div
              className={[
                "mt-3 rounded-xl border p-3 text-sm font-semibold",
                !quote
                  ? "border-border bg-surface-muted text-text-muted"
                  : quote.coupon?.isApplied
                    ? "border-fresh bg-fresh-soft text-fresh"
                    : "border-danger bg-danger-soft text-danger",
              ].join(" ")}
            >
              <p>{quote?.coupon?.message ?? "Checking coupon..."}</p>
              <button className="mt-2 min-h-11 rounded-lg px-2 text-xs font-extrabold underline underline-offset-4" onClick={clearCoupon} type="button">Remove code</button>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_16px_42px_rgba(18,60,46,0.06)] sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">Payment</p>
          <h2 className="mt-1 text-xl font-extrabold text-text sm:text-2xl">Payment method</h2>
          <div className="mt-5">
            <div className="rounded-xl border border-primary bg-fresh-soft p-4 shadow-[0_8px_20px_rgba(18,60,46,0.06)]">
              <span className="flex items-center gap-2 text-sm font-extrabold text-text"><span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[11px] text-white" aria-hidden="true">✓</span>{paymentLabel}</span>
              <span className="mt-1.5 block text-sm leading-6 text-text-muted">
                {fulfillmentMethod === "DELIVERY"
                  ? "Pay when your order is delivered."
                  : `Pay when you collect your order from ${STORE_CONFIG.storeName}.`}
              </span>
            </div>
          </div>
        </section>
      </div>

      <aside className="hidden rounded-2xl border border-border bg-surface p-5 shadow-[0_20px_55px_rgba(18,60,46,0.1)] lg:sticky lg:top-44 lg:block">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">Order summary</p>
        <h2 className="mt-1 text-2xl font-extrabold text-text">Review your order</h2>

        {quoteError ? (
          <div className="mt-4 rounded-xl border border-danger/35 bg-danger-soft p-3 text-sm font-semibold text-danger" role="alert">
            <p>{quoteError}</p>
            <button className="mt-2 min-h-11 rounded-xl border border-danger/40 bg-white px-4 font-bold" onClick={retryQuote} type="button">Try again</button>
          </div>
        ) : null}

        {isLoadingQuote ? <div className="skeleton-shimmer mt-5 h-40 rounded-xl" /> : null}

        {quote ? (
          <>
            <div className="mt-5 grid gap-3">
              {quote.items.map((item) => (
                <div className="rounded-xl border border-border bg-surface-muted/70 p-3.5" key={item.variantId}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold leading-5 text-text">{item.product.name}</p>
                      <p className="mt-1 text-xs font-semibold text-text-muted">
                        {item.variant.name} / {item.requestedQuantity} x {formatCurrency(item.unitPrice, item.currency)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-text">{formatCurrency(item.lineTotal, item.currency)}</p>
                  </div>
                  {item.reason ? <p className="mt-2 text-xs font-semibold text-cta-hover">{item.reason}</p> : null}
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
                <span className="font-semibold text-text-muted">{fulfillmentMethod === "DELIVERY" ? "Delivery" : "Pickup"}</span>
                <span className="text-right font-bold text-text-muted">
                  {fulfillmentMethod === "DELIVERY" ? "Added after confirmation" : "Free"}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-3">
                <span className="text-base font-extrabold text-text">{fulfillmentMethod === "DELIVERY" ? "Items total" : "Order total"}</span>
                <span className="text-xl font-black tabular-nums text-primary">
                  {formatCurrency(quote.summary.estimatedTotal, quote.summary.currency)}
                </span>
              </div>
            </div>
          </>
        ) : null}

        <div className="mt-5 rounded-xl border border-border bg-surface-muted/70 p-3.5 text-sm leading-6 text-text-muted">
          {fulfillmentMethod === "DELIVERY"
            ? "Stock, delivery availability and any delivery fee are confirmed by our team before fulfilment."
            : "Stock is confirmed before fulfilment. Store pickup is free."}
        </div>

        {hasBlockingCartIssue ? (
          <div className="mt-5 rounded-xl border border-cta/35 bg-cta-soft p-3 text-sm font-semibold text-cta-hover" role="alert">
            Review your cart before checkout. Items must be available and within stock limits.
          </div>
        ) : null}

        <button
          className="a1-primary-button mt-5 min-h-12 w-full cursor-pointer px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted"
          disabled={isPending || hasBlockingCartIssue}
          type="submit"
        >
          {submitLabel}
        </button>
        {isPending ? (
          <span aria-disabled="true" className="mt-3 flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface-muted px-5 text-sm font-bold text-text-muted">
            Order request in progress…
          </span>
        ) : (
          <Link
            className="mt-3 flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-bold text-text transition-colors hover:border-primary/30 hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href="/cart"
          >
            Back to cart
          </Link>
        )}
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[calc(0.75rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-2.5 shadow-[0_-12px_32px_rgba(18,60,46,0.14)] lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-text-muted">{fulfillmentMethod === "DELIVERY" ? "Items total · delivery extra" : "Order total"}</p>
            <p className="text-lg font-black tabular-nums text-primary">{quote ? formatCurrency(quote.summary.estimatedTotal, quote.summary.currency) : "Updating…"}</p>
          </div>
          <button
            className="a1-primary-button min-h-12 min-w-32 shrink-0 cursor-pointer px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted"
            disabled={isPending || hasBlockingCartIssue}
            type="submit"
          >
            {mobileSubmitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
