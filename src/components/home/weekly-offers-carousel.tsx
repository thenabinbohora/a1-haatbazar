import Image from "next/image";
import Link from "next/link";
import { WeeklyOfferActions } from "@/components/home/weekly-offer-actions";
import { WeeklyOffersEdgeFades, WeeklyOffersScrollControls } from "@/components/home/weekly-offers-scroll-controls";
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

function WeeklyOfferCard({ product }: { product: StorefrontProductCard }) {
  const hasMultipleDiscountedVariants = product.discountedVariantCount > 1;
  const savingsCopy = offerSavings(product);
  const discountText = discountCopy(product);
  const productHref = `/products/${product.slug}?variant=${encodeURIComponent(product.leadVariantSku)}`;

  return (
    <article
      className="group flex h-full w-[76vw] max-w-[17.5rem] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:border-cta/55 hover:shadow-[0_18px_38px_rgba(6,61,22,0.1)] focus-within:border-cta/55 sm:w-[17rem] lg:hover:-translate-y-0.5"
      data-weekly-offer-card
    >
      <Link
        aria-label={`View ${product.name}`}
        className="relative block aspect-[4/3] overflow-hidden bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        href={productHref}
        prefetch={false}
        scroll
      >
        {product.imageUrl ? (
          <Image
            alt={product.imageAlt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            fill
            sizes="(max-width: 639px) 76vw, 288px"
            src={product.imageUrl}
          />
        ) : (
          <ProductImagePlaceholder compact category={product.category.name} name={product.name} />
        )}
        <div className="absolute left-2 top-2 flex max-w-[calc(100%-3.75rem)] flex-wrap gap-1.5 sm:left-3 sm:top-3">
          <span className="rounded-full border border-cta/35 bg-cta-soft px-2 py-0.5 text-[0.66rem] font-extrabold uppercase tracking-[0.08em] text-cta-hover shadow-sm sm:px-2.5 sm:py-1">
            Weekly offer
          </span>
          <span className="rounded-full border border-white/70 bg-white/95 px-2 py-0.5 text-[0.66rem] font-bold text-primary shadow-sm sm:px-2.5 sm:py-1 sm:text-xs">
            {savingsCopy}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex min-h-6 flex-wrap gap-1.5 overflow-hidden">
          <span
            className={[
              "rounded-full border px-2 py-0.5 text-[0.66rem] font-bold leading-4 sm:text-[0.72rem]",
              product.isInStock
                ? "border-fresh bg-fresh-soft text-fresh"
                : "border-border bg-surface text-text-muted",
            ].join(" ")}
          >
            {stockCopy(product)}
          </span>
          {product.variantCount > 1 ? (
            <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-[0.66rem] font-bold leading-4 text-text-muted sm:text-[0.72rem]">
              {product.variantCount} options
            </span>
          ) : null}
        </div>

        <p className="mt-1.5 line-clamp-1 text-[0.68rem] font-extrabold uppercase leading-4 tracking-[0.08em] text-fresh sm:mt-2 sm:text-[0.72rem]">
          {product.category.name}
        </p>

        <h3 className="mt-1 min-h-11 text-base font-extrabold leading-6 text-primary">
          <Link
            className="line-clamp-2 rounded-sm transition-colors hover:text-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href={productHref}
            prefetch={false}
            scroll
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-1 line-clamp-1 text-xs font-bold text-text-muted">{product.variantLabel}</p>

        <div className="mt-auto min-h-20 pt-2.5">
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

        <WeeklyOfferActions product={product} productHref={productHref} />
      </div>
    </article>
  );
}

export function WeeklyOffersCarousel({ products }: { products: StorefrontProductCard[] }) {
  const scrollerId = "weekly-offers-scroller";

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
            <Link className="text-sm font-bold text-cta-hover transition-colors hover:text-primary" href="/products?sale=on" prefetch={false}>
              View all offers
            </Link>
            <WeeklyOffersScrollControls targetId={scrollerId} />
          </div>
        </div>

        {products.length > 0 ? (
          <div className="relative overflow-hidden">
            <WeeklyOffersEdgeFades targetId={scrollerId} />
            <div
              aria-label="Weekly offer products"
              className="a1-no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 py-1"
              id={scrollerId}
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
              prefetch={false}
            >
              Browse all groceries
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
