import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, BRAND_LOGO_SRC, SUPPORT_EMAIL } from "@/lib/constants";
import { absoluteUrl, getSiteUrl } from "@/lib/site";
import { WeeklyOffersCarousel } from "@/components/home/weekly-offers-carousel";
import { SearchBox } from "@/components/search/search-box";
import { ProductGrid } from "@/components/product/product-grid";
import { STORE_CONFIG } from "@/config/store";
import {
  getActiveHomeBanners,
  getFeaturedCategories,
  getPublicProducts,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

const groceryStoreSchema = {
  "@context": "https://schema.org",
  "@type": "GroceryStore",
  name: APP_NAME,
  url: getSiteUrl(),
  image: absoluteUrl(BRAND_LOGO_SRC),
  email: SUPPORT_EMAIL,
  priceRange: "$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "3/170 Commercial Rd",
    addressLocality: "Salisbury",
    addressRegion: "SA",
    postalCode: "5108",
    addressCountry: "AU",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "19:00",
    },
  ],
  areaServed: ["Salisbury", "Adelaide", "South Australia"],
  hasMap: STORE_CONFIG.directionsUrl,
};

function CategoryCard({
  category,
}: {
  category: Awaited<ReturnType<typeof getFeaturedCategories>>[number];
}) {
  return (
    <Link
      className="group overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
      href={`/category/${category.slug}`}
    >
      <div className="aspect-[4/3] bg-background">
        {category.imageUrl ? (
          <div className="relative h-full w-full">
            <Image
              alt={`${category.name} category`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              src={category.imageUrl}
              unoptimized
            />
          </div>
        ) : (
          <ProductImagePlaceholder category="A1 Haat Bazar" name={category.name} />
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="text-sm font-bold text-text sm:text-base">{category.name}</h3>
        <p className="mt-1 hidden line-clamp-2 text-sm leading-5 text-text-muted sm:block">
          {category.description ?? "Authentic pantry staples, fresh essentials, and weekly grocery picks."}
        </p>
        <p className="mt-1.5 text-xs font-bold text-primary sm:mt-3 sm:text-sm">{category._count.products} products</p>
      </div>
    </Link>
  );
}

function PromiseIcon({ type }: { type: "leaf" | "basket" | "tag" | "truck" | "wallet" }) {
  const paths = {
    leaf: (
      <>
        <path d="M5.5 18.5c7.2-.6 11-4.4 12.3-12.3C9.9 7.5 6.1 11.3 5.5 18.5Z" />
        <path d="M5.5 18.5 13 11" />
      </>
    ),
    basket: (
      <>
        <path d="M7.5 10 10 5.5" />
        <path d="M16.5 10 14 5.5" />
        <path d="M4.5 10h15l-1.4 8.2a2 2 0 0 1-2 1.7H7.9a2 2 0 0 1-2-1.7L4.5 10Z" />
        <path d="M8.5 14h7" />
      </>
    ),
    tag: (
      <>
        <path d="M4.5 12.3V5.5h6.8l8.2 8.2-6.8 6.8-8.2-8.2Z" />
        <path d="M8.2 8.2h.01" />
      </>
    ),
    truck: (
      <>
        <path d="M3.8 7.5h10.4v8.6H3.8z" />
        <path d="M14.2 10.1h3.1l2.9 3v3h-6" />
        <path d="M7.1 19a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" />
        <path d="M16.9 19a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" />
      </>
    ),
    wallet: (
      <>
        <path d="M4.5 7.5h13.2a1.8 1.8 0 0 1 1.8 1.8v8.2a1.8 1.8 0 0 1-1.8 1.8H5.9a2.4 2.4 0 0 1-2.4-2.4V8.5a2 2 0 0 1 2-2h10" />
        <path d="M15.2 13.3h4.3" />
        <path d="M16.8 13.3h.01" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 transition-colors duration-200"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[type]}
    </svg>
  );
}

function LocationIcon({ type }: { type: "pin" | "clock" | "pickup" | "truck" | "wallet" }) {
  const paths = {
    pin: (
      <>
        <path d="M12 21s6.5-5.6 6.5-11.2a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z" />
        <path d="M12 12.1a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6Z" />
      </>
    ),
    clock: (
      <>
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        <path d="M12 7.5V12l3 1.8" />
      </>
    ),
    pickup: (
      <>
        <path d="M5 8.5h14l-1.4 10a2 2 0 0 1-2 1.7H8.4a2 2 0 0 1-2-1.7L5 8.5Z" />
        <path d="M8.3 8.5 10.5 4" />
        <path d="M15.7 8.5 13.5 4" />
        <path d="M9.2 13.5h5.6" />
      </>
    ),
    truck: (
      <>
        <path d="M3.8 7.5h10.4v8.6H3.8z" />
        <path d="M14.2 10.1h3.1l2.9 3v3h-6" />
        <path d="M7.1 19a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" />
        <path d="M16.9 19a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" />
      </>
    ),
    wallet: (
      <>
        <path d="M4.5 7.5h13.2a1.8 1.8 0 0 1 1.8 1.8v8.2a1.8 1.8 0 0 1-1.8 1.8H5.9a2.4 2.4 0 0 1-2.4-2.4V8.5a2 2 0 0 1 2-2h10" />
        <path d="M15.2 13.3h4.3" />
        <path d="M16.8 13.3h.01" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[type]}
    </svg>
  );
}

function HeroVisual() {
  return (
    <div className="a1-reveal relative min-h-[520px] overflow-hidden rounded-lg border border-border bg-surface shadow-[0_24px_80px_rgba(15,46,26,0.13)]">
      <Image
        alt="A1 Haat Bazar grocery spread with rice, spices, fresh vegetables, tea, snacks, and momos"
        className="absolute inset-0 h-full w-full object-cover"
        height={1000}
        priority
        src="/brand/a1-pantry-hero.webp"
        width={1400}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(251,244,227,0.98)_0%,rgba(251,244,227,0.78)_42%,rgba(251,244,227,0.12)_100%)]" />
      <div className="relative z-10 flex min-h-[520px] items-end p-5 sm:p-7">
        <div className="a1-glass-card max-w-md p-5 sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-fresh">Local grocery run</p>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-primary sm:text-4xl">
            Pantry staples, fresh produce, and weekly finds.
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-muted">
            Browse familiar essentials with clear stock, pickup, delivery, and simple checkout.
          </p>
        </div>
      </div>
    </div>
  );
}

function A1PromiseBar() {
  const promises = [
      {
        description: "Fresh produce and herbs updated regularly.",
        icon: "leaf",
        label: "Fresh daily",
      },
      {
        description: "Pantry staples, spices, snacks, rice, dal, and more.",
        icon: "basket",
        label: "Nepali groceries",
      },
    {
      description: "Save on selected groceries every week.",
      icon: "tag",
      label: "Weekly offers",
    },
      {
        description: "Choose local delivery or pickup at checkout.",
        icon: "truck",
        label: "Delivery & pickup",
      },
      {
        description: "Cash on delivery or pay at pickup available.",
        icon: "wallet",
        label: "Easy payment",
      },
  ] as const;

  return (
    <section aria-label="Store promises" className="bg-[linear-gradient(180deg,#FAF8F1_0%,#F2F6EE_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <div className="a1-no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto overscroll-x-contain px-4 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:px-0">
          {promises.map((promise, index) => (
            <div
              className="a1-reveal group flex shrink-0 snap-start items-center gap-2.5 rounded-full border border-primary/10 bg-white/80 py-2 pl-2 pr-4 lg:shrink lg:items-start lg:rounded-lg lg:border-transparent lg:bg-transparent lg:py-1.5 lg:pl-0 lg:pr-0"
              key={promise.label}
              style={{ animationDelay: `${120 + index * 90}ms` }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_5px_12px_rgba(15,46,26,0.16)] transition-[transform,background-color,box-shadow] duration-300 ease-out lg:mt-0.5 lg:group-hover:-translate-y-0.5 lg:group-hover:bg-primary-muted lg:group-hover:shadow-[0_8px_18px_rgba(15,46,26,0.22)]">
                <PromiseIcon type={promise.icon} />
              </span>
              <span className="min-w-0">
                <span className="block whitespace-nowrap text-sm font-extrabold leading-5 text-primary lg:whitespace-normal">
                  {promise.label}
                </span>
                <span className="mt-0.5 hidden text-xs font-semibold leading-5 text-text-muted lg:block">
                  {promise.description}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoreLocationSection() {
  const storeDetails = [
    {
      icon: "pin",
      label: "Address",
      value: STORE_CONFIG.address,
    },
    {
      icon: "clock",
      label: "Store hours",
      value: STORE_CONFIG.openingHours,
    },
    {
      icon: "pickup",
      label: "Pickup",
      value: STORE_CONFIG.pickupMessage,
    },
  ] as const;

  return (
    <section className="border-b border-border bg-[linear-gradient(180deg,#FAF8F1_0%,#F2F6EE_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8 lg:py-12">
        <SectionHeading
          description="Find us in Salisbury for store pickup, fresh groceries, and weekly essentials."
          eyebrow="Store pickup location"
          title="Visit our store"
        />
        <div className="a1-section-reveal grid gap-4 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch lg:gap-5">
          <div className="rounded-lg border border-border bg-surface p-5 shadow-[0_14px_42px_rgba(15,46,26,0.08)] sm:p-5 lg:p-6">
            <p className="text-sm font-bold uppercase text-fresh">Local Salisbury store</p>
            <h3 className="mt-2 text-2xl font-extrabold text-primary">{STORE_CONFIG.storeName}</h3>
            <div className="mt-4 space-y-3.5 lg:mt-5">
              {storeDetails.map((detail) => (
                <div className="flex gap-3" key={detail.label}>
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-fresh/15 bg-fresh-soft text-fresh">
                    <LocationIcon type={detail.icon} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-text">{detail.label}</p>
                    {detail.label === "Address" ? (
                      <address className="mt-0.5 text-sm not-italic leading-6 text-text-muted">{detail.value}</address>
                    ) : (
                      <p className="mt-0.5 text-sm leading-6 text-text-muted">{detail.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <a
              aria-label={`Get directions to ${STORE_CONFIG.storeName} in Google Maps`}
              className="a1-primary-button mt-5 w-full gap-2 px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:w-auto"
              href={STORE_CONFIG.directionsUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              <LocationIcon type="pin" />
              Get directions
            </a>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-[0_14px_42px_rgba(15,46,26,0.08)]">
            <div className="flex flex-col">
              <iframe
                allowFullScreen
                className="h-[260px] border-0 sm:h-[300px]"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                src={STORE_CONFIG.mapEmbedUrl}
                title="A1 Haat Bazar location map"
              />
              <div className="border-t border-border bg-white/95 px-4 py-3">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">Store location</p>
                <p className="mt-1 text-sm leading-5 text-text-muted">
                  If the map does not load, use Get directions to open Google Maps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-bold uppercase text-fresh">{eyebrow}</p>
        <h2 className="mt-1 text-3xl font-extrabold leading-tight text-text">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">{description}</p> : null}
      </div>
      {href && action ? (
        <Link
          className="group inline-flex items-center gap-1.5 text-sm font-bold text-cta-hover transition-colors hover:text-primary"
          href={href}
        >
          {action}
          <svg
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </Link>
      ) : null}
    </div>
  );
}

function TrustIcon({ type }: { type: "stock" | "delivery" | "pickup" | "secure" }) {
  const paths = {
    stock: (
      <>
        <path d="M5.3 18.4c6.8-.5 10.4-4.1 11.6-11.6C9.4 8 5.8 11.6 5.3 18.4Z" />
        <path d="M5.3 18.4 12.1 11.6" />
        <path d="M17.8 16.8a4.4 4.4 0 0 1-7.1 2.4" />
        <path d="M15.5 14.5h3.1v3.1" />
      </>
    ),
    delivery: (
      <>
        <path d="M3.8 7.5h10.4v8.6H3.8z" />
        <path d="M14.2 10.1h3.1l2.9 3v3h-6" />
        <path d="M7.1 19a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" />
        <path d="M16.9 19a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z" />
      </>
    ),
    pickup: (
      <>
        <path d="M5 8.5h14l-1.4 10a2 2 0 0 1-2 1.7H8.4a2 2 0 0 1-2-1.7L5 8.5Z" />
        <path d="M8.3 8.5 10.5 4" />
        <path d="M15.7 8.5 13.5 4" />
        <path d="M9.2 13.5h5.6" />
      </>
    ),
    secure: (
      <>
        <path d="M12 3.8 18.2 6v5.2c0 4-2.5 7.5-6.2 9-3.7-1.5-6.2-5-6.2-9V6L12 3.8Z" />
        <path d="M9.5 12.1 11.2 14l3.5-4" />
      </>
    ),
  };

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
      {paths[type]}
    </svg>
  );
}

function TrustSection() {
  const trustCards = [
    {
      description: "See clear stock status before adding items to your cart.",
      icon: "stock",
      label: "Updated regularly",
      title: "Fresh stock updated regularly",
    },
    {
      description: "Choose delivery at checkout and we'll confirm details with you.",
      icon: "delivery",
      label: "Local service",
      title: "Local delivery",
    },
    {
      description: "Pickup is free. We'll let you know when your order is ready.",
      icon: "pickup",
      label: "Free pickup",
      title: "Free store pickup",
    },
    {
      description: "Save addresses, orders, and wishlist items securely.",
      icon: "secure",
      label: "Private & secure",
      title: "Secure account",
    },
  ] as const;

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_18%_8%,rgba(255,247,230,0.88)_0,rgba(255,247,230,0)_34%),radial-gradient(circle_at_86%_18%,rgba(238,247,239,0.95)_0,rgba(238,247,239,0)_36%),linear-gradient(180deg,#EEF7EF_0%,#F8FBF5_100%)]">
      <div className="a1-section-reveal relative mx-auto max-w-7xl px-4 pb-7 pt-9 sm:px-6 sm:pb-8 sm:pt-11 lg:px-8 lg:pb-9 lg:pt-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-fresh">
            WHY SHOP WITH A1 HAAT BAZAR?
          </p>
          <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight text-text sm:text-3xl lg:text-4xl">
            A local grocery experience built on trust
          </h2>
        </div>

        <div className="mx-auto mt-6 grid max-w-5xl gap-3.5 sm:mt-7 lg:auto-rows-fr lg:grid-cols-2 lg:gap-4">
          {trustCards.map((card, index) => {
            const isFeatured = index === 0;

            return (
              <article
                className={[
                  "group relative flex flex-col overflow-hidden rounded-[1.45rem] border px-5 py-4 shadow-[0_18px_46px_rgba(15,46,26,0.08)] transition-[border-color,box-shadow,transform] duration-200 motion-reduce:transition-none",
                  "md:hover:-translate-y-0.5 md:hover:shadow-[0_24px_58px_rgba(15,46,26,0.12)]",
                  isFeatured
                    ? "border-fresh/22 bg-[linear-gradient(180deg,#FFFFFF_0%,#F6FBF4_100%)] md:hover:border-fresh/40"
                    : "border-[#E7DDC8] bg-[#FFFEF8] md:hover:border-[#D9CBA4]",
                ].join(" ")}
                key={card.title}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(198,146,46,0.34),transparent)]"
                />
                <div className="flex items-start gap-3.5 sm:gap-4">
                  <span
                    className={[
                      "grid h-12 w-12 shrink-0 place-items-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition-transform duration-200 motion-reduce:transition-none md:group-hover:scale-[1.02]",
                      isFeatured
                        ? "border-fresh/40 bg-primary text-cta-soft"
                        : "border-fresh/35 bg-[#FFF9EA] text-primary",
                    ].join(" ")}
                  >
                    <TrustIcon type={card.icon} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold leading-6 text-text sm:text-lg">{card.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-text-muted">{card.description}</p>
                  </div>
                </div>
                <div className="mt-auto pt-3">
                  <span className="inline-flex rounded-full border border-fresh/14 bg-fresh-soft/70 px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-primary">
                    {card.label}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [categories, featuredProducts, bestSellers, weeklyOffers, freshVegetables, banners] = await Promise.all([
    getFeaturedCategories(10),
    getPublicProducts({}, { featured: true, take: 8 }),
    getPublicProducts({ sort: "popular" }, { bestSeller: true, take: 8 }),
    getPublicProducts({ inStock: "on", sale: "on", sort: "offers" }, { weeklyOffer: true, take: 12 }),
    getPublicProducts({}, { categorySlug: "vegetables", take: 4 }),
    getActiveHomeBanners(),
  ]);

  const stripBanner = banners.find((banner) => banner.placement === "HOME_STRIP");
  const activeWeeklyOffers = weeklyOffers.filter((product) => product.isWeeklyOffer && product.isOnSale);
  const quickCategoryLinks = categories.slice(0, 4);

  return (
    <div className="overflow-x-clip bg-background">
      <JsonLd data={groceryStoreSchema} />
      <section className="border-b border-border bg-hero">
        <div className="mx-auto grid min-w-0 max-w-7xl gap-6 px-4 py-5 sm:px-6 sm:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:py-14">
          <div className="min-w-0 flex flex-col justify-center">
            <p className="a1-reveal text-sm font-bold uppercase tracking-[0.14em] text-fresh">
              A1 Haat Bazar Authentic Groceries
            </p>
            <h1 className="a1-reveal mt-2.5 max-w-4xl text-[1.86rem] font-extrabold leading-[1.12] text-text [animation-delay:80ms] sm:mt-4 sm:text-5xl sm:leading-tight">
              Authentic Nepali groceries, fresh vegetables, and{" "}
              <span className="relative min-[370px]:whitespace-nowrap">
                daily essentials
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-1.5 left-0 h-2.5 w-full text-cta"
                  fill="none"
                  preserveAspectRatio="none"
                  viewBox="0 0 120 10"
                >
                  <path d="M2 8c30-6 86-6 116-2" stroke="currentColor" strokeLinecap="round" strokeWidth="3.4" />
                </svg>
              </span>{" "}
              all in one place.
            </h1>
            <p className="a1-reveal mt-3 max-w-2xl text-sm leading-6 text-text-muted [animation-delay:160ms] sm:mt-5 sm:text-lg sm:leading-7">
              Shop rice, lentils, spices, pickles, snacks, frozen foods, fresh produce, and weekly offers from A1 Haat
              Bazar.
            </p>

            <div className="a1-reveal mt-4 max-w-2xl [animation-delay:240ms] sm:mt-7">
              <SearchBox placeholder="Search rice, masala, tea" variant="hero" />
              <p className="mt-2 text-xs font-semibold text-text-muted">
                Popular: basmati rice, momo masala, wai wai, tea, ghee
              </p>
            </div>

            {quickCategoryLinks.length ? (
              <div className="a1-reveal mt-3 grid grid-cols-2 gap-2 [animation-delay:300ms] sm:hidden">
                {quickCategoryLinks.map((category) => (
                  <Link
                    className="min-h-10 rounded-full border border-primary/15 bg-white/86 px-3 py-1.5 text-center text-xs font-extrabold text-primary shadow-sm"
                    href={`/category/${category.slug}`}
                    key={category.id}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            ) : null}

            <div className="a1-reveal mt-4 grid grid-cols-1 gap-2 [animation-delay:360ms] min-[370px]:grid-cols-2 sm:mt-7 sm:flex sm:flex-row sm:gap-3">
              <Link className="a1-primary-button px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:px-6" href="/products">
                Shop groceries
              </Link>
              <Link
                className="a1-secondary-button px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:px-6"
                href="/products?sale=on"
              >
                View weekly offers
              </Link>
            </div>

            <div className="a1-reveal relative mt-3 h-24 overflow-hidden rounded-lg border border-border bg-surface shadow-[0_14px_34px_rgba(15,46,26,0.12)] [animation-delay:420ms] sm:hidden">
              <Image
                alt="Fresh vegetables, spices, rice, tea, snacks, and pantry staples at A1 Haat Bazar"
                className="h-full w-full object-cover object-[center_46%]"
                fill
                priority
                sizes="100vw"
                src="/brand/a1-pantry-hero.webp"
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-20 bg-[linear-gradient(0deg,rgba(15,46,26,0.76)_0%,rgba(15,46,26,0.46)_52%,rgba(15,46,26,0)_100%)]"
              />
              <div
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-full w-3/4 bg-[linear-gradient(90deg,rgba(15,46,26,0.42)_0%,rgba(15,46,26,0)_100%)]"
              />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-cta-soft">Fresh stock today</p>
                <p className="mt-1 max-w-56 text-sm font-bold leading-5">Pickup, local delivery, and weekly grocery offers.</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <HeroVisual />
          </div>
        </div>
      </section>

      <A1PromiseBar />

      <section className="a1-section-reveal mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading
          action="Browse all"
          description="Choose from pantry staples, spices, fresh vegetables, frozen favourites, snacks, drinks, and more."
          eyebrow="Shop by category"
          href="/products"
          title="Find what you need quickly"
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {categories.map((category) => (
            <CategoryCard category={category} key={category.id} />
          ))}
        </div>
      </section>

      <WeeklyOffersCarousel products={activeWeeklyOffers} />

      {stripBanner ? (
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <Link
            className="block rounded-lg border border-cta/30 bg-cta-soft p-5 shadow-sm transition-colors hover:border-cta focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href={stripBanner.linkUrl ?? "/products?sale=on"}
          >
            <p className="text-sm font-bold uppercase text-cta-hover">Store offer</p>
            <h2 className="mt-1 text-2xl font-extrabold text-text">{stripBanner.title}</h2>
            {stripBanner.subtitle ? <p className="mt-2 text-sm text-text-muted">{stripBanner.subtitle}</p> : null}
          </Link>
        </section>
      ) : null}

      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="a1-section-reveal relative min-h-[440px] overflow-hidden rounded-lg border border-border bg-surface shadow-[0_20px_70px_rgba(15,46,26,0.11)]">
            <Image
              alt="Fresh vegetables and herbs for curries, dal, momo nights, and everyday meals"
              className="absolute inset-0 h-full w-full object-cover"
              height={900}
              src="/brand/a1-fresh-vegetables.webp"
              width={1200}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.75)_42%,rgba(255,255,255,0.05)_100%)]" />
            <div className="relative z-10 flex min-h-[440px] flex-col justify-between p-6 sm:p-8 lg:max-w-[58%]">
              <div className="max-w-md">
                <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-fresh">Fresh vegetables daily</p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight text-primary sm:text-4xl">
                  Fresh produce for curries, dal, momo nights, and everyday meals.
                </h2>
                <p className="mt-3 text-sm leading-6 text-text-muted">
                  Availability changes with fresh stock. Choose delivery or free store pickup at checkout.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="a1-primary-button px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href="/category/vegetables"
                >
                  Shop fresh vegetables
                </Link>
                <Link
                  className="a1-secondary-button px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href="/products?freshVegetables=on"
                >
                  View today&apos;s produce
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <SectionHeading
              action="Shop fresh"
              description="Compact weekly produce picks with clear pack sizes, stock, and easy product details."
              eyebrow="Today's fresh picks"
              href="/category/vegetables"
              title="Fresh vegetables ready for your basket"
            />
            <ProductGrid emptyTitle="Fresh vegetables coming soon" products={freshVegetables} />
          </div>
        </div>
      </section>

      <section className="a1-section-reveal mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading
          action="Shop featured"
          eyebrow="Featured products"
          href="/products?sort=popular"
          title="Pantry picks worth a look"
        />
        <ProductGrid products={featuredProducts.slice(0, 8)} />
      </section>

      <section className="bg-background">
        <div className="a1-section-reveal mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Best sellers" title="Popular with local shoppers" />
          <ProductGrid emptyTitle="No best sellers yet" products={bestSellers.slice(0, 8)} />
        </div>
      </section>

      <TrustSection />

      <StoreLocationSection />

      <section className="a1-section-reveal mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#1F5A2E_0%,#12391F_55%,#0F2E1A_100%)] px-3 py-5 text-white shadow-[0_24px_70px_rgba(15,46,26,0.28)] sm:p-8 lg:p-9">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cta/15 blur-2xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-fresh/25 blur-2xl" aria-hidden="true" />
          <div className="relative grid gap-6 lg:grid-cols-[1.2fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cta-soft">Shop faster next time</p>
              <h2 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
                Create a free account and check out in seconds.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/85">
                Track orders, save delivery addresses, and keep a wishlist of your favourite staples - all in one place.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:justify-self-end lg:flex-col">
              <Link
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-cta px-7 text-sm font-extrabold text-white shadow-[0_14px_32px_rgba(198,146,46,0.4)] transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto lg:w-full"
                href="/login?mode=register"
              >
                Create free account
              </Link>
              <Link
                className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/30 px-7 text-sm font-extrabold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto lg:w-full"
                href="/products?sale=on"
              >
                Browse weekly offers
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
