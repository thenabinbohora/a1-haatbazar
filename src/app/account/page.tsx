import Link from "next/link";
import { customerLogoutAction } from "@/app/login/actions";
import { AccountNav } from "@/components/account/account-nav";
import { formatCurrency } from "@/components/product/price";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AccountPage() {
  const user = await requireCustomer();
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
    <div className="bg-background">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-fresh">Account</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-text sm:text-4xl">Welcome, {user.name ?? user.email}</h1>
            <p className="mt-2 text-sm text-text-muted">{user.email}</p>
          </div>
          <form action={customerLogoutAction}>
            <button className="min-h-11 cursor-pointer rounded-md border border-border bg-surface px-4 text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" type="submit">
              Sign out
            </button>
          </form>
        </div>
        <AccountNav />
        <div className="grid gap-5 lg:grid-cols-4">
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-text">Recent orders</h2>
                <p className="mt-1 text-sm text-text-muted">Your first order will appear here.</p>
              </div>
              <Link className="rounded-md border border-border px-3 py-2 text-sm font-bold text-text transition-colors hover:bg-surface-muted" href="/products">
                Shop again
              </Link>
            </div>
            <div className="mt-4 grid gap-3">
              {orders.length ? orders.map((order) => (
                <Link className="rounded-md border border-border bg-surface-muted p-4 transition-colors hover:border-cta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" href="/account/orders" key={order.id}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-text">{order.orderNumber}</p>
                      <p className="text-sm text-text-muted">
                        {order.fulfillmentType === "PICKUP" ? "Store pickup" : "Delivery"} / {order.status.replaceAll("_", " ")} / {order.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-bold text-text">{formatCurrency(Number(order.total.toString()), order.currency)}</p>
                  </div>
                </Link>
              )) : <div className="rounded-md border border-border bg-surface-muted p-4 text-sm text-text-muted">No orders yet. When you place your first order, it will appear here.</div>}
            </div>
          </section>
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-xl font-bold text-text">Saved items</h2>
            <p className="mt-3 text-3xl font-bold text-text">{wishlistCount}</p>
            <p className="mt-2 text-sm text-text-muted">Save your favourite groceries and find them quickly next time.</p>
            <Link className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta" href="/wishlist">View wishlist</Link>
          </section>
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <h2 className="text-xl font-bold text-text">Account details</h2>
            <p className="mt-3 text-sm font-semibold text-text">{user.name ?? "Customer"}</p>
            <p className="text-sm text-text-muted">{user.email}</p>
            <Link className="mt-4 inline-flex rounded-md border border-border px-4 py-2 text-sm font-semibold text-text hover:bg-surface-muted" href="/account/addresses">Add address</Link>
          </section>
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm lg:col-span-4">
            <h2 className="text-xl font-bold text-text">Delivery addresses</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {addresses.length ? addresses.map((address) => (
                <div className="rounded-md border border-border bg-surface-muted p-4" key={address.id}>
                  <p className="font-semibold text-text">{address.label ?? "Delivery address"} {address.isDefault ? "(Default)" : ""}</p>
                  <p className="mt-1 text-sm text-text-muted">{address.line1}, {address.suburb}, {address.state} {address.postalCode}</p>
                </div>
              )) : <p className="text-sm text-text-muted">No saved addresses yet.</p>}
            </div>
            <Link className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta" href="/account/addresses">Manage addresses</Link>
          </section>
        </div>
      </section>
    </div>
  );
}
