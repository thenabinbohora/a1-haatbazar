"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminIcon, type AdminIconName } from "@/components/admin/admin-icons";

type AdminNavLinkProps = {
  href: string;
  icon: AdminIconName;
  label: string;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function AdminNavLink({
  collapsed = false,
  href,
  icon,
  label,
  onNavigate,
}: AdminNavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      aria-label={collapsed ? label : undefined}
      className={[
        "group/admin-nav relative flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta",
        collapsed ? "justify-center" : "",
        isActive
          ? "border-primary/12 bg-[#e9f1eb] text-primary"
          : "border-transparent text-[#536159] hover:bg-[#f1f3ee] hover:text-primary",
      ].join(" ")}
      href={href}
      onClick={onNavigate}
    >
      {isActive ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-2 left-0 w-0.5 rounded-r-full bg-[#b98525]"
        />
      ) : null}
      <AdminIcon className="h-5 w-5 shrink-0" name={icon} />
      {collapsed ? null : <span className="min-w-0 flex-1 truncate">{label}</span>}
      {collapsed ? (
        <span
          className="pointer-events-none absolute left-[calc(100%+0.65rem)] top-1/2 z-[var(--z-layer-popover)] hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg group-hover/admin-nav:block group-focus-visible/admin-nav:block"
          role="tooltip"
        >
          {label}
        </span>
      ) : null}
    </Link>
  );
}
