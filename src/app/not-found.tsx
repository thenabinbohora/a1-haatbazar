import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-fresh">Page not found</p>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight text-text sm:text-4xl">
          We couldn&apos;t find that page.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-text-muted">
          The link may be out of date, or the product may no longer be available. Browse the shop or search for what
          you need.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            className="a1-primary-button px-6 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href="/products"
          >
            Shop groceries
          </Link>
          <Link
            className="a1-secondary-button px-6 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href="/"
          >
            Back to home
          </Link>
        </div>
        <p className="mt-6 text-sm text-text-muted">
          Looking for something specific?{" "}
          <Link className="font-bold text-cta-hover hover:text-primary" href="/search">
            Search the store
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
