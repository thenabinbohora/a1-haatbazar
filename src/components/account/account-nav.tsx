"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const accountLinks = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/wishlist", label: "Wishlist" },
];

export function AccountNav() {
  const pathname = usePathname();
  const activeLinkRef = useRef<HTMLAnchorElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const nav = navRef.current;
    const activeLink = activeLinkRef.current;

    if (!nav || !activeLink) {
      return;
    }

    nav.scrollTo({
      left: activeLink.offsetLeft - (nav.clientWidth - activeLink.clientWidth) / 2,
      behavior: "auto",
    });
  }, [pathname]);

  return (
    <nav
      className="polished-scrollbar mb-7 flex snap-x snap-mandatory gap-1.5 overflow-x-auto rounded-2xl border border-border bg-surface p-1.5 shadow-sm sm:mb-8 sm:w-fit"
      aria-label="Account navigation"
      ref={navRef}
    >
      {accountLinks.map((link) => (
        <Link
          aria-current={pathname === link.href ? "page" : undefined}
          className={[
            "flex min-h-12 shrink-0 snap-center items-center rounded-xl border px-4 py-2 text-sm font-bold transition-[background-color,border-color,color,box-shadow] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta",
            pathname === link.href
              ? "border-primary bg-primary text-white shadow-sm"
              : "border-transparent bg-transparent text-text-muted hover:border-border hover:bg-surface-muted hover:text-primary",
          ].join(" ")}
          href={link.href}
          key={link.href}
          ref={pathname === link.href ? activeLinkRef : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
