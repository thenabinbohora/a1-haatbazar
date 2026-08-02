import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart/cart-page-client";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review grocery cart items, quantities, subtotal, and estimated total.",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-[linear-gradient(135deg,#F3EBDD_0%,#F7F6F1_55%,#EDF5EF_100%)]">
        <div className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-fresh">Your basket</p>
          <h1 className="mt-1 text-[28px] font-black leading-tight tracking-tight text-text sm:text-3xl">Your cart</h1>
          <p className="mt-1.5 text-sm leading-5 text-text-muted sm:text-base">Review quantities and pack sizes before checkout.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <CartPageClient />
      </section>
    </div>
  );
}
