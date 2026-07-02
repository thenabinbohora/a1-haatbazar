import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { STORE_CONFIG } from "@/config/store";
import { SUPPORT_EMAIL } from "@/lib/constants";

const shoppingLinks = [
  { href: "/products", label: "Shop groceries" },
  { href: "/products?sale=on", label: "Weekly offers" },
  { href: "/products?sort=popular", label: "Best sellers" },
  { href: "/category/vegetables", label: "Fresh vegetables" },
  { href: "/wishlist", label: "Wishlist" },
];

const supportLinks = [
  { href: "/account", label: "My account" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/cart", label: "Cart" },
];

export function Footer() {
  return (
    <footer className="border-t border-primary-muted bg-primary-muted text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.7fr_0.7fr_0.9fr] lg:px-8">
        <div>
          <BrandLogo display="full" variant="dark" />
          <p className="mt-4 max-w-xl text-sm leading-6 text-emerald-50/80">
            Authentic Nepali groceries, Indian and Asian pantry essentials, fresh vegetables, frozen items, spices,
            rice, lentils, snacks, beverages, and weekly offers.
          </p>
          <div className="mt-4 grid gap-2 text-sm font-semibold text-emerald-50/90">
            <p>Fresh stock updated regularly</p>
            <p>Local delivery and store pickup</p>
            <p>{STORE_CONFIG.paymentMessage}</p>
          </div>
        </div>

        <nav aria-label="Footer shopping links">
          <p className="text-sm font-semibold uppercase text-emerald-100">Shop</p>
          <ul className="mt-3 space-y-2 text-sm text-emerald-50/80">
            {shoppingLinks.map((link) => (
              <li key={link.href}>
                <Link
                  className="rounded-sm transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer customer links">
          <p className="text-sm font-semibold uppercase text-emerald-100">Customer support</p>
          <ul className="mt-3 space-y-2 text-sm text-emerald-50/80">
            {supportLinks.map((link) => (
              <li key={link.href}>
                <Link
                  className="rounded-sm transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold uppercase text-emerald-100">Store promise</p>
          <div className="mt-3 space-y-3 text-sm leading-6 text-emerald-50/80">
            <p>Prices and stock are checked before your order is confirmed.</p>
            <p>{STORE_CONFIG.deliveryMessage} Pickup is free.</p>
            <p>Contact: {SUPPORT_EMAIL}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
