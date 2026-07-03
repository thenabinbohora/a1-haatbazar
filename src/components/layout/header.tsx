"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand/brand-logo";
import { CartNavLink } from "@/components/cart/cart-nav-link";
import { SearchBox } from "@/components/search/search-box";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/products?sale=on", label: "Offers" },
  { href: "/category/vegetables", label: "Fresh Vegetables" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/account", label: "Account" },
];

function isActivePath(pathname: string | null, searchParams: URLSearchParams, href: string) {
  const [path, query] = href.split("?");

  if (path === "/") {
    return pathname === "/";
  }

  if (query) {
    const hrefParams = new URLSearchParams(query);

    return pathname === path && Array.from(hrefParams).every(([key, value]) => searchParams.get(key) === value);
  }

  if (path === "/products" && searchParams.get("sale") === "on") {
    return false;
  }

  return pathname === path || Boolean(pathname?.startsWith(`${path}/`));
}

function navLinkClass(isActive: boolean) {
  return [
    "relative inline-flex h-11 items-center px-1 text-sm font-semibold text-text-muted transition-colors duration-200 after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform after:duration-0 after:ease-out hover:text-primary hover:after:scale-x-100 hover:after:duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta",
    isActive ? "text-primary after:scale-x-100" : "",
  ].join(" ");
}

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const showNavbarSearch = Boolean(
    pathname?.startsWith("/products") ||
      pathname?.startsWith("/category/") ||
      pathname === "/offers" ||
      pathname === "/fresh-vegetables" ||
      pathname === "/search",
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div
          className={[
            "grid gap-2.5 xl:items-center",
            showNavbarSearch ? "xl:grid-cols-[auto_minmax(300px,1fr)_auto]" : "xl:grid-cols-[auto_1fr]",
          ].join(" ")}
        >
          <div className="flex min-h-11 items-center justify-center xl:justify-start">
            <BrandLogo />
          </div>

          {showNavbarSearch ? (
            <div className="min-w-0">
              <SearchBox variant="header" />
            </div>
          ) : null}

          <nav
            aria-label="Primary navigation"
            className={`${showNavbarSearch ? "" : "xl:justify-self-end"} hidden min-w-0 xl:block`}
          >
            <ul className="flex max-w-full items-center gap-5 xl:gap-6">
              {navItems.map((item) => (
                <li className="shrink-0" key={item.href}>
                  <Link
                    aria-current={isActivePath(pathname, searchParams, item.href) ? "page" : undefined}
                    className={navLinkClass(isActivePath(pathname, searchParams, item.href))}
                    href={item.href}
                    scroll
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="shrink-0">
                <CartNavLink />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
