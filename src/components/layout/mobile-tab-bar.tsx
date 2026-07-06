"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cart-store";
import { useCartDrawer } from "@/store/cart-drawer-store";

export function shouldShowMobileTabBar(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  // Product detail has its own sticky buy bar; checkout keeps a distraction-free funnel.
  if (/^\/products\/[^/]+$/.test(pathname) || pathname.startsWith("/checkout")) {
    return false;
  }

  return true;
}

function TabIcon({ type }: { type: "home" | "shop" | "wishlist" | "account" }) {
  const paths = {
    home: (
      <>
        <path d="M4.5 10.2 12 4l7.5 6.2V19a1.5 1.5 0 0 1-1.5 1.5h-4v-5.4h-4v5.4H6A1.5 1.5 0 0 1 4.5 19v-8.8Z" />
      </>
    ),
    shop: (
      <>
        <path d="M4.5 9.5h15l-1.3 9.1a2 2 0 0 1-2 1.7H7.8a2 2 0 0 1-2-1.7L4.5 9.5Z" />
        <path d="M8.6 12.4V7.3a3.4 3.4 0 0 1 6.8 0v5.1" />
      </>
    ),
    wishlist: (
      <path d="M12 20.3 4.9 13a4.9 4.9 0 0 1 0-6.9 4.7 4.7 0 0 1 6.8 0l.3.4.3-.4a4.7 4.7 0 0 1 6.8 0 4.9 4.9 0 0 1 0 6.9L12 20.3Z" />
    ),
    account: (
      <>
        <path d="M12 11.6a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z" />
        <path d="M5 20.1a7 7 0 0 1 14 0" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
}

function CartTabIcon() {
  return (
    <svg aria-hidden="true" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
      <path d="M3.75 5.25h2.4l1.55 9.15a2 2 0 0 0 1.98 1.66h7.62a2 2 0 0 0 1.94-1.52l1.12-4.54H7.02" />
      <path d="M9.6 20.05h.01" />
      <path d="M17.35 20.05h.01" />
    </svg>
  );
}

const tabs = [
  { href: "/", icon: "home", label: "Home" },
  { href: "/products", icon: "shop", label: "Shop" },
  { href: "__cart__", icon: "cart", label: "Cart" },
  { href: "/wishlist", icon: "wishlist", label: "Wishlist" },
  { href: "/account", icon: "account", label: "Account" },
] as const;

function tabClass(isActive: boolean) {
  return [
    "flex h-full min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 text-[11px] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta",
    isActive ? "text-primary" : "text-text-muted hover:text-primary",
  ].join(" ");
}

function iconWrapClass(isActive: boolean) {
  return [
    "grid h-7 w-14 place-items-center rounded-full transition-colors duration-200",
    isActive ? "bg-fresh-soft" : "bg-transparent",
  ].join(" ");
}

export function MobileTabBar() {
  const pathname = usePathname();
  const { itemCount, isReady } = useCart();
  const { open } = useCartDrawer();
  const count = isReady ? itemCount : 0;

  if (!shouldShowMobileTabBar(pathname)) {
    return null;
  }

  const isActive = (href: string) => (href === "/" ? pathname === "/" : Boolean(pathname?.startsWith(href)));

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(15,46,26,0.08)] backdrop-blur xl:hidden"
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch">
        {tabs.map((tab) =>
          tab.href === "__cart__" ? (
            <button
              aria-label="Open shopping cart"
              className={tabClass(false)}
              key={tab.label}
              onClick={open}
              type="button"
            >
              <span className={iconWrapClass(false)}>
                <span className="relative">
                  <CartTabIcon />
                  <span
                    className={[
                      "absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-primary/15 bg-cta-soft px-1 text-[10px] font-black leading-none text-primary shadow-[0_2px_6px_rgba(6,61,22,0.16)]",
                      count > 0 ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                    suppressHydrationWarning
                  >
                    {count}
                  </span>
                </span>
              </span>
              {tab.label}
            </button>
          ) : (
            <Link
              aria-current={isActive(tab.href) ? "page" : undefined}
              className={tabClass(isActive(tab.href))}
              href={tab.href}
              key={tab.label}
              prefetch={false}
            >
              <span className={iconWrapClass(isActive(tab.href))}>
                <TabIcon type={tab.icon as "home" | "shop" | "wishlist" | "account"} />
              </span>
              {tab.label}
            </Link>
          ),
        )}
      </div>
    </nav>
  );
}
