import Image from "next/image";
import Link from "next/link";
import { SectionViewAllLink } from "@/components/home/section-view-all-link";
import { WeeklyOfferActions } from "@/components/home/weekly-offer-actions";
import {
  WeeklyOffersEdgeFades,
  WeeklyOffersScroller,
  WeeklyOffersScrollControls,
} from "@/components/home/weekly-offers-scroll-controls";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { formatCurrency } from "@/components/product/price";
import type { StorefrontProductCard } from "@/lib/storefront";

function stockCopy(product: StorefrontProductCard) {
  if (!product.isInStock) {
    return "Out of stock";
  }

  if (product.totalStock <= 5) {
    return `Only ${product.totalStock} left`;
  }

  return "In stock today";
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

function WeeklyOfferCard({
  hideOnDesktop,
  product,
}: {
  hideOnDesktop: boolean;
  product: StorefrontProductCard;
}) {
  const hasMultipleDiscountedVariants = product.discountedVariantCount > 1;
  const savingsCopy = offerSavings(product);
  const discountText = discountCopy(product);
  const productHref = `/products/${product.slug}?variant=${encodeURIComponent(product.leadVariantSku)}`;

  return (
    <article
      className={[
        "group flex h-full basis-[clamp(16.875rem,75vw,20rem)] shrink-0 snap-start snap-normal flex-col overflow-hidden rounded-2xl border border-cta/20 bg-surface shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:border-cta/45 hover:shadow-lg focus-within:border-cta/45",
        "last:mr-[calc(100%_-_clamp(16.875rem,75vw,20rem))] sm:basis-[calc((100%_-_1rem)/2)] sm:last:mr-[calc((100%_+_1rem)/2)]",
        "lg:basis-auto lg:last:mr-0 motion-safe:lg:hover:-translate-y-0.5 motion-reduce:transition-none",
        hideOnDesktop ? "lg:hidden" : "",
      ].join(" ")}
      data-weekly-offer-card
    >
      <Link
        aria-label={`View ${product.name}`}
        className="relative block h-[clamp(11.25rem,50vw,13rem)] overflow-hidden bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:h-auto sm:aspect-[7/5] lg:aspect-[5/4]"
        href={productHref}
        prefetch={false}
        scroll
      >
        {product.imageUrl ? (
          <Image
            alt={product.imageAlt}
            className="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.02] motion-reduce:transition-none"
            fill
            sizes="(max-width: 360px) 270px, (max-width: 426px) 75vw, (max-width: 639px) 320px, (max-width: 1023px) calc((100vw - 4rem) / 2), (max-width: 1279px) calc((100vw - 7rem) / 4), 290px"
            src={product.imageUrl}
          />
        ) : (
          <ProductImagePlaceholder compact category={product.category.name} name={product.name} />
        )}
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-4rem)] flex-wrap gap-1.5">
          <span className="rounded-full border border-cta/30 bg-cta-soft px-2 py-0.5 text-[0.7rem] font-extrabold uppercase leading-4 tracking-[0.06em] text-cta-hover shadow-sm lg:px-2.5 lg:py-1 lg:text-xs">
            Weekly offer
          </span>
          <span className="rounded-full border border-border bg-surface/95 px-2 py-0.5 text-[0.7rem] font-extrabold leading-4 text-primary shadow-sm lg:px-2.5 lg:py-1 lg:text-xs">
            {savingsCopy}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3 lg:p-4">
        <div className="flex min-h-6 flex-wrap gap-1.5 overflow-hidden lg:min-h-7">
          <span
            className={[
              "rounded-full border px-2 py-0.5 text-[0.7rem] font-bold leading-4 lg:px-2.5 lg:py-1 lg:text-xs",
              product.isInStock
                ? "border-fresh bg-fresh-soft text-fresh"
                : "border-border bg-surface text-text-muted",
            ].join(" ")}
          >
            {stockCopy(product)}
          </span>
          {product.variantCount > 1 ? (
            <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[0.7rem] font-bold leading-4 text-text-muted lg:px-2.5 lg:py-1 lg:text-xs">
              {product.variantCount} options
            </span>
          ) : null}
        </div>

        <p className="mt-2.5 hidden line-clamp-1 text-xs font-extrabold uppercase leading-4 tracking-[0.08em] text-fresh lg:block">
          {product.category.name}
        </p>

        <h3 className="mt-2 min-h-10 text-sm font-extrabold leading-5 text-primary sm:text-base lg:mt-1 lg:min-h-12 lg:text-lg lg:leading-6">
          <Link
            className="line-clamp-2 rounded-sm transition-colors hover:text-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href={productHref}
            prefetch={false}
            scroll
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-2.5 line-clamp-1 text-xs font-semibold leading-4 text-text-muted sm:text-sm sm:leading-5">{product.variantLabel}</p>

        <div className="mt-auto pt-2 lg:pt-3">
          <div className="flex min-h-7 min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 lg:min-h-8">
            {product.compareAtPrice ? (
              <span className="shrink-0 whitespace-nowrap text-xs font-semibold leading-4 tabular-nums text-text-muted lg:text-sm lg:leading-5">
                <span className="mr-1">{hasMultipleDiscountedVariants ? "Was from" : "Was"}</span>
                <span className="line-through">
                  {formatCurrency(product.compareAtPrice, product.currency)}
                </span>
              </span>
            ) : null}
            <span className="min-w-0 whitespace-nowrap text-xl font-extrabold leading-none tabular-nums text-cta-hover sm:text-[1.45rem] lg:text-[1.65rem]">
              {hasMultipleDiscountedVariants ? (
                <span className="mr-1 text-xs font-extrabold text-primary lg:text-sm">From</span>
              ) : (
                <span className="mr-1 text-xs font-extrabold text-primary lg:text-sm">Now</span>
              )}
              {formatCurrency(product.startingPrice, product.currency)}
            </span>
          </div>
          <p className="mt-1.5 hidden text-sm font-bold text-primary xl:block">{discountText}</p>
        </div>

        <WeeklyOfferActions product={product} productHref={productHref} />
      </div>
    </article>
  );
}

