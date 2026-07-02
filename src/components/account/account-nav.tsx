"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const accountLinks = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/wishlist", label: "Wishlist" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav className="polished-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1" aria-label="Account navigation">
      {accountLinks.map((link) => (
        <Link
          aria-current={pathname === link.href ? "page" : undefined}
          className={[
            "shrink-0 rounded-md border px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta",
            pathname === link.href
              ? "border-cta bg-cta-soft text-primary"
              : "border-border bg-surface text-text hover:bg-surface-muted",
          ].join(" ")}
          href={link.href}
          key={link.href}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
