"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { CartNavLink } from "@/components/cart/cart-nav-link";
import { shouldShowMobileTabBar } from "@/components/layout/mobile-tab-bar";
import { SearchBox } from "@/components/search/search-box";
import { STORE_CONFIG } from "@/config/store";

const aisleLinks = [
  { href: "/products", label: "Shop all" },
  { href: "/products?sale=on", label: "Weekly offers" },
  { href: "/category/vegetables", label: "Fresh vegetables" },
  { href: "/category/rice-and-grains", label: "Rice & grains" },
  { href: "/category/lentils-and-beans", label: "Lentils & beans" },
  { href: "/category/spices-and-masalas", label: "Spices & masalas" },
  { href: "/category/frozen-items", label: "Frozen" },
] as const;

function isActivePath(pathname: string | null, searchParams: URLSearchParams, href: string) {
  const [path, query] = href.split("?");

  if (query) {
    const hrefParams = new URLSearchParams(query);
    return pathname === path && Array.from(hrefParams).every(([key, value]) => searchParams.get(key) === value);
  }

  if (path === "/products" && searchParams.get("sale") === "on") {
    return false;
  }

  return pathname === path || Boolean(pathname?.startsWith(`${path}/`));
}

function HeaderIcon({ type }: { type: "heart" | "user" | "pin" | "clock" }) {
  const paths = {
    heart: <path d="M12 20.2 5 13a4.8 4.8 0 0 1 6.8-6.8l.2.3.2-.3A4.8 4.8 0 1 1 19 13l-7 7.2Z" />,
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s6-5.2 6-10.7a6 6 0 1 0-12 0C6 15.8 12 21 12 21Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 1.8" />
      </>
    ),
  };

  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
}

function AccountAction({ href, icon, label }: { href: string; icon: "heart" | "user"; label: string }) {
  return (
    <Link
      className="group inline-flex min-h-11 items-center gap-2 rounded-xl px-2.5 text-sm font-bold text-text-muted transition-colors hover:bg-fresh-soft hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
      href={href}
      prefetch={false}
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-muted text-primary transition-colors group-hover:bg-white">
        <HeaderIcon type={icon} />
      </span>
      <span>{label}</span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearchQuery = searchParams.get("q") ?? "";
  const isCheckoutRoute = pathname?.startsWith("/checkout");
  const isAuthRoute = pathname === "/login" || pathname === "/reset-password";
  const isCompactRoute = isCheckoutRoute || isAuthRoute;
  const hasMobileTabBar = shouldShowMobileTabBar(pathname ?? null);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface shadow-[0_8px_30px_rgba(18,60,46,0.07)] md:bg-surface/95 md:backdrop-blur-xl">
      <div className={`${isCompactRoute ? "hidden" : "hidden md:block"} bg-primary text-white`}>
        <div className="mx-auto flex min-h-8 max-w-7xl items-center justify-center gap-4 px-4 text-[11px] font-bold sm:justify-between sm:px-6 sm:text-xs lg:px-8">
          <p className="flex items-center gap-2">
            <HeaderIcon type="clock" />
            <span>{STORE_CONFIG.openingHours}</span>
          </p>
          <div className="hidden items-center gap-5 sm:flex">
            <span>Free Salisbury store pickup</span>
            <span className="h-3 w-px bg-white/25" />
            <a className="inline-flex items-center gap-1.5 rounded-sm text-emerald-50 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" href={STORE_CONFIG.directionsUrl} rel="noopener noreferrer" target="_blank">
              <HeaderIcon type="pin" />
              Get directions
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center gap-3 md:h-auto md:min-h-[4.5rem] md:py-2.5 lg:gap-5">
          <div className="shrink-0">
            <BrandLogo />
          </div>
          <div className={`${isCompactRoute ? "hidden" : "hidden md:block"} min-w-0 flex-1`}>
            <SearchBox initialQuery={currentSearchQuery} key={`desktop-search-${currentSearchQuery}`} placeholder="Search rice, masala, noodles, tea and more" variant="header" />
          </div>
          <nav aria-label="Customer shortcuts" className={`${isCompactRoute ? "hidden" : "ml-auto hidden shrink-0 items-center gap-1 xl:flex"}`}>
            <AccountAction href="/wishlist" icon="heart" label="Wishlist" />
            <AccountAction href="/account" icon="user" label="Account" />
          </nav>
          {isCompactRoute ? (
            <span className="ml-auto text-xs font-extrabold uppercase tracking-[0.12em] text-primary sm:text-sm">
              <span className="sm:hidden">{isCheckoutRoute ? "Secure" : "Account"}</span>
              <span className="hidden sm:inline">{isCheckoutRoute ? "Secure checkout" : "Customer account"}</span>
            </span>
          ) : (
            <div className={hasMobileTabBar ? "ml-auto hidden xl:block" : "ml-auto"}>
              <CartNavLink />
            </div>
          )}
        </div>

        <div className={`${isCompactRoute ? "hidden" : "pb-2 md:hidden"}`}>
          <SearchBox initialQuery={currentSearchQuery} key={`mobile-search-${currentSearchQuery}`} placeholder="Search groceries" variant="header" />
        </div>
      </div>

      <nav aria-label="Shop departments" className={`${isCompactRoute ? "hidden" : "hidden border-t border-border/80 md:block"}`}>
        <div className="a1-no-scrollbar mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-6 py-1.5 lg:px-8">
          {aisleLinks.map((item) => {
            const isActive = isActivePath(pathname, searchParams, item.href);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={[
                  "shrink-0 rounded-full px-3.5 py-2 text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cta",
                  isActive ? "bg-primary text-white" : "text-text-muted hover:bg-fresh-soft hover:text-primary",
                ].join(" ")}
                href={item.href}
                key={item.href}
                prefetch={false}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
