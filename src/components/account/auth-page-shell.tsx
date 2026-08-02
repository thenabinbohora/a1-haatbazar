import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { BUSINESS_CONFIG } from "@/config/business";

type AuthPageShellProps = {
  children: ReactNode;
  promoDescription?: string;
  promoEyebrow?: string;
  promoTitle?: string;
};

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className={direction === "left" ? "h-4 w-4 rotate-180" : "h-4 w-4"}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.25"
      viewBox="0 0 24 24"
    >
      <path d="m5 12.5 4.2 4.2L19 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      <rect height="10" rx="2" width="14" x="5" y="10" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function AuthHeader() {
  return (
    <header
      className="border-b border-border/80 bg-surface"
      data-auth-header
    >
      <div className="mx-auto flex min-h-[4.25rem] w-full max-w-[1120px] items-center justify-between gap-3 px-4 sm:min-h-[4.75rem] sm:px-6 lg:px-8">
        <BrandLogo />
        <Link
          aria-label="Back to shop"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-2 text-sm font-extrabold text-primary transition-colors duration-200 hover:bg-fresh-soft hover:text-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none sm:px-3"
          href="/products"
          prefetch={false}
          style={{ color: "var(--color-primary)" }}
        >
          <ArrowIcon direction="left" />
          <span className="hidden min-[360px]:inline">Back to shop</span>
          <span className="min-[360px]:hidden">Shop</span>
        </Link>
      </div>
    </header>
  );
}

function AuthPromoPanel({
  description,
  eyebrow,
  title,
}: {
  description: string;
  eyebrow: string;
  title: string;
}) {
  const reassurance = [
    "Track orders",
    "Save delivery addresses",
    "Keep wishlist items",
  ];

  return (
    <aside
      className="relative hidden min-w-0 overflow-hidden rounded-3xl border border-primary-muted bg-primary p-8 text-white shadow-[0_22px_55px_rgba(18,60,46,0.17)] lg:order-1 lg:flex lg:flex-col lg:justify-center xl:p-10"
      data-auth-promo
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full border border-cta/20 bg-cta/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-white/[0.055]"
      />
      <div className="relative z-10">
        <BrandLogo variant="dark" />
        <p className="mt-8 w-fit rounded-full border border-cta/30 bg-cta/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.14em] text-cta-soft">
          {eyebrow}
        </p>
        <h2 className="mt-5 max-w-md text-3xl font-black leading-[1.12] tracking-tight xl:text-[2.6rem]">
          {title}
        </h2>
        <p className="mt-4 max-w-md text-base leading-7 text-emerald-50/80">
          {description}
        </p>
        <ul className="mt-6 grid gap-2.5 text-sm font-semibold text-emerald-50/90">
          {reassurance.map((item) => (
            <li className="flex items-center gap-2.5" key={item}>
              <span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-cta-soft">
                <CheckIcon />
              </span>
              {item}
            </li>
          ))}
        </ul>
        <Link
          className="mt-8 inline-flex min-h-12 w-fit items-center gap-2 rounded-xl border border-hero bg-hero px-5 text-sm font-extrabold text-primary shadow-sm transition-colors duration-200 hover:border-white hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta motion-reduce:transition-none"
          href="/products"
          prefetch={false}
          style={{ color: "var(--color-primary)" }}
        >
          Browse groceries
          <ArrowIcon />
        </Link>
      </div>
    </aside>
  );
}

function MobileTrustStrip() {
  return (
    <section
      aria-label="Account reassurance"
      className="mt-5 flex gap-3 rounded-2xl border border-fresh/20 bg-fresh-soft p-4 text-primary lg:hidden"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface text-primary shadow-sm">
        <LockIcon />
      </span>
      <div className="min-w-0">
        <h2 className="text-sm font-extrabold">Secure customer access</h2>
        <p className="mt-1 text-sm leading-6 text-text-muted">
          Track orders, save addresses and keep wishlist items together.
        </p>
      </div>
    </section>
  );
}

function AuthFooter() {
  const links = [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms and Conditions" },
    { href: "/delivery-pickup", label: "Help" },
    { href: "/products", label: "Back to shop" },
  ];

  return (
    <footer
      className="border-t border-border/80 bg-surface pb-[env(safe-area-inset-bottom)]"
      data-auth-footer
    >
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-2 px-4 py-4 text-xs text-text-muted sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p>&copy; 2026 {BUSINESS_CONFIG.tradingName}</p>
          <p className="mt-1 text-[11px] text-text-muted/90 sm:hidden">
            Salisbury, South Australia
          </p>
        </div>
        <nav
          aria-label="Authentication footer"
          className="-mx-2 flex flex-wrap items-center"
        >
          {links.map((link) => (
            <Link
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 font-semibold transition-colors duration-200 hover:bg-fresh-soft hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
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

export function AuthPageShell({
  children,
  promoDescription = "Track orders, reuse saved addresses, manage your wishlist and check out faster.",
  promoEyebrow = "Secure customer access",
  promoTitle = "Sign in for faster grocery shopping.",
}: AuthPageShellProps) {
  return (
    <div
      className="flex min-h-dvh min-w-0 flex-col overflow-x-clip bg-[radial-gradient(circle_at_12%_4%,rgba(47,109,74,0.08),transparent_28rem),radial-gradient(circle_at_90%_88%,rgba(192,79,26,0.055),transparent_24rem),var(--color-background)]"
      data-auth-page-shell
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <AuthHeader />
      <main className="flex flex-1" data-auth-main id="main-content" tabIndex={-1}>
        <div className="mx-auto grid w-full max-w-[1120px] content-start gap-5 px-4 py-5 sm:px-6 sm:py-8 lg:my-auto lg:grid-cols-[minmax(340px,0.85fr)_minmax(420px,1fr)] lg:items-stretch lg:gap-6 lg:px-8 lg:py-[clamp(2rem,6vh,4.5rem)]">
          <div className="flex min-w-0 flex-col justify-start lg:order-2 lg:justify-center">
            {children}
            <MobileTrustStrip />
          </div>
          <AuthPromoPanel
            description={promoDescription}
            eyebrow={promoEyebrow}
            title={promoTitle}
          />
        </div>
      </main>
      <AuthFooter />
    </div>
  );
}