export function WeeklyOffersCarousel({ products }: { products: StorefrontProductCard[] }) {
  const scrollerId = "weekly-offers-scroller";

  return (
    <section aria-labelledby="weekly-offers-heading" className="border-y border-cta/15 bg-cta-soft">
      <div className="mx-auto max-w-7xl px-4 pb-9 pt-7 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-6">
          <div className="order-1 mb-4 flex flex-col gap-4 sm:mb-7 md:flex-row md:items-end md:justify-between lg:col-start-1 lg:row-start-1">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-cta-hover">Weekly offers</p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight text-text sm:text-4xl" id="weekly-offers-heading">
                Deals for your next grocery run
              </h2>
              <p className="mt-3 hidden max-w-2xl text-base leading-7 text-text-muted sm:block">
                Save on selected pantry staples, fresh picks, and weekly essentials.
              </p>
            </div>
            {products.length > 0 ? <WeeklyOffersScrollControls targetId={scrollerId} /> : null}
          </div>

          {products.length > 0 ? (
            <div className="order-2 relative -mx-4 min-w-0 overflow-hidden sm:-mx-6 lg:col-span-2 lg:row-start-2 lg:mx-0 lg:overflow-visible">
              <WeeklyOffersEdgeFades targetId={scrollerId} />
              <p className="sr-only" id="weekly-offers-instructions">
                Swipe horizontally or use the arrow keys to browse more weekly offers.
              </p>
              <WeeklyOffersScroller
                className="a1-no-scrollbar flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overscroll-x-contain scroll-px-4 px-4 pb-1 pt-3 [-webkit-overflow-scrolling:touch] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta sm:gap-4 sm:scroll-px-6 sm:px-6 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:overscroll-auto lg:scroll-px-0 lg:snap-none lg:px-0 lg:py-3 xl:gap-5"
                describedById="weekly-offers-instructions"
                targetId={scrollerId}
              >
                {products.map((product, index) => (
                  <WeeklyOfferCard hideOnDesktop={index >= 4} key={product.id} product={product} />
                ))}
              </WeeklyOffersScroller>
            </div>
          ) : (
            <div className="order-2 rounded-2xl border border-cta/20 bg-surface p-6 shadow-sm lg:col-span-2 lg:row-start-2">
              <p className="text-lg font-extrabold text-primary">Weekly offers coming soon</p>
              <p className="mt-2 text-sm leading-6 text-text-muted">Check back soon for new grocery deals.</p>
              <Link
                className="a1-primary-button mt-4 inline-flex px-5 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                href="/products"
                prefetch={false}
              >
                Browse all groceries
              </Link>
            </div>
          )}

          {products.length > 0 ? (
            <SectionViewAllLink
              accessibleLabel="View all weekly offers"
              href="/offers"
              label="View all offers"
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
