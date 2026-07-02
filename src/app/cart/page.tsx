import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/cart-page-client";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review grocery cart items, quantities, subtotal, and estimated total.",
};

export default function CartPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase text-fresh">Guest cart</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-text sm:text-4xl">Your grocery cart</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-text-muted">
            Adjust quantities, apply a coupon, and choose delivery or pickup when you checkout.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CartPageClient />
      </section>
    </div>
  );
}
