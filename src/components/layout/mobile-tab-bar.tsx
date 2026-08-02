"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { isUnmodifiedPrimaryClick, scrollDocumentToTop } from "@/lib/client-navigation";
import { useCart } from "@/store/cart-store";
import { useCartDrawer } from "@/store/cart-drawer-store";

export function shouldShowMobileTabBar(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  // Product detail has its own sticky buy bar; checkout keeps a distraction-free funnel.
  if (
    /^\/products\/[^/]+$/.test(pathname) ||
    pathname.startsWith("/checkout") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  ) {
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
    "grid h-7 w-12 place-items-center rounded-full transition-colors duration-200",
    isActive ? "bg-primary text-white shadow-sm" : "bg-transparent",
  ].join(" ");
}

export function MobileTabBar() {
  const pathname = usePathname();
  const { itemCount, isReady } = useCart();
  const { open } = useCartDrawer();
  const count = isReady ? itemCount : 0;
  const displayCount = count > 9 ? "9+" : count;

  if (!shouldShowMobileTabBar(pathname)) {
    return null;
  }

  const isShopRoute =
    pathname === "/products" ||
    pathname === "/categories" ||
    pathname === "/offers" ||
    pathname === "/featured" ||
    pathname === "/best-sellers" ||
    Boolean(pathname?.startsWith("/category/")) ||
    pathname === "/search";
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    if (href === "/products") {
      return isShopRoute;
    }

    return Boolean(pathname?.startsWith(href));
  };
  const isCartActive = pathname?.startsWith("/cart") ?? false;

  function handleActiveTopLevelTab(event: MouseEvent<HTMLAnchorElement>, href: string) {
    const isExactActiveTab = (href === "/" && pathname === "/") || (href === "/products" && pathname === "/products");

    if (
      !isExactActiveTab ||
      window.location.search ||
      window.location.hash ||
      !isUnmodifiedPrimaryClick(event)
    ) {
      return;
    }

    event.preventDefault();
    scrollDocumentToTop({ smooth: href === "/" });
  }

  return (
    <nav
      aria-label="Bottom navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[var(--z-layer-bottom-nav)] pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))] xl:hidden"
    >
      <div className="pointer-events-auto mx-auto flex h-[3.75rem] max-w-xl items-stretch rounded-2xl border border-border bg-surface/96 px-1 shadow-[0_14px_42px_rgba(18,60,46,0.18)] backdrop-blur-xl">
        {tabs.map((tab) =>
          tab.href === "__cart__" ? (
            <button
              aria-current={isCartActive ? "page" : undefined}
              aria-label={`Cart, ${count} ${count === 1 ? "item" : "items"}`}
              className={tabClass(isCartActive)}
              key={tab.label}
              onClick={open}
              type="button"
            >
              <span className={isCartActive ? iconWrapClass(true) : "grid h-7 w-12 place-items-center rounded-full bg-cta-soft text-primary"}>
                <span className="relative">
                  <CartTabIcon />
                  {count > 0 ? (
                    <span
                      aria-hidden="true"
                      className="absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-primary/15 bg-cta-soft px-1 text-[10px] font-black leading-none text-primary shadow-[0_2px_8px_rgba(18,60,46,0.18)]"
                    >
                      {displayCount}
                    </span>
                  ) : null}
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
              onClick={(event) => handleActiveTopLevelTab(event, tab.href)}
              prefetch={false}
              scroll
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
