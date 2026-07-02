"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavLinkProps = {
  href: string;
  label: string;
  shortLabel?: string;
};

export function AdminNavLink({ href, label, shortLabel }: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex min-h-10 items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta",
        isActive
          ? "border-cta/40 bg-cta-soft text-primary shadow-sm"
          : "border-transparent text-text-muted hover:border-border hover:bg-white/85 hover:text-primary",
      ].join(" ")}
      href={href}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={[
            "grid h-7 w-7 shrink-0 place-items-center rounded-md border text-xs font-black",
            isActive ? "border-primary/15 bg-white text-primary" : "border-border bg-surface-muted text-text-muted",
          ].join(" ")}
          aria-hidden="true"
        >
          {label.slice(0, 1)}
        </span>
        <span className="hidden truncate lg:inline">{label}</span>
        <span className="truncate lg:hidden">{shortLabel ?? label}</span>
      </span>
      {isActive ? <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden="true" /> : null}
    </Link>
  );
}
