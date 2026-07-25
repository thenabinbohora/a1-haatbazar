import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { BUSINESS_CONFIG } from "@/config/business";

const shoppingLinks = [
  { href: "/products", label: "Shop all" },
  { href: "/products?sale=on", label: "Weekly offers" },
  { href: "/category/vegetables", label: "Fresh vegetables" },
  { href: "/categories", label: "Categories" },
  { href: "/products?sort=popular", label: "Best sellers" },
];

const customerLinks = [
  { href: "/account", label: "My account" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/cart", label: "Cart" },
  { href: "/wishlist", label: "Wishlist" },
];

const helpLinks = [
  { href: `mailto:${BUSINESS_CONFIG.publicEmail}`, label: "Contact us" },
  { href: "/delivery-pickup", label: "Delivery & pickup" },
  { href: "/returns-refunds", label: "Returns and refunds" },
  { href: "/product-information", label: "Product and allergen information" },
  { href: "/accessibility", label: "Accessibility" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms and Conditions" },
  { href: "/cookies", label: "Cookie Policy" },
];

const mobileHelpAndLegalLinks = [
  { href: `mailto:${BUSINESS_CONFIG.publicEmail}`, label: "Contact us" },
  { href: "/delivery-pickup", label: "Delivery & pickup" },
  { href: "/returns-refunds", label: "Returns, refunds & replacements" },
  { href: "/product-information", label: "Product and allergen information" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms and Conditions" },
  { href: "/cookies", label: "Cookie Policy" },
  { href: "/accessibility", label: "Accessibility Statement" },
];

type FooterLink = {
  href: string;
  label: string;
};

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function DisclosureIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 transition-transform duration-200 group-open:rotate-180 motion-reduce:transform-none motion-reduce:transition-none"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function FooterNavigationLink({ link, mobile = false }: { link: FooterLink; mobile?: boolean }) {
  const className = mobile
    ? "flex min-h-11 w-full items-center rounded-lg px-2 py-2 leading-5 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
    : "inline-flex min-h-11 items-center rounded-md py-2 leading-5 transition-colors duration-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none";

  if (link.href.startsWith("/")) {
    return (
      <Link className={className} href={link.href} prefetch={false}>
        {link.label}
      </Link>
    );
  }

  return (
    <a className={className} href={link.href}>
      {link.label}
    </a>
  );
}

function MobileLinkDisclosure({ label, links }: { label: string; links: FooterLink[] }) {
  return (
    <details className="group border-b border-white/10 last:border-b-0">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-2 text-sm font-extrabold text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta [&::-webkit-details-marker]:hidden">
        {label}
        <DisclosureIcon />
      </summary>
      <ul className="pb-2 text-sm text-emerald-50/80">
        {links.map((link) => (
          <li key={link.href}>
            <FooterNavigationLink link={link} mobile />
          </li>
        ))}
      </ul>
    </details>
  );
}

function DesktopLinkColumn({ label, links }: { label: string; links: FooterLink[] }) {
  return (
    <nav aria-label={`Footer ${label.toLowerCase()} links`} className="hidden min-w-0 md:block">
      <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-100">{label}</h2>
      <ul className="mt-3 space-y-0.5 text-sm text-emerald-50/75">
        {links.map((link) => (
          <li key={link.href}>
            <FooterNavigationLink link={link} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SupportBlock() {
  return (
    <div className="min-w-0">
      <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-100">
        Store & support
      </h2>
      <div className="mt-3 space-y-3 text-sm leading-6 text-emerald-50/80">
        <address className="not-italic">{BUSINESS_CONFIG.address.formatted}</address>
        <p>{BUSINESS_CONFIG.openingHours.display}</p>
        <a
          className="inline-flex min-h-11 max-w-full items-center break-all rounded-sm py-2 font-bold text-white underline decoration-cta underline-offset-4 transition-colors duration-200 hover:text-cta-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
          href={`mailto:${BUSINESS_CONFIG.publicEmail}`}
        >
          {BUSINESS_CONFIG.publicEmail}
        </a>
      </div>
    </div>
  );
}

type FooterProps = {
  hasMobileTabBar?: boolean;
};

export function Footer({ hasMobileTabBar = false }: FooterProps) {
  const safeAreaClass = hasMobileTabBar
    ? "xl:pb-[env(safe-area-inset-bottom)]"
    : "pb-[env(safe-area-inset-bottom)]";

  return (
    <footer className="mt-auto">
      <div
        className={[
          "bg-[radial-gradient(circle_at_85%_5%,rgba(217,107,43,0.16),transparent_24rem),linear-gradient(160deg,#123C2E_0%,#0B2B20_68%)] text-white",
          safeAreaClass,
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 md:grid md:grid-cols-2 md:gap-x-10 md:gap-y-10 md:py-12 lg:grid-cols-3 lg:px-8 lg:py-14 xl:grid-cols-[minmax(17rem,1.35fr)_repeat(4,minmax(0,1fr))] xl:gap-x-8">
          <div className="min-w-0">
            <BrandLogo display="full" variant="dark" />
            <p className="mt-4 max-w-md text-sm leading-6 text-emerald-50/75">
              {BUSINESS_CONFIG.description}
            </p>
            <a
              className="group mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-primary transition-colors duration-200 hover:bg-cta-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none sm:mt-5"
              href={BUSINESS_CONFIG.directionsUrl}
              rel="noopener noreferrer"
              style={{ color: "var(--color-primary)" }}
              target="_blank"
            >
              Get directions
              <ArrowIcon />
            </a>
            <div className="mt-8 hidden border-t border-white/10 pt-6 md:block">
              <SupportBlock />
            </div>
          </div>

          <DesktopLinkColumn label="Shop" links={shoppingLinks} />
          <DesktopLinkColumn label="Customer account" links={customerLinks} />
          <DesktopLinkColumn label="Help" links={helpLinks} />
          <DesktopLinkColumn label="Legal" links={legalLinks} />

          <div className="mt-7 rounded-xl border border-white/10 px-3 md:hidden">
            <MobileLinkDisclosure label="Shop" links={shoppingLinks} />
            <MobileLinkDisclosure label="Your account" links={customerLinks} />
            <MobileLinkDisclosure label="Help & legal" links={mobileHelpAndLegalLinks} />
          </div>

          <div className="mt-7 md:hidden">
            <SupportBlock />
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs leading-5 text-emerald-50/65 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>&copy; 2026 {BUSINESS_CONFIG.tradingName}. All rights reserved.</p>
            {BUSINESS_CONFIG.ordering.pricesAndStockCheckedBeforeConfirmation ? (
              <p>Prices and stock are confirmed before fulfilment.</p>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
