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
      <section className="border-b border-border bg-[linear-gradient(135deg,#F3EBDD_0%,#F7F6F1_55%,#EDF5EF_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-10 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-fresh">Secure checkout</p>
          <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-text sm:mt-2 sm:text-4xl">Complete your order</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted sm:mt-3 sm:text-base sm:leading-7">
            Choose free store pickup or local delivery, then review your order before placing it. No online payment is required.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-10 lg:px-8">
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
