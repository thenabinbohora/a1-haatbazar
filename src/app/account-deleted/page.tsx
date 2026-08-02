import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { BUSINESS_CONFIG } from "@/config/business";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  description: "Account deletion confirmation.",
  robots: { follow: false, index: false },
  title: "Account deleted",
};

export default async function AccountDeletedPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const status = (await searchParams)?.status;
  const isPending = status === "pending";

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex min-h-[4.5rem] w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandLogo />
          <Link
            className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-extrabold text-primary hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href="/products"
          >
            Back to shop
          </Link>
        </div>
      </header>
      <main className="grid flex-1 place-items-center px-4 py-10 sm:px-6" id="main-content" tabIndex={-1}>
        <section className="w-full max-w-xl rounded-3xl border border-border bg-surface p-6 text-center shadow-[0_18px_55px_rgba(18,60,46,0.11)] sm:p-9">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-fresh-soft text-primary">
            <svg
              aria-hidden="true"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {isPending ? (
                <path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              ) : (
                <path d="m5 12 4 4L19 6" />
              )}
            </svg>
          </span>
          <h1 className="mt-5 text-2xl font-black tracking-tight text-text sm:text-3xl">
            {isPending
              ? "Your account deletion is being completed"
              : "Your account has been deleted"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-text-muted sm:text-base">
            {isPending
              ? "You have been signed out and your customer account is locked while the final secure cleanup completes."
              : "You have been signed out and your customer account is no longer available."}
          </p>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Some transaction records may be retained where required.
          </p>
          <Link
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-extrabold text-white hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href="/"
            replace
          >
            Return to A1 Haat Bazar
          </Link>
        </section>
      </main>
      <footer className="border-t border-border bg-surface px-4 py-5 text-center text-xs text-text-muted sm:px-6">
        © 2026 {BUSINESS_CONFIG.tradingName}
      </footer>
    </div>
  );
}
