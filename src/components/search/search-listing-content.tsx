"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLayoutEffect, type FormEvent, type ReactNode } from "react";
import {
  buildSearchNavigationHref,
  consumeSearchScrollIntent,
  isUnmodifiedPrimaryClick,
  navigateToSearch,
} from "@/lib/client-navigation";
import {
  normalizeStorefrontSearchParams,
  storefrontSearchParamsRecord,
} from "@/lib/product-filter-state";

type SearchListingFrameProps = {
  children: ReactNode;
};

type SearchBrowseContentProps = {
  categories: Array<{ id: string; name: string; slug: string }>;
};

const popularSearches = [
  "rice",
  "masala",
  "noodles",
  "tea",
  "momo",
  "dal",
  "fresh vegetables",
] as const;

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" strokeLinecap="round" />
    </svg>
  );
}

function useNormalizedSearchQuery() {
  const searchParams = useSearchParams();
  const values = normalizeStorefrontSearchParams(
    storefrontSearchParamsRecord(searchParams),
  );

  return values.q ?? "";
}

export function SearchListingFrame({
  children,
}: SearchListingFrameProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const navigationKey = searchParams.toString();
  const query = useNormalizedSearchQuery();
  const hasQuery = Boolean(query);
  const title = hasQuery
    ? `Search results for "${query}"`
    : "Search groceries";
  const description = hasQuery
    ? "Search the A1 Haat Bazar catalog, then refine results with brand, price, offers, and stock filters."
    : "Search rice, masala, noodles, tea, snacks, frozen foods, fresh vegetables, or any grocery essential.";

  useLayoutEffect(() => {
    const pathAndSearch = `${window.location.pathname}${window.location.search}`;

    if (!consumeSearchScrollIntent(pathAndSearch)) {
      return;
    }

    document.getElementById("product-results")?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  }, [navigationKey]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    navigateToSearch(String(formData.get("q") ?? ""), router);
  }

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-surface to-background">
        <div
          className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${
            hasQuery ? "py-5 sm:py-9" : "py-8 sm:py-10"
          }`}
        >
          <p className="inline-flex rounded-full border border-fresh/20 bg-fresh-soft px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-fresh">
            Search
          </p>
          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div aria-atomic="true" aria-live="polite">
              <h1 className="max-w-4xl text-3xl font-black leading-[1.08] tracking-[-0.025em] text-text sm:text-4xl lg:text-5xl">
                {title}
              </h1>
              <p
                className={`mt-3 max-w-2xl text-sm leading-6 text-text-muted sm:text-base sm:leading-7 ${
                  hasQuery ? "hidden sm:block" : ""
                }`}
              >
                {description}
              </p>
            </div>
            <form
              action="/search#product-results"
              className="w-full max-w-xl lg:max-w-none"
              key={`listing-search-${query}`}
              onSubmit={handleSubmit}
              role="search"
            >
              <label className="sr-only" htmlFor="listing-search">
                Search groceries
              </label>
              <div className="flex rounded-2xl border border-border bg-surface p-1.5 shadow-[0_8px_24px_rgba(24,38,27,0.08)] transition-[border-color,box-shadow] duration-200 focus-within:border-cta focus-within:shadow-[0_10px_28px_rgba(24,38,27,0.11)]">
                <input
                  className="min-h-11 min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3 text-base text-text outline-none placeholder:text-text-muted/80 md:text-sm"
                  defaultValue={query}
                  id="listing-search"
                  name="q"
                  placeholder="Search rice, tea, noodles"
                  type="search"
                />
                <button
                  className="a1-primary-button min-h-11 cursor-pointer gap-2 !rounded-xl px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  type="submit"
                >
                  <SearchIcon />
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section
        className={`mx-auto w-full max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8 ${
          hasQuery ? "py-5 sm:py-8" : "py-7 sm:py-10"
        }`}
        id="product-results"
      >
        {children}
      </section>
    </>
  );
}

export function SearchBrowseContent({
  categories,
}: SearchBrowseContentProps) {
  const router = useRouter();
  const query = useNormalizedSearchQuery();

  return (
    <div className="grid gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm lg:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-sm font-bold uppercase text-fresh">
          {query ? "More ways to browse" : "Popular searches"}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {popularSearches.map((item) => {
            const href = buildSearchNavigationHref(item);

            return (
              <Link
                className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-sm font-semibold text-text transition-colors hover:border-primary hover:bg-fresh-soft"
                href={href}
                key={item}
                onClick={(event) => {
                  if (!isUnmodifiedPrimaryClick(event)) {
                    return;
                  }

                  event.preventDefault();
                  navigateToSearch(item, router);
                }}
                prefetch={false}
                scroll
              >
                {item}
              </Link>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold uppercase text-fresh">
          Featured categories
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              className="rounded-full border border-border bg-surface-muted px-3 py-1.5 text-sm font-semibold text-text transition-colors hover:border-primary hover:bg-fresh-soft"
              href={`/category/${category.slug}`}
              key={category.id}
              prefetch={false}
              scroll
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
