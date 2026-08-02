import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AccountIcon } from "@/components/account/account-icons";
import { CustomerAccountShell } from "@/components/account/customer-account-shell";
import { AccountOrderRow } from "@/components/account/order-ui";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { formatCurrency } from "@/components/product/price";
import { BUSINESS_CONFIG } from "@/config/business";
import { requireCustomer } from "@/lib/auth";
import {
  addressLocalitySummary,
  customerGreeting,
  isActiveOrder,
} from "@/lib/customer-account";
import { customerImageUrl } from "@/lib/customer-images";
import {
  customerImageAlt,
  customerProductName,
} from "@/lib/display";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "My account",
  description:
    "Manage your A1 Haat Bazar account, orders, addresses, and wishlist.",
  robots: { index: false },
};

async function getOrderOverview(userId: string) {
  const [count, recentOrders, statusCounts] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        _count: { select: { items: true } },
        createdAt: true,
        currency: true,
        fulfillmentType: true,
        id: true,
        orderNumber: true,
        status: true,
        total: true,
      },
      take: 3,
      where: { userId },
    }),
    prisma.order.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
  ]);

  return {
    activeCount: statusCounts
      .filter((entry) => isActiveOrder(entry.status))
      .reduce((total, entry) => total + entry._count._all, 0),
    count,
    recentOrders,
  };
}

