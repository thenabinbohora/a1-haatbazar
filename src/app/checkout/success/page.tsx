import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { OrderSuccessClient } from "@/components/checkout/order-success-client";
import { formatCurrency } from "@/components/product/price";
import { STORE_CONFIG } from "@/config/store";
import { getCurrentUser } from "@/lib/auth";
import { CHECKOUT_COMPLETION_COOKIE_NAME, checkoutCompletionCookieValue } from "@/lib/checkout-completion";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Order confirmation",
  description: "Review your A1 Haat Bazar grocery order confirmation.",
  robots: { index: false },
};

type CheckoutSuccessPageProps = {
  searchParams?: Promise<{ order?: string; placed?: string }>;
};

function fulfillmentLabel(value?: string) {
  return value === "PICKUP" ? "Store pickup" : "Delivery";
}

function paymentLabel(value?: string) {
  return value === "PICKUP" ? "Pay at pickup" : "Pay on delivery";
}

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const params = await searchParams;
  const orderNumber = params?.order?.trim() ?? "";
  const completionMarker = params?.placed?.trim() ?? "";
  const [foundOrder, currentUser, cookieStore] = await Promise.all([
    orderNumber
      ? prisma.order.findUnique({
          where: { orderNumber },
          include: {
            user: { select: { name: true, email: true } },
            address: true,
            items: { orderBy: { createdAt: "asc" } },
          },
        })
      : null,
    getCurrentUser(),
    cookies(),
  ]);
  const completionCookie = cookieStore.get(CHECKOUT_COMPLETION_COOKIE_NAME)?.value;
  const hasCompletionAccess = Boolean(
    foundOrder &&
      completionMarker &&
      completionCookie === checkoutCompletionCookieValue(foundOrder.orderNumber, completionMarker),
  );
  const hasAccountAccess = Boolean(
    foundOrder && currentUser && (currentUser.role === "ADMIN" || foundOrder.userId === currentUser.id),
  );
  const order = hasCompletionAccess || hasAccountAccess ? foundOrder : null;
  const isPickup = order?.fulfillmentType === "PICKUP";
  const shouldClearCart = Boolean(order && hasCompletionAccess);

  return (
    <div className="bg-[linear-gradient(180deg,#EDF5EF_0%,#F7F6F1_32rem)]">
      <OrderSuccessClient orderNumber={order?.orderNumber ?? ""} shouldClear={shouldClearCart} />
      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12 lg:px-8">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-[0_24px_70px_rgba(18,60,46,0.1)] sm:p-8">
          <div className="text-center">
            <span className={`mx-auto grid h-14 w-14 place-items-center rounded-full text-white sm:h-16 sm:w-16 ${order ? "bg-primary shadow-[0_12px_30px_rgba(18,60,46,0.2)]" : "bg-text-muted"}`} aria-hidden="true">
              {order ? (
                <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24"><path d="m5 12 4.2 4.2L19 6.8" /></svg>
              ) : (
                <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24"><rect height="11" rx="2" width="14" x="5" y="10" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
              )}
            </span>
            <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.16em] text-fresh sm:mt-5">{order ? "Order placed" : "Order unavailable"}</p>
            <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-text sm:text-4xl">{order ? "Thank you for your order" : "We could not show this order"}</h1>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-text-muted">
              {!order
                ? "For your privacy, order details are only available to the account that placed the order or briefly after guest checkout."
                : isPickup
                ? "We will contact you when your order is packed and ready for pickup."
                : "Our team will confirm stock availability and delivery details before completing your order."}
            </p>
          </div>

          {order ? (
            <section className="mt-6 rounded-xl border border-primary/20 bg-fresh-soft p-4 sm:p-5">
              <h2 className="text-base font-extrabold text-primary">What happens next</h2>
              <ol className="mt-3 grid gap-2 text-sm font-semibold leading-6 text-primary sm:grid-cols-3">
                <li><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-white">1</span>We check stock</li>
                <li><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-white">2</span>We confirm your order</li>
                <li><span className="mr-2 inline-grid h-6 w-6 place-items-center rounded-full bg-primary text-xs text-white">3</span>{isPickup ? "We prepare pickup" : "We arrange delivery"}</li>
              </ol>
            </section>
          ) : null}

          {order ? <div className="mt-6 grid gap-5 sm:mt-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="grid gap-4">
              <section className="rounded-xl border border-border bg-surface-muted p-5">
                <h2 className="text-xl font-bold text-text">Order details</h2>
                <div className="mt-4 grid gap-3 text-sm">
                  <div className="flex flex-col items-start gap-1 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between min-[380px]:gap-4">
                    <span className="font-semibold text-text-muted">Order number</span>
                    <span className="break-all font-mono font-bold text-text">{order?.orderNumber ?? (orderNumber || "Unavailable")}</span>
                  </div>
                  <div className="flex flex-col items-start gap-1 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between min-[380px]:gap-4">
                    <span className="font-semibold text-text-muted">Fulfilment method</span>
                    <span className="font-bold text-text">{fulfillmentLabel(order?.fulfillmentType)}</span>
                  </div>
                  <div className="flex flex-col items-start gap-1 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between min-[380px]:gap-4">
                    <span className="font-semibold text-text-muted">Payment method</span>
                    <span className="font-bold text-text">{paymentLabel(order?.fulfillmentType)}</span>
                  </div>
                  <div className="flex flex-col items-start gap-1 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between min-[380px]:gap-4">
                    <span className="font-semibold text-text-muted">Payment status</span>
                    <span className="font-bold text-text">Unpaid until {isPickup ? "pickup" : "delivery"}</span>
                  </div>
                  <div className="flex flex-col items-start gap-1 border-t border-border pt-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between min-[380px]:gap-4">
                    <span className="font-semibold text-text-muted">{isPickup ? "Order total" : "Items total"}</span>
                    <span className="text-lg font-bold text-text">
                      {order ? formatCurrency(Number(order.total.toString()), order.currency) : "To be confirmed"}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-surface-muted p-5">
                <h2 className="text-xl font-bold text-text">Customer contact</h2>
                <div className="mt-3 text-sm leading-6 text-text-muted">
                  <p className="font-bold text-text">{order?.user?.name ?? "Customer"}</p>
                  <p>{order?.customerEmail ?? order?.user?.email ?? "Email unavailable"}</p>
                  {order?.customerPhone ? <p>{order.customerPhone}</p> : null}
                </div>
              </section>

              {isPickup ? (
                <section className="rounded-xl border border-primary/20 bg-fresh-soft p-5">
                  <h2 className="text-xl font-bold text-primary">Pickup instructions</h2>
                  <p className="mt-2 text-sm leading-6 text-primary">
                    Pick up from {STORE_CONFIG.storeName}. We will contact you when your order is ready.
                  </p>
                  <address className="mt-2 text-sm not-italic leading-6 text-primary">{STORE_CONFIG.address}</address>
                  <p className="text-sm leading-6 text-primary">{STORE_CONFIG.openingHours}</p>
                </section>
              ) : order?.address ? (
                <section className="rounded-xl border border-border bg-surface-muted p-5">
                  <h2 className="text-xl font-bold text-text">Delivery address</h2>
                  <div className="mt-3 text-sm leading-6 text-text-muted">
                    <p className="font-bold text-text">{order.address.fullName}</p>
                    <p>{order.address.line1}</p>
                    {order.address.line2 ? <p>{order.address.line2}</p> : null}
                    <p>
                      {order.address.suburb}, {order.address.state} {order.address.postalCode}
                    </p>
                    <p>{order.address.country}</p>
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="rounded-xl border border-border bg-surface p-5 shadow-[0_14px_38px_rgba(18,60,46,0.06)]">
              <h2 className="text-xl font-bold text-text">Order items</h2>
              <div className="mt-4 grid gap-3">
                {order?.items.length ? (
                  order.items.map((item) => (
                    <div className="rounded-xl border border-border bg-surface-muted p-3.5" key={item.id}>
                      <div className="flex flex-col gap-2 min-[380px]:flex-row min-[380px]:justify-between min-[380px]:gap-4">
                        <div className="min-w-0">
                          <p className="font-bold text-text">{item.productName}</p>
                          <p className="mt-1 text-xs font-semibold text-text-muted">
                            {item.variantName} / SKU {item.sku} / Qty {item.quantity}
                          </p>
                        </div>
                        <p className="shrink-0 font-bold text-text">{formatCurrency(Number(item.lineTotal.toString()), order.currency)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-text-muted">Order items are unavailable.</p>
                )}
              </div>
              {order ? (
                <div className="mt-5 grid gap-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-text-muted">Subtotal</span>
                    <span className="font-bold text-text">{formatCurrency(Number(order.subtotal.toString()), order.currency)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-text-muted">Discount</span>
                    <span className="font-bold text-text">{formatCurrency(Number(order.discountTotal.toString()), order.currency)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="font-semibold text-text-muted">{isPickup ? "Pickup" : "Delivery fee"}</span>
                    <span className="font-bold text-text">{isPickup ? "Free" : "Confirmed by staff"}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-border pt-3">
                    <span className="text-base font-bold text-text">{isPickup ? "Order total" : "Items total"}</span>
                    <span className="text-xl font-bold text-text">{formatCurrency(Number(order.total.toString()), order.currency)}</span>
                  </div>
                </div>
              ) : null}
              {!isPickup ? <p className="mt-3 rounded-xl bg-cta-soft px-3 py-2 text-xs font-semibold leading-5 text-cta-hover">Delivery availability and any fee are confirmed separately by our team.</p> : null}
            </aside>
          </div> : (
            <section className="mx-auto mt-6 max-w-xl rounded-xl border border-border bg-surface-muted p-5 text-center sm:mt-8">
              <h2 className="text-lg font-extrabold text-text">Need to find your order?</h2>
              <p className="mt-2 text-sm leading-6 text-text-muted">Sign in to the account used at checkout, then open your order history. Guest confirmation links expire for security.</p>
            </section>
          )}

          <div className="mt-6 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row">
            <Link
              className="a1-primary-button inline-flex min-h-12 items-center justify-center px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href="/products"
            >
              Continue shopping
            </Link>
            {order ? (
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                href="/account/orders"
              >
                View order
              </Link>
            ) : (
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                href="/login?next=%2Faccount%2Forders"
              >
                Sign in to view orders
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
