"use client";

import Link from "next/link";
import { useState } from "react";
import type { MouseEvent } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { BUSINESS_CONFIG } from "@/config/business";
import { useResetOnNavigation } from "@/hooks/use-reset-on-navigation";
import {
  isUnmodifiedPrimaryClick,
  scrollDocumentToTop,
} from "@/lib/client-navigation";

const shoppingLinks = [
  { href: "/products", label: "Shop all" },
  { href: "/offers", label: "Weekly offers" },
  { href: "/featured", label: "Featured products" },
  { href: "/category/vegetables", label: "Fresh vegetables" },
  { href: "/categories", label: "Categories" },
  { href: "/best-sellers", label: "Best sellers" },
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

function DisclosureIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={[
        "h-5 w-5 transition-transform duration-200 motion-reduce:transform-none motion-reduce:transition-none",
        isOpen ? "rotate-180" : "",
      ].join(" ")}
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

function FooterNavigationLink({
  link,
  mobile = false,
  onNavigate,
}: {
  link: FooterLink;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const className = mobile
    ? "flex min-h-11 w-full items-center rounded-lg px-2 py-2 leading-5 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
    : "inline-flex min-h-11 items-center rounded-md py-2 leading-5 transition-colors duration-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none";

  if (link.href.startsWith("/")) {
    function handleSameDestination(event: MouseEvent<HTMLAnchorElement>) {
      const targetUrl = new URL(link.href, window.location.origin);
      const isCurrentLocation =
        targetUrl.pathname === window.location.pathname &&
        targetUrl.search === window.location.search &&
        targetUrl.hash === window.location.hash;

      if (isCurrentLocation && isUnmodifiedPrimaryClick(event)) {
        event.preventDefault();
        onNavigate?.();
        scrollDocumentToTop();
        document.getElementById("main-content")?.focus({ preventScroll: true });
      }
    }

    return (
      <Link
        className={className}
        href={link.href}
        onClick={handleSameDestination}
        prefetch={false}
        scroll
      >
        {link.label}
      </Link>
    );
  }

  return (
    <a className={className} href={link.href} onClick={onNavigate}>
      {link.label}
    </a>
  );
}

function MobileLinkDisclosure({
  id,
  isOpen,
  label,
  links,
  onNavigate,
  onToggle,
}: {
  id: string;
  isOpen: boolean;
  label: string;
  links: FooterLink[];
  onNavigate: () => void;
  onToggle: () => void;
}) {
  const panelId = `footer-${id}-panel`;

  return (
    <section className="border-b border-white/10 last:border-b-0">
      <h2>
        <button
          aria-controls={panelId}
          aria-expanded={isOpen}
          className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 py-2 text-left text-sm font-extrabold text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta"
          onClick={onToggle}
          type="button"
        >
          {label}
          <DisclosureIcon isOpen={isOpen} />
        </button>
      </h2>
      <ul className="pb-2 text-sm text-emerald-50/80" hidden={!isOpen} id={panelId}>
        {links.map((link) => (
          <li key={link.href}>
            <FooterNavigationLink link={link} mobile onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </section>
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
  const [openSection, setOpenSection] = useState<string | null>(null);
  const safeAreaClass = hasMobileTabBar
    ? "xl:pb-[env(safe-area-inset-bottom)]"
    : "pb-[env(safe-area-inset-bottom)]";

  useResetOnNavigation(() => setOpenSection(null));

  function closeMobileNavigation() {
    setOpenSection(null);
  }

  function toggleMobileSection(section: string) {
    setOpenSection((current) => (current === section ? null : section));
  }

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
            <MobileLinkDisclosure
              id="shop"
              isOpen={openSection === "shop"}
              label="Shop"
              links={shoppingLinks}
              onNavigate={closeMobileNavigation}
              onToggle={() => toggleMobileSection("shop")}
            />
            <MobileLinkDisclosure
              id="account"
              isOpen={openSection === "account"}
              label="Your account"
              links={customerLinks}
              onNavigate={closeMobileNavigation}
              onToggle={() => toggleMobileSection("account")}
            />
            <MobileLinkDisclosure
              id="help-legal"
              isOpen={openSection === "help-legal"}
              label="Help & legal"
              links={mobileHelpAndLegalLinks}
              onNavigate={closeMobileNavigation}
              onToggle={() => toggleMobileSection("help-legal")}
            />
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
