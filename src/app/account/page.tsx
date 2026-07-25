import type { Metadata } from "next";
import Link from "next/link";
import { customerLogoutAction } from "@/app/login/actions";

export const metadata: Metadata = {
  title: "My account",
  description: "Manage your A1 Haat Bazar account, orders, addresses, and wishlist.",
  robots: { index: false },
};
import { AccountNav } from "@/components/account/account-nav";
import { formatCurrency } from "@/components/product/price";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const user = await requireCustomer();
  const displayName = user.name?.trim() || "there";
  const [orders, addresses, wishlistCount] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, orderNumber: true, status: true, fulfillmentType: true, total: true, currency: true, createdAt: true },
    }),
    prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }], take: 2 }),
    prisma.wishlist.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="min-h-dvh bg-background">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
        <div className="relative mb-5 overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-fresh-soft" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-fresh">Your account</p>
              <h1 className="mt-2 max-w-3xl text-3xl font-black leading-tight tracking-tight text-text sm:text-4xl">
                Welcome back, <span className="break-words [overflow-wrap:anywhere]">{displayName}</span>
              </h1>
              <p className="mt-2 break-words text-sm font-medium text-text-muted [overflow-wrap:anywhere]">{user.email}</p>
            </div>
            <form action={customerLogoutAction}>
              <button className="min-h-11 cursor-pointer rounded-xl border border-border bg-background px-4 text-sm font-bold text-text transition-colors hover:border-primary/30 hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <AccountNav />
        <div className="grid gap-4 sm:gap-5 lg:grid-cols-4">
          <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6 lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">Purchases</p>
                <h2 className="mt-1 text-xl font-black text-text">Recent orders</h2>
                <p className="mt-1 text-sm leading-6 text-text-muted">Review your latest grocery orders and fulfilment status.</p>
              </div>
              <Link className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold text-text transition-colors hover:border-primary/30 hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" href="/products">
                Shop again
              </Link>
            </div>
            <div className="mt-4 grid gap-3">
              {orders.length ? orders.map((order) => (
                <Link className="rounded-xl border border-border bg-background p-4 transition-[border-color,background-color,box-shadow] hover:border-primary/30 hover:bg-surface-muted hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" href="/account/orders" key={order.id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words font-bold text-text [overflow-wrap:anywhere]">{order.orderNumber}</p>
                      <p className="mt-1 text-sm leading-5 text-text-muted">
                        {order.fulfillmentType === "PICKUP" ? "Store pickup" : "Delivery"} / {order.status.replaceAll("_", " ")} / {order.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <p className="shrink-0 text-lg font-black tabular-nums text-primary">{formatCurrency(Number(order.total.toString()), order.currency)}</p>
                  </div>
                </Link>
              )) : <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm leading-6 text-text-muted">No orders yet. Your first grocery order will appear here.</div>}
            </div>
          </section>
          <section className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">Wishlist</p>
            <h2 className="mt-1 text-xl font-black text-text">Saved items</h2>
            <p className="mt-4 text-4xl font-black tabular-nums text-primary">{wishlistCount}</p>
            <p className="mt-2 text-sm leading-6 text-text-muted">Keep favourite groceries ready for your next shop.</p>
            <Link className="mt-auto inline-flex min-h-11 w-fit items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" href="/wishlist">View wishlist</Link>
          </section>
          <section className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">Profile</p>
            <h2 className="mt-1 text-xl font-black text-text">Account details</h2>
            <div className="mt-4 rounded-xl border border-border bg-background p-4">
              <p className="font-bold text-text">{user.name ?? "Customer"}</p>
              <p className="mt-1 break-all text-sm text-text-muted">{user.email}</p>
            </div>
            <Link className="mt-auto inline-flex min-h-11 w-fit items-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-bold text-text transition-colors hover:border-primary/30 hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" href="/account/addresses">Manage addresses</Link>
          </section>
          <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6 lg:col-span-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">Delivery</p>
                <h2 className="mt-1 text-xl font-black text-text">Saved addresses</h2>
              </div>
              <Link className="inline-flex min-h-11 w-fit items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" href="/account/addresses">Manage addresses</Link>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {addresses.length ? addresses.map((address) => (
                <div className="rounded-xl border border-border bg-background p-4" key={address.id}>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-text">{address.label ?? "Delivery address"}</p>
                    {address.isDefault ? <span className="rounded-full border border-fresh/25 bg-fresh-soft px-2 py-0.5 text-xs font-bold text-fresh">Default</span> : null}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-text-muted">{address.line1}, {address.suburb}, {address.state} {address.postalCode}</p>
                </div>
              )) : <div className="rounded-xl border border-dashed border-border bg-background p-5 text-sm leading-6 text-text-muted md:col-span-2">No saved addresses yet. Add one to make delivery checkout faster.</div>}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
