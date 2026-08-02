import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BUSINESS_CONFIG } from "@/config/business";
import { APP_NAME, BRAND_LOGO_SRC } from "@/lib/constants";

type AdminAuthShellProps = {
  children: ReactNode;
  variant?: "login" | "compact";
};

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M19 12H5m6 6-6-6 6-6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M12 3 5.5 5.7v5.6c0 4.2 2.7 7.7 6.5 9.7 3.8-2 6.5-5.5 6.5-9.7V5.7L12 3Z" />
      <path d="m9.2 12 1.8 1.8 3.9-4.2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d="m5 12.5 4.2 4.2L19 7" />
    </svg>
  );
}

export function AdminAuthHeader() {
  return (
    <header
      className="border-b border-[#dfe3dc] bg-white/95"
      data-admin-auth-header
    >
      <div className="mx-auto flex min-h-[4.25rem] w-full max-w-[1120px] items-center justify-between gap-3 px-4 sm:min-h-[4.75rem] sm:px-6 lg:px-8">
        <Link
          aria-label={`${APP_NAME} storefront`}
          className="flex min-h-11 min-w-0 items-center gap-3 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b77a16]"
          href="/"
          prefetch={false}
        >
          <Image
            alt={APP_NAME}
            className="h-8 w-[178px] max-w-[54vw] object-contain object-left sm:h-9 sm:w-[200px]"
            height={414}
            priority
            sizes="(min-width: 640px) 200px, 178px"
            src={BRAND_LOGO_SRC}
            width={2294}
          />
          <span className="hidden h-6 w-px bg-[#d9ded7] sm:block" />
          <span className="hidden whitespace-nowrap text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#42564b] sm:block">
            Admin console
          </span>
        </Link>
        <Link
          className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm font-bold text-[#174a36] transition-colors duration-200 hover:bg-[#eef4ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b77a16] motion-reduce:transition-none sm:px-3"
          href="/"
          prefetch={false}
        >
          <ArrowLeftIcon />
          <span className="hidden min-[390px]:inline">Return to storefront</span>
          <span className="min-[390px]:hidden">Storefront</span>
        </Link>
      </div>
    </header>
  );
}

export function AdminAccessPanel() {
  const controls = [
    "Administrator role required",
    "Server-managed secure sessions",
    "Restricted operational workspace",
  ];

  return (
    <aside
      className="relative hidden min-w-0 overflow-hidden rounded-[1.75rem] border border-[#244f3d] bg-[#123c2e] p-8 text-white shadow-[0_24px_65px_rgba(18,60,46,0.2)] lg:order-1 lg:flex lg:flex-col lg:justify-center xl:p-10"
      data-admin-auth-promo
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#dfb85d]/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full border border-white/[0.06]"
      />
      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.08] text-[#f1d188]">
          <ShieldIcon />
        </div>
        <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.18em] text-[#f1d188]">
          Authorised access only
        </p>
        <h2 className="mt-4 max-w-md text-[2rem] font-black leading-[1.14] tracking-[-0.025em] text-white xl:text-[2.35rem]">
          Sign in to manage A1 Haat Bazar.
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-7 text-[#dbe8df]">
          Manage products, orders, inventory, offers and store operations from one protected workspace.
        </p>
        <ul className="mt-7 grid gap-3 text-sm font-semibold text-[#e9f2ec]">
          {controls.map((item) => (
            <li className="flex items-center gap-3" key={item}>
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-[#f1d188]">
                <CheckIcon />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export function AdminAuthFooter() {
  const links = [
    { href: "/", label: "Return to storefront" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms and Conditions" },
  ];

  return (
    <footer
      className="border-t border-[#dfe3dc] bg-white pb-[env(safe-area-inset-bottom)]"
      data-admin-auth-footer
    >
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-1 px-4 py-3 text-xs text-[#5a6860] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>
          &copy; 2026 {BUSINESS_CONFIG.tradingName}
          <span aria-hidden="true"> · </span>
          <span>Authorised staff access only</span>
        </p>
        <nav
          aria-label="Administrator authentication footer"
          className="-mx-2 flex flex-wrap items-center"
        >
          {links.map((link) => (
            <Link
              className="inline-flex min-h-11 items-center rounded-lg px-2 font-semibold transition-colors duration-200 hover:bg-[#eef4ef] hover:text-[#123c2e] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#b77a16] motion-reduce:transition-none"
              href={link.href}
              key={link.href}
              prefetch={false}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export function AdminAuthShell({
  children,
  variant = "login",
}: AdminAuthShellProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className="admin-auth-background flex min-h-screen min-h-dvh min-w-0 flex-col overflow-x-clip"
      data-admin-auth-shell
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <AdminAuthHeader />
      <main
        className="flex flex-1"
        data-admin-auth-main
        id="main-content"
        tabIndex={-1}
      >
        <div
          className={
            isCompact
              ? "mx-auto flex w-full max-w-[720px] items-center px-4 py-8 sm:px-6 sm:py-12"
              : "mx-auto grid w-full max-w-[1120px] content-start gap-5 px-4 py-5 sm:px-6 sm:py-8 lg:my-auto lg:grid-cols-[minmax(340px,0.9fr)_minmax(420px,1fr)] lg:items-stretch lg:gap-8 lg:px-8 lg:py-[clamp(2rem,6vh,4.5rem)]"
          }
        >
          <div
            className={
              isCompact
                ? "w-full min-w-0"
                : "flex min-w-0 flex-col justify-start lg:order-2 lg:justify-center"
            }
          >
            {children}
          </div>
          {isCompact ? null : <AdminAccessPanel />}
        </div>
      </main>
      <AdminAuthFooter />
    </div>
  );
}
