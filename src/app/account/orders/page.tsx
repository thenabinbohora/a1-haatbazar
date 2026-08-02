import type { Metadata } from "next";
import Link from "next/link";
import { AccountIcon } from "@/components/account/account-icons";
import { CustomerAccountShell } from "@/components/account/customer-account-shell";
import { AccountOrderRow } from "@/components/account/order-ui";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "My orders",
  description: "Review your A1 Haat Bazar grocery orders.",
  robots: { index: false },
};

const PAGE_SIZE = 10;

type AccountOrdersPageProps = {
  searchParams?: Promise<{ page?: string }>;
};

function pageNumber(value?: string) {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function AccountOrdersPage({
  searchParams,
}: AccountOrdersPageProps) {
  const user = await requireCustomer("/account/orders");
  const params = await searchParams;
  const requestedPage = pageNumber(params?.page);
  const orderCount = await prisma.order.count({ where: { userId: user.id } });
  const totalPages = Math.max(1, Math.ceil(orderCount / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const orders = await prisma.order.findMany({
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
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    where: { userId: user.id },
  });

  return (
    <CustomerAccountShell
      description="Review fulfilment progress, totals and items from your grocery orders."
      title="Your orders"
      user={user}
    >
      {orders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-10">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-fresh-soft text-primary">
            <AccountIcon className="h-6 w-6" name="orders" />
          </span>
          <h2 className="mt-4 text-xl font-black text-text">No orders yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
            Your completed and active grocery orders will appear here after
            checkout.
          </p>
          <Link
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href="/products"
          >
            <AccountIcon className="h-4.5 w-4.5" name="bag" />
            Start shopping
          </Link>
        </section>
      ) : (
        <section aria-labelledby="order-history-title">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                className="text-xl font-black text-text"
                id="order-history-title"
              >
                Order history
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                {orderCount} {orderCount === 1 ? "order" : "orders"}
              </p>
            </div>
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-extrabold text-text transition-colors hover:border-primary/25 hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href="/products"
            >
              <AccountIcon className="h-4.5 w-4.5" name="bag" />
              Shop groceries
            </Link>
          </div>
          <div className="grid gap-3">
            {orders.map((order) => (
              <AccountOrderRow key={order.id} order={order} />
            ))}
          </div>

          {totalPages > 1 ? (
            <nav
              aria-label="Order history pages"
              className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3"
            >
              {currentPage > 1 ? (
                <Link
                  className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-extrabold text-primary hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href={`/account/orders?page=${currentPage - 1}`}
                >
                  <AccountIcon className="h-4 w-4" name="arrow-left" />
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm font-bold text-text-muted">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link
                  className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-extrabold text-primary hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href={`/account/orders?page=${currentPage + 1}`}
                >
                  Next
                  <AccountIcon className="h-4 w-4" name="arrow-right" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </section>
      )}
    </CustomerAccountShell>
  );
}