async function getWishlistOverview(userId: string) {
  const [count, items] = await Promise.all([
    prisma.wishlist.count({ where: { userId } }),
    prisma.wishlist.findMany({
      include: {
        product: {
          include: {
            category: { select: { name: true } },
            images: {
              orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
              take: 1,
            },
            variants: {
              orderBy: { price: "asc" },
              take: 1,
              where: { status: "ACTIVE" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      where: { userId },
    }),
  ]);

  return { count, items };
}

async function getAddressOverview(userId: string) {
  const [count, addresses] = await Promise.all([
    prisma.address.count({ where: { type: "SHIPPING", userId } }),
    prisma.address.findMany({
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        isDefault: true,
        label: true,
        postalCode: true,
        state: true,
        suburb: true,
      },
      take: 1,
      where: { type: "SHIPPING", userId },
    }),
  ]);

  return { address: addresses[0] ?? null, count };
}

function SectionUnavailable({ children }: { children: string }) {
  return (
    <div
      className="rounded-xl border border-warning/25 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-warning"
      role="status"
    >
      {children}
    </div>
  );
}

export default async function AccountPage() {
  const user = await requireCustomer();
  const [ordersResult, wishlistResult, addressesResult] =
    await Promise.allSettled([
      getOrderOverview(user.id),
      getWishlistOverview(user.id),
      getAddressOverview(user.id),
    ]);
  const orders =
    ordersResult.status === "fulfilled" ? ordersResult.value : null;
  const wishlist =
    wishlistResult.status === "fulfilled" ? wishlistResult.value : null;
  const addresses =
    addressesResult.status === "fulfilled" ? addressesResult.value : null;

  return (
    <CustomerAccountShell
      description="Manage your orders, delivery details and saved groceries."
      isOverview
      title={customerGreeting(user.name)}
      user={user}
    >
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.85fr)]">
        <section className="min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-fresh">
                Purchases
              </p>
              <h2 className="mt-1 text-xl font-black text-text">
                Recent orders
              </h2>
              <p className="mt-1 text-sm leading-6 text-text-muted">
                {orders
                  ? orders.activeCount > 0
                    ? `${orders.activeCount} active ${
                        orders.activeCount === 1 ? "order" : "orders"
                      }`
                    : orders.count > 0
                      ? `${orders.count} ${
                          orders.count === 1 ? "order" : "orders"
                        } in your history`
                      : "Your grocery orders will appear here."
                  : "Your order summary is temporarily unavailable."}
              </p>
            </div>
            <Link
              className="inline-flex min-h-11 items-center gap-1 rounded-xl px-2 text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href="/account/orders"
            >
              View all orders
              <AccountIcon className="h-4 w-4" name="arrow-right" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {!orders ? (
              <SectionUnavailable>
                Recent orders could not be loaded. Refresh the page to try again.
              </SectionUnavailable>
            ) : orders.recentOrders.length ? (
              orders.recentOrders.map((order) => (
                <AccountOrderRow key={order.id} order={order} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fresh-soft text-primary">
                    <AccountIcon className="h-5 w-5" name="orders" />
                  </span>
                  <div>
                    <h3 className="font-black text-text">No orders yet</h3>
                    <p className="mt-1 text-sm leading-6 text-text-muted">
                      Your completed and active grocery orders will appear here.
                    </p>
                    <Link
                      className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                      href="/products"
                    >
                      Start shopping
                      <AccountIcon className="h-4 w-4" name="arrow-right" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="grid min-w-0 gap-5">
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-fresh">
                  Saved groceries
                </p>
                <h2 className="mt-1 text-lg font-black text-text">Wishlist</h2>
              </div>
              {wishlist && wishlist.count > 0 ? (
                <span className="rounded-full border border-fresh/20 bg-fresh-soft px-2.5 py-1 text-xs font-extrabold text-fresh">
                  {wishlist.count} saved
                </span>
              ) : null}
            </div>

            <div className="mt-4">
              {!wishlist ? (
                <SectionUnavailable>
                  Saved items are temporarily unavailable. Refresh to try again.
                </SectionUnavailable>
              ) : wishlist.items.length ? (
                <>
                  <div className="grid grid-cols-3 gap-2.5">
                    {wishlist.items.map((item) => {
                      const image = item.product.images.find((candidate) =>
                        customerImageUrl(candidate.url),
                      );
                      const variant = item.product.variants[0];
                      const price = variant
                        ? Number(
                            (
                              variant.salePrice ?? variant.price
                            ).toString(),
                          )
                        : null;

                      return (
                        <Link
                          className="group min-w-0 rounded-xl border border-border bg-background p-2 transition-colors hover:border-primary/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                          href={`/products/${item.product.slug}`}
                          key={item.id}
                        >
                          <span className="relative block aspect-square overflow-hidden rounded-lg bg-surface-muted">
                            {customerImageUrl(image?.url) ? (
                              <Image
                                alt={customerImageAlt(
                                  image?.altText,
                                  item.product.name,
                                )}
                                className="object-contain p-1.5"
                                fill
                                sizes="110px"
                                src={customerImageUrl(image?.url) ?? ""}
                              />
                            ) : (
                              <ProductImagePlaceholder
                                compact
                                category={item.product.category.name}
                                name={item.product.name}
                              />
                            )}
                          </span>
                          <span className="mt-2 line-clamp-2 block text-xs font-bold leading-4 text-text group-hover:text-primary">
                            {customerProductName(item.product.name)}
                          </span>
                          {variant && price !== null ? (
                            <span className="mt-1 block text-xs font-black tabular-nums text-primary">
                              {formatCurrency(price, variant.currency)}
                            </span>
                          ) : (
                            <span className="mt-1 block text-[0.6875rem] font-bold text-text-muted">
                              Unavailable
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                  <Link
                    className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                    href="/wishlist"
                  >
                    View all saved items
                    <AccountIcon className="h-4 w-4" name="arrow-right" />
                  </Link>
                </>
              ) : (
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fresh-soft text-primary">
                    <AccountIcon className="h-5 w-5" name="heart" />
                  </span>
                  <div>
                    <h3 className="font-black text-text">
                      Save groceries for later
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-text-muted">
                      Tap the heart on any product to keep it here.
                    </p>
                    <Link
                      className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                      href="/products"
                    >
                      Browse groceries
                      <AccountIcon className="h-4 w-4" name="arrow-right" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.13em] text-fresh">
                  Delivery readiness
                </p>
                <h2 className="mt-1 text-lg font-black text-text">
                  Saved address
                </h2>
              </div>
              <AccountIcon className="h-5 w-5 text-fresh" name="address" />
            </div>
            <div className="mt-4">
              {!addresses ? (
                <SectionUnavailable>
                  Saved addresses are temporarily unavailable. Refresh to try
                  again.
                </SectionUnavailable>
              ) : addresses.address ? (
                <>
                  <p className="font-black text-text">
                    {addresses.address.label || "Delivery address"}
                    {addresses.address.isDefault ? (
                      <span className="ml-2 align-middle text-xs font-extrabold text-fresh">
                        Default
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-text-muted">
                    {addressLocalitySummary(addresses.address)}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {addresses.count} saved{" "}
                    {addresses.count === 1 ? "address" : "addresses"}
                  </p>
                  <Link
                    className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                    href="/account/addresses"
                  >
                    View delivery details
                    <AccountIcon className="h-4 w-4" name="arrow-right" />
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="font-black text-text">
                    No delivery address saved
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-text-muted">
                    Add one now to speed up checkout.
                  </p>
                  <Link
                    className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                    href="/account/addresses#add-address"
                  >
                    Add address
                    <AccountIcon className="h-4 w-4" name="arrow-right" />
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fresh-soft text-primary">
              <AccountIcon className="h-5 w-5" name="security" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-black text-text">
                Profile and security
              </h2>
              {user.name?.trim() ? (
                <p className="mt-1 break-words text-sm leading-6 text-text-muted [overflow-wrap:anywhere]">
                  {user.name}
                </p>
              ) : (
                <p className="mt-1 text-sm font-bold text-warning">
                  Complete your profile to personalise your account.
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                <Link
                  className="inline-flex min-h-11 items-center text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href="/account/profile"
                >
                  Edit profile
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href="/account/security"
                >
                  Security
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-5"
          id="account-help"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fresh-soft text-primary">
              <AccountIcon className="h-5 w-5" name="help" />
            </span>
            <div>
              <h2 className="text-lg font-black text-text">Help and support</h2>
              <p className="mt-1 text-sm leading-6 text-text-muted">
                Get help with an order, delivery, pickup or product question.
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                <a
                  className="inline-flex min-h-11 items-center text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href={`mailto:${BUSINESS_CONFIG.publicEmail}`}
                >
                  Contact store
                </a>
                <Link
                  className="inline-flex min-h-11 items-center text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href="/delivery-pickup"
                >
                  Delivery and pickup
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href="/returns-refunds"
                >
                  Returns
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </CustomerAccountShell>
  );
}
