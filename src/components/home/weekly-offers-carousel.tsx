"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { formatCurrency } from "@/components/product/price";
import type { StorefrontProductCard } from "@/lib/storefront";
import { useCart } from "@/store/cart-store";

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

function stockCopy(product: StorefrontProductCard) {
  if (!product.isInStock) {
    return "Out of stock";
  }

  if (product.totalStock <= 5) {
    return `Only ${product.totalStock} left`;
  }

  return "In stock";
}

function offerSavings(product: StorefrontProductCard) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.startingPrice) {
    return product.discountPercent ? `Save ${product.discountPercent}%` : "Weekly offer";
  }

  return `Save ${formatCurrency(product.compareAtPrice - product.startingPrice, product.currency)}`;
}

function discountCopy(product: StorefrontProductCard) {
  if (!product.compareAtPrice || product.compareAtPrice <= product.startingPrice) {
    return "Selected packs on offer";
  }

  const discountPercent = Math.round(((product.compareAtPrice - product.startingPrice) / product.compareAtPrice) * 100);

  return `${discountPercent}% off weekly offer`;
}

function WeeklyOfferCard({ product }: { product: StorefrontProductCard }) {
  const { addItem } = useCart();
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimerRef = useRef<number | null>(null);
  const hasSingleSellableVariant = product.sellableVariantCount === 1;
  const hasMultipleDiscountedVariants = product.discountedVariantCount > 1;
  const canDirectAdd = hasSingleSellableVariant && product.isInStock && product.leadVariantStock > 0;
  const savingsCopy = offerSavings(product);
  const discountText = discountCopy(product);
  const productHref = `/products/${product.slug}?variant=${encodeURIComponent(product.leadVariantSku)}`;

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) {
        window.clearTimeout(noticeTimerRef.current);
      }
    };
  }, []);

  function addSingleVariant() {
    const result = addItem({
      productId: product.id,
      variantId: product.leadVariantId,
      quantity: 1,
      maxStock: product.leadVariantStock,
    });

    setNotice(result.wasAdjusted ? "Cart updated to available stock" : "Added to cart");

    if (noticeTimerRef.current) {
      window.clearTimeout(noticeTimerRef.current);
    }

    noticeTimerRef.current = window.setTimeout(() => {
      setNotice(null);
      noticeTimerRef.current = null;
    }, 2800);
  }

  return (
    <article
      className="group flex h-full w-[78vw] max-w-[18rem] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:border-cta/55 hover:shadow-[0_18px_38px_rgba(6,61,22,0.1)] focus-within:border-cta/55 sm:w-[17rem] lg:hover:-translate-y-0.5"
      data-weekly-offer-card
    >
      <Link
        aria-label={`View ${product.name}`}
        className="relative block h-36 bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        href={productHref}
        scroll
      >
        {product.imageUrl ? (
          <Image
            alt={product.imageAlt}
            className="h-full w-full object-contain p-0.5 transition-transform duration-300 group-hover:scale-[1.02]"
            fill
            sizes="288px"
            src={product.imageUrl}
            unoptimized
          />
        ) : (
          <ProductImagePlaceholder compact category={product.category.name} name={product.name} />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-cta/35 bg-cta-soft px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-cta-hover shadow-sm">
            Weekly offer
          </span>
          <span className="rounded-full border border-white/70 bg-white/95 px-2.5 py-1 text-xs font-bold text-primary shadow-sm">
            {savingsCopy}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex min-h-5 items-center justify-between gap-2">
          <p className="line-clamp-1 text-xs font-bold uppercase tracking-[0.12em] text-fresh">
            {product.category.name}
          </p>
          <p className="shrink-0 text-xs font-bold text-text-muted">{stockCopy(product)}</p>
        </div>

        <h3 className="mt-2 min-h-12 text-base font-extrabold leading-6 text-primary">
          <Link
            className="line-clamp-2 rounded-sm transition-colors hover:text-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href={productHref}
            scroll
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 line-clamp-1 text-sm font-semibold text-text-muted">{product.variantLabel}</p>

        <div className="mt-4">
          {product.compareAtPrice ? (
            <p className="text-xs font-semibold text-text-muted">
              <span className="mr-1">{hasMultipleDiscountedVariants ? "Was from" : "Was"}</span>{" "}
              <span className="line-through">
                {formatCurrency(product.compareAtPrice, product.currency)}
              </span>
            </p>
          ) : null}
          <p className="mt-1 text-2xl font-extrabold leading-none text-cta-hover">
            {hasMultipleDiscountedVariants ? (
              <span className="mr-1 text-sm font-bold text-primary">From</span>
            ) : (
              <span className="mr-1 text-sm font-bold text-primary">Now</span>
            )}
            {" "}
            {formatCurrency(product.startingPrice, product.currency)}
          </p>
          <p className="mt-1 text-xs font-bold text-primary">{discountText}</p>
        </div>

        <div className="mt-auto pt-4">
          <div className="min-h-5 text-xs font-bold text-primary" aria-live="polite">
            {notice ?? ""}
          </div>
          {hasSingleSellableVariant ? (
            <button
              className="a1-primary-button mt-2 w-full cursor-pointer px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              disabled={!canDirectAdd}
              onClick={addSingleVariant}
              type="button"
            >
              Add to cart
            </button>
          ) : (
            <Link
              className="a1-primary-button mt-2 w-full px-3 py-2 text-center text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href={productHref}
              scroll
            >
              Select pack
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function WeeklyOffersCarousel({ products }: { products: StorefrontProductCard[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: false });

  function updateScrollState() {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const maxScroll = scroller.scrollWidth - scroller.clientWidth;

    setScrollState({
      canScrollLeft: scroller.scrollLeft > 4,
      canScrollRight: scroller.scrollLeft < maxScroll - 4,
    });
  }

  useEffect(() => {
    updateScrollState();

    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(scroller);

    return () => resizeObserver.disconnect();
  }, [products.length]);

  function scrollByCard(direction: "left" | "right") {
    const scroller = scrollerRef.current;

    if (!scroller) {
      return;
    }

    const card = scroller.querySelector<HTMLElement>("[data-weekly-offer-card]");
    const distance = card ? card.offsetWidth + 16 : 300;

    scroller.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  return (
    <section className="border-b border-border bg-[linear-gradient(180deg,#FAF8F1_0%,#F4F1E8_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-fresh">Weekly offers</p>
            <h2 className="mt-1 text-3xl font-extrabold leading-tight text-text">
              Deals for your next grocery run
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
              Save on selected pantry staples, fresh picks, and weekly essentials.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link className="text-sm font-bold text-cta-hover transition-colors hover:text-primary" href="/products?sale=on">
              View all offers
            </Link>
            <div className="hidden shrink-0 justify-end gap-2 md:flex">
              <button
                aria-label="Scroll weekly offers left"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-primary shadow-sm transition-[border-color,box-shadow,color,transform,opacity] duration-200 hover:-translate-y-0.5 hover:border-cta/60 hover:text-primary-muted hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:border-border disabled:hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                disabled={!scrollState.canScrollLeft}
                onClick={() => scrollByCard("left")}
                type="button"
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                aria-label="Scroll weekly offers right"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-primary shadow-sm transition-[border-color,box-shadow,color,transform,opacity] duration-200 hover:-translate-y-0.5 hover:border-cta/60 hover:text-primary-muted hover:shadow-md disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:border-border disabled:hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                disabled={!scrollState.canScrollRight}
                onClick={() => scrollByCard("right")}
                type="button"
              >
                <ArrowIcon direction="right" />
              </button>
            </div>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="relative overflow-hidden">
            <div
              aria-hidden="true"
              className={[
                "pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#FAF8F1] to-transparent transition-opacity duration-200",
                scrollState.canScrollLeft ? "opacity-100" : "opacity-0",
              ].join(" ")}
            />
            <div
              aria-hidden="true"
              className={[
                "pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#F4F1E8] to-transparent transition-opacity duration-200",
                scrollState.canScrollRight ? "opacity-100" : "opacity-0",
              ].join(" ")}
            />
            <div
              aria-label="Weekly offer products"
              className="a1-no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 py-1"
              onScroll={updateScrollState}
              ref={scrollerRef}
            >
              {products.map((product) => (
                <WeeklyOfferCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-cta/20 bg-white p-6 shadow-sm">
            <p className="text-lg font-extrabold text-primary">Weekly offers coming soon</p>
            <p className="mt-2 text-sm leading-6 text-text-muted">Check back soon for new grocery deals.</p>
            <Link
              className="a1-primary-button mt-4 inline-flex px-5 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href="/products"
            >
              Browse all groceries
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
