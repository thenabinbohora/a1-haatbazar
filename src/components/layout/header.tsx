"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { CartNavLink } from "@/components/cart/cart-nav-link";

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
      pathname === "/fresh-vegetables",
  );
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLElement | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchFormRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (menuRef.current?.contains(target) || menuButtonRef.current?.contains(target) || searchFormRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    const scrollOptions = { passive: true };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, scrollOptions);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div
          className={[
            "grid gap-3 xl:items-center",
            showNavbarSearch ? "xl:grid-cols-[auto_minmax(300px,1fr)_auto]" : "xl:grid-cols-[auto_1fr]",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-3">
            <BrandLogo />
            <div className="flex items-center gap-2 xl:hidden">
              <CartNavLink />
              <button
                aria-controls="mobile-menu"
                aria-expanded={isOpen}
                className="inline-flex h-11 w-11 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-border bg-surface text-primary transition-colors hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                onClick={() => setIsOpen((value) => !value)}
                ref={menuButtonRef}
                type="button"
              >
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="h-0.5 w-5 rounded-full bg-current" />
                <span className="sr-only">Toggle menu</span>
              </button>
            </div>
          </div>

          {showNavbarSearch ? (
            <form action="/search" className="min-w-0" onSubmit={() => setIsOpen(false)} ref={searchFormRef} role="search">
              <label className="sr-only" htmlFor="site-search">
                Search groceries
              </label>
              <div className="flex w-full min-w-0 rounded-lg border border-border bg-surface-muted p-1 shadow-inner">
                <input
                  className="min-h-11 min-w-0 flex-1 rounded-md border border-transparent bg-white px-3 text-sm text-text placeholder:text-text-muted focus:border-cta"
                  id="site-search"
                  name="q"
                  placeholder="Search rice, masala, noodles, tea"
                  type="search"
                />
                <button
                  className="a1-primary-button cursor-pointer px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  type="submit"
                >
                  Search
                </button>
              </div>
            </form>
          ) : null}

          <nav className={`${showNavbarSearch ? "" : "xl:justify-self-end"} hidden min-w-0 xl:block`} aria-label="Primary navigation">
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

        <nav
          className={`${isOpen ? "grid" : "hidden"} mt-3 gap-2 rounded-lg border border-border bg-surface p-3 shadow-sm xl:hidden`}
          id="mobile-menu"
          ref={menuRef}
          aria-label="Mobile navigation"
        >
          {navItems.map((item) => (
            <Link
              aria-current={isActivePath(pathname, searchParams, item.href) ? "page" : undefined}
              className={navLinkClass(isActivePath(pathname, searchParams, item.href))}
              href={item.href}
              key={item.href}
              onClick={() => setIsOpen(false)}
              scroll
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
