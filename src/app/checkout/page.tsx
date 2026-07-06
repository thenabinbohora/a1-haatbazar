import type { Metadata } from "next";
import { CheckoutPageClient } from "@/components/checkout/checkout-page-client";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Choose delivery or store pickup and place your A1 Haat Bazar grocery order.",
  robots: { index: false },
};

type CheckoutPageProps = {
  searchParams?: Promise<{ coupon?: string }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const [params, currentUser] = await Promise.all([searchParams, getCurrentUser()]);
  const customer = currentUser
    ? await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
          name: true,
          email: true,
          phone: true,
          addresses: {
            orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
            take: 1,
            select: {
              fullName: true,
              phone: true,
              line1: true,
              line2: true,
              suburb: true,
              state: true,
              postalCode: true,
              country: true,
            },
          },
        },
      })
    : null;

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase text-fresh">Secure checkout</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-text sm:text-4xl">Checkout</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-text-muted">
            Choose delivery or pickup. Prices and stock are checked before your order is confirmed.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CheckoutPageClient
          customer={
            customer
              ? {
                  name: customer.name,
                  email: customer.email,
                  phone: customer.phone,
                  address: customer.addresses[0] ?? null,
                }
              : null
          }
          initialCouponCode={params?.coupon ?? ""}
        />
      </section>
    </div>
  );
}
