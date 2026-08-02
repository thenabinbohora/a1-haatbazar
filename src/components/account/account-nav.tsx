"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountIcon, type AccountIconName } from "@/components/account/account-icons";

const accountLinks: Array<{
  href: string;
  icon: AccountIconName;
  label: string;
}> = [
  { href: "/account", icon: "home", label: "Overview" },
  { href: "/account/orders", icon: "orders", label: "Orders" },
  { href: "/account/addresses", icon: "address", label: "Addresses" },
  { href: "/wishlist", icon: "heart", label: "Wishlist" },
  { href: "/account/profile", icon: "profile", label: "Profile" },
  { href: "/account/security", icon: "security", label: "Security" },
];

const quickActions = accountLinks.filter((link) =>
  ["/account/orders", "/account/addresses", "/wishlist", "/account/profile"].includes(
    link.href,
  ),
);

function isActiveAccountPath(pathname: string, href: string) {
  if (href === "/account") {
    return pathname === href;
  }

  if (href === "/wishlist") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type AccountSidebarProps = {
  email: string;
  name: string | null;
};

export function AccountSidebar({ email, name }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[calc(var(--site-header-offset)+1rem)] overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border bg-fresh-soft/70 px-5 py-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">
            My account
          </p>
          <p className="mt-2 truncate text-sm font-bold text-text">
            {name?.trim() || "Customer account"}
          </p>
          <p className="mt-0.5 truncate text-xs text-text-muted" title={email}>
            {email}
          </p>
        </div>
        <nav aria-label="Customer account">
          <ul className="grid gap-1 p-2.5">
            {accountLinks.map((link) => {
              const active = isActiveAccountPath(pathname, link.href);

              return (
                <li key={link.href}>
                  <Link
                    aria-current={active ? "page" : undefined}
                    className={[
                      "group flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-sm font-bold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none",
                      active
                        ? "border-primary/15 bg-primary text-white"
                        : "border-transparent text-text-muted hover:border-border hover:bg-surface-muted hover:text-primary",
                    ].join(" ")}
                    href={link.href}
                    prefetch={false}
                  >
                    <AccountIcon
                      className={[
                        "h-5 w-5 shrink-0",
                        active
                          ? "text-white"
                          : "text-fresh group-hover:text-primary",
                      ].join(" ")}
                      name={link.icon}
                    />
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-border p-3">
          <Link
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-text-muted transition-colors hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href="/account#account-help"
          >
            <AccountIcon className="h-5 w-5 text-fresh" name="help" />
            Help and support
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function MobileAccountQuickActions() {
  return (
    <nav aria-label="Account quick actions" className="mb-5 lg:hidden">
      <h2 className="sr-only">Account sections</h2>
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((link) => (
          <Link
            className="group flex min-h-[5rem] items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-[0_1px_2px_rgba(18,60,46,0.04)] transition-[border-color,background-color] duration-200 hover:border-primary/25 hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
            href={link.href}
            key={link.href}
            prefetch={false}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fresh-soft text-primary transition-colors group-hover:bg-surface">
              <AccountIcon className="h-5 w-5" name={link.icon} />
            </span>
            <span className="min-w-0 text-sm font-extrabold text-text">
              {link.href === "/account/profile"
                ? "Profile & security"
                : link.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
