import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CategoryCard } from "@/components/category/category-card";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, BRAND_LOGO_SRC, SUPPORT_EMAIL } from "@/lib/constants";
import { absoluteUrl, getSiteUrl } from "@/lib/site";
import { SectionViewAllLink } from "@/components/home/section-view-all-link";
import { StoreLocationMap } from "@/components/home/store-location-map";
import { WeeklyOffersCarousel } from "@/components/home/weekly-offers-carousel";
import { SearchBox } from "@/components/search/search-box";
import { ProductGrid } from "@/components/product/product-grid";
import { STORE_CONFIG } from "@/config/store";
import {
  getActiveHomeBanners,
  getHomeFeaturedCategories,
  getPublicProducts,
} from "@/lib/storefront";

export const revalidate = 60;

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
    ...STORE_CONFIG.postalAddress,
  },
  geo: {
    "@type": "GeoCoordinates",
    ...STORE_CONFIG.coordinates,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: STORE_CONFIG.openingHoursSpecification.days,
      opens: STORE_CONFIG.openingHoursSpecification.opens,
      closes: STORE_CONFIG.openingHoursSpecification.closes,
    },
  ],
  areaServed: ["Salisbury", "Adelaide", "South Australia"],
  hasMap: STORE_CONFIG.directionsUrl,
};

function PromiseIcon({ type }: { type: "leaf" | "basket" | "tag" | "truck" }) {
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
    <div className="a1-reveal relative hidden h-[360px] overflow-hidden rounded-2xl border border-primary/10 bg-surface shadow-xl shadow-primary/10 md:block lg:h-full lg:min-h-[560px]">
      <Image
        alt="A1 Haat Bazar grocery spread with rice, spices, fresh vegetables, tea, snacks, and momos"
        className="h-full w-full object-cover"
        fill
        sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 48px), 48vw"
        src="/brand/a1-pantry-hero.webp"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/5 to-transparent lg:bg-gradient-to-r lg:from-primary/30 lg:via-transparent lg:to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-6 lg:p-7">
        <div className="max-w-md rounded-xl border border-white/25 bg-surface/95 p-3 shadow-lg backdrop-blur sm:rounded-2xl sm:p-5">
          <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-cta-hover">A better local grocery run</p>
          <h2 className="mt-1 text-lg font-extrabold leading-tight text-primary sm:mt-2 sm:text-3xl">
            From familiar pantry staples to market-fresh produce.
          </h2>
          <p className="mt-2 hidden text-sm leading-6 text-text-muted sm:block">
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
  ] as const;

  return (
    <section aria-label="Store promises" className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 lg:py-5">
        <div className="grid auto-rows-fr grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
          {promises.map((promise) => (
            <div
              className={[
                "group flex min-h-14 min-w-0 w-full items-center gap-2 rounded-xl border border-primary/10 bg-surface p-2 shadow-sm",
                "lg:min-h-0 lg:w-auto lg:items-start lg:gap-2.5 lg:border-border lg:px-3 lg:py-3",
              ].join(" ")}
              key={promise.label}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-transform duration-200 ease-out lg:group-hover:-translate-y-0.5 motion-reduce:transition-none">
                <PromiseIcon type={promise.icon} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-extrabold leading-5 text-primary min-[380px]:text-sm lg:whitespace-normal">
                  {promise.label}
                </span>
                <span className="mt-0.5 hidden text-sm leading-5 text-text-muted lg:block">
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
    <section className="bg-hero">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <SectionHeading
          description="Find us in Salisbury for store pickup, fresh groceries, and weekly essentials."
          eyebrow="Store pickup location"
          title="Visit our store"
        />
        <div className="a1-section-reveal grid gap-5 md:grid-cols-[minmax(300px,0.82fr)_minmax(0,1.18fr)] md:items-stretch">
          <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7 lg:p-8">
            <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-cta-hover">Local Salisbury store</p>
            <h3 className="mt-2 text-2xl font-extrabold text-primary sm:text-3xl">{STORE_CONFIG.storeName}</h3>
            <div className="mt-5 space-y-4 lg:mt-6">
              {storeDetails.map((detail) => (
                <div className="flex gap-3.5" key={detail.label}>
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fresh-soft text-fresh">
                    <LocationIcon type={detail.icon} />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-text">{detail.label}</p>
                    {detail.label === "Address" ? (
                      <address className="mt-0.5 text-[0.95rem] not-italic leading-6 text-text-muted">{detail.value}</address>
                    ) : (
                      <p className="mt-0.5 text-[0.95rem] leading-6 text-text-muted">{detail.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto pt-6">
              <a
                aria-label={`Get directions to ${STORE_CONFIG.storeName} in Google Maps`}
                className="a1-primary-button w-full gap-2 px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta lg:w-auto"
                href={STORE_CONFIG.directionsUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <LocationIcon type="pin" />
                Get directions
              </a>
            </div>
          </div>

          <StoreLocationMap />
        </div>
      </div>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  titleId,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  titleId?: string;
}) {
  return (
    <div className="mb-6 sm:mb-7">
      <div className="max-w-3xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-cta-hover">{eyebrow}</p>
        <h2
          className="mt-2 text-2xl font-extrabold leading-tight text-text sm:text-4xl"
          id={titleId}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted sm:mt-3 sm:text-base sm:leading-7">
            {description}
          </p>
        ) : null}
      </div>
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
    <section className="bg-background">
      <div className="a1-section-reveal mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-6 lg:px-8 lg:py-16">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-4 py-6 text-white shadow-xl shadow-primary/15 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cta/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-fresh/30 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <div>
              <p className="max-w-full text-sm font-extrabold uppercase leading-5 tracking-[0.12em] text-cta-soft">
                Why shop with A1 Haat Bazar?
              </p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:mt-3 sm:text-4xl">
                A local grocery experience built around confidence.
              </h2>
              <p className="mt-4 hidden max-w-xl text-base leading-7 text-white/75 sm:block">
                Clear stock, practical fulfilment options, and familiar groceries make every basket easier to plan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {trustCards.map((card) => (
                <article
                  className="group rounded-2xl border border-white/15 bg-white/10 p-3 transition-colors duration-200 hover:bg-white/15 motion-reduce:transition-none sm:p-5 sm:backdrop-blur-sm"
                  key={card.title}
                >
                  <div className="flex flex-col items-start gap-2.5 sm:flex-row sm:gap-3.5">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cta-soft text-cta-hover shadow-sm sm:h-11 sm:w-11">
                      <TrustIcon type={card.icon} />
                    </span>
                    <div className="min-w-0">
                      <p className="hidden text-sm font-extrabold uppercase tracking-[0.08em] text-cta-soft sm:block">{card.label}</p>
                      <h3 className="text-sm font-extrabold leading-5 text-white sm:mt-1 sm:text-lg sm:leading-6">{card.title}</h3>
                      <p className="mt-1 hidden text-sm leading-6 text-white/70 sm:block">{card.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [categories, featuredProducts, bestSellers, weeklyOffers, freshVegetables, banners] = await Promise.all([
    getHomeFeaturedCategories(),
    getPublicProducts({}, { featured: true, take: 4 }),
    getPublicProducts({ sort: "popular" }, { bestSeller: true, take: 4 }),
    getPublicProducts({ inStock: "on", sale: "on", sort: "offers" }, { weeklyOffer: true, take: 8 }),
    getPublicProducts({}, { categorySlug: "vegetables", take: 4 }),
    getActiveHomeBanners(),
  ]);

  const stripBanner = banners.find((banner) => banner.placement === "HOME_STRIP");
  const activeWeeklyOffers = weeklyOffers.filter((product) => product.isWeeklyOffer && product.isOnSale);

  return (
    <div className="overflow-x-clip bg-background">
      <JsonLd data={groceryStoreSchema} />
      <section className="relative overflow-hidden border-b border-border bg-hero">
        <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-cta-soft/70 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-fresh-soft blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid min-w-0 max-w-7xl gap-4 px-4 py-4 sm:px-6 sm:py-10 md:gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-10 lg:px-8 lg:py-14">
          <div className="min-w-0 self-center">
            <p className="a1-reveal text-xs font-extrabold uppercase tracking-[0.13em] text-cta-hover sm:text-sm">
              Your Salisbury neighbourhood grocer
            </p>
            <h1 className="a1-reveal mt-2 max-w-3xl text-[1.9rem] font-extrabold leading-[1.08] text-text [animation-delay:80ms] sm:mt-4 sm:text-5xl sm:leading-[1.08] xl:text-[3.6rem]">
              <span className="md:hidden">Authentic groceries, ready when you are.</span>
              <span className="hidden md:inline">Authentic Nepali groceries and fresh everyday essentials, all in one basket.</span>
            </h1>
            <p className="a1-reveal mt-3 hidden max-w-2xl text-base leading-7 text-text-muted [animation-delay:160ms] md:block md:text-lg md:leading-8">
              Fill your pantry with rice, dal, spices, snacks, frozen favourites, fresh produce, and weekly offers from a local store you know.
            </p>

            <div className="a1-reveal mt-5 hidden max-w-2xl [animation-delay:240ms] md:block md:mt-7">
              <SearchBox placeholder="Search rice, masala, tea" variant="hero" />
            </div>

            <nav
              aria-label="Popular grocery searches"
              className="a1-reveal mt-2 flex max-w-2xl flex-wrap items-center gap-y-0 text-[13px] leading-6 text-text-muted [animation-delay:280ms] md:mt-1 md:text-sm"
            >
              <span className="mr-1 font-bold">Popular:</span>
              {["Basmati rice", "Momo masala", "Wai Wai", "Tea"].map((term, index) => (
                <span className="inline-flex items-center" key={term}>
                  {index > 0 ? <span aria-hidden="true" className="mx-1.5 text-text-muted/65">&middot;</span> : null}
                  <Link
                    aria-label={`Search groceries for ${term}`}
                    className="inline-flex min-h-9 items-center rounded-sm py-1 font-semibold text-primary/85 decoration-primary/35 underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:text-primary focus-visible:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cta"
                    href={`/search?q=${encodeURIComponent(term)}`}
                    prefetch={false}
                  >
                    {term}
                  </Link>
                </span>
              ))}
            </nav>

            <div className="mt-2 grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:gap-3 md:mt-5">
              <Link className="a1-primary-button min-h-12 px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:px-7" href="/products" prefetch={false}>
                Shop groceries
              </Link>
              <Link
                className="a1-secondary-button min-h-12 px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:px-7"
                href="/products?sale=on"
                prefetch={false}
              >
                <span className="md:hidden">Weekly offers</span>
                <span className="hidden md:inline">See weekly offers</span>
              </Link>
            </div>

            <div className="mt-4 hidden flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-text-muted md:flex md:mt-6">
              <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-fresh" />{STORE_CONFIG.openingHours}</span>
              <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-2 w-2 rounded-full bg-cta" />Free store pickup</span>
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      <A1PromiseBar />

      <section aria-labelledby="home-category-heading" className="a1-section-reveal mx-auto max-w-7xl px-4 pb-8 pt-5 sm:px-6 sm:pb-10 sm:pt-14 lg:px-8 lg:py-16">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-6">
          <div className="order-1 lg:col-start-1 lg:row-start-1">
            <SectionHeading
              description="Choose from pantry staples, spices, fresh vegetables, frozen favourites, snacks, drinks, and more."
              eyebrow="Shop by category"
              title="Start with the aisle you know"
              titleId="home-category-heading"
            />
          </div>
          <div className="order-2 grid min-w-0 auto-rows-fr grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:col-span-2 lg:row-start-2">
            {categories.map((category) => (
              <CategoryCard
                category={category}
                imageSizes="(max-width: 767px) 46vw, (max-width: 1279px) 23vw, 292px"
                key={category.id}
              />
            ))}
          </div>
          <SectionViewAllLink
            accessibleLabel="View all grocery categories"
            href="/categories"
            label="View all categories"
          />
        </div>
      </section>

      <WeeklyOffersCarousel products={activeWeeklyOffers} />

      {stripBanner ? (
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
          <Link
            className="group flex flex-col gap-4 rounded-2xl border border-cta/25 bg-cta-soft p-5 shadow-sm transition-[border-color,box-shadow] hover:border-cta/50 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:flex-row sm:items-center sm:justify-between sm:p-6"
            href={stripBanner.linkUrl ?? "/products?sale=on"}
            prefetch={false}
          >
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-cta-hover">Store offer</p>
              <h2 className="mt-1.5 text-2xl font-extrabold text-text sm:text-3xl">{stripBanner.title}</h2>
              {stripBanner.subtitle ? <p className="mt-2 text-base text-text-muted">{stripBanner.subtitle}</p> : null}
            </div>
            <span className="inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white transition-colors group-hover:bg-primary-muted">
              Explore offer
              <svg aria-hidden="true" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </span>
          </Link>
        </section>
      ) : null}

      <section className="bg-surface-muted">
        <div className="mx-auto max-w-7xl px-4 pb-4 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:py-16">
          <div className="a1-section-reveal relative min-h-[280px] overflow-hidden rounded-2xl border border-primary/10 bg-primary shadow-xl shadow-primary/10 sm:min-h-[500px]">
            <Image
              alt="Fresh vegetables and herbs for curries, dal, momo nights, and everyday meals"
              className="h-full w-full object-cover"
              fill
              sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1279px) calc(100vw - 48px), 1216px"
              src="/brand/a1-fresh-vegetables.webp"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/10" />
            <div className="relative z-10 flex min-h-[280px] flex-col justify-between p-5 text-white sm:min-h-[500px] sm:p-8 lg:max-w-[60%] lg:p-10">
              <div className="max-w-xl">
                <p className="text-sm font-extrabold uppercase tracking-[0.13em] text-cta-soft">Fresh vegetables daily</p>
                <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:mt-3 sm:text-5xl">
                  Fresh produce for curries, dal, momo nights, and everyday meals.
                </h2>
                <p className="mt-4 hidden max-w-lg text-base leading-7 text-white/75 sm:block">
                  Availability changes with fresh stock. Choose delivery or free store pickup at checkout.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="a1-fresh-banner-primary inline-flex min-h-12 items-center justify-center rounded-xl px-5 text-sm"
                  href="/category/vegetables"
                  prefetch={false}
                >
                  Shop fresh vegetables
                </Link>
                <Link
                  className="a1-fresh-banner-secondary hidden min-h-12 items-center justify-center rounded-xl border px-5 text-sm backdrop-blur-sm sm:inline-flex"
                  href="/products?freshVegetables=on&inStock=on"
                  prefetch={false}
                >
                  View today&apos;s produce
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-10">
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-6">
              <div className="order-1 lg:col-start-1 lg:row-start-1">
                <SectionHeading
                  description="Browse current produce picks with clear pack sizes, stock, and easy product details."
                  eyebrow="Today's fresh picks"
                  title="Fresh vegetables ready for your basket"
                />
              </div>
              <div className="order-2 min-w-0 lg:col-span-2 lg:row-start-2">
                <ProductGrid emptyTitle="Fresh vegetables coming soon" priorityImageCount={0} products={freshVegetables} variant="compactGrid" />
              </div>
              <SectionViewAllLink
                accessibleLabel="View all fresh vegetables"
                href="/category/vegetables"
                label="View all vegetables"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="a1-section-reveal mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-6 sm:pb-4 sm:pt-6 lg:px-8 lg:py-16">
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-6">
            <div className="order-1 lg:col-start-1 lg:row-start-1">
              <SectionHeading
                description="A rotating edit of pantry staples, comforting favourites, and useful finds for the week ahead."
                eyebrow="Featured products"
                title="Pantry picks worth a look"
              />
            </div>
            <div className="order-2 min-w-0 lg:col-span-2 lg:row-start-2">
              <ProductGrid priorityImageCount={0} products={featuredProducts} variant="featuredGrid" />
            </div>
            <SectionViewAllLink
              accessibleLabel="View all featured products"
              href="/products?sort=popular"
              label="View all featured products"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="a1-section-reveal mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-6 sm:pb-4 sm:pt-6 lg:px-8 lg:py-16">
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-6">
            <div className="order-1 lg:col-start-1 lg:row-start-1">
              <SectionHeading
                description="Reliable staples and familiar favourites that regularly make it into local baskets."
                eyebrow="Best sellers"
                title="Popular with local shoppers"
              />
            </div>
            <div className="order-2 min-w-0 lg:col-span-2 lg:row-start-2">
              <ProductGrid
                emptyTitle="No best sellers yet"
                priorityImageCount={0}
                products={bestSellers}
                variant="bestSellersGrid"
              />
            </div>
            <SectionViewAllLink
              accessibleLabel="View all best sellers"
              href="/products?sort=popular"
              label="View all best sellers"
            />
          </div>
        </div>
      </section>

      <TrustSection />

      <StoreLocationSection />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="relative overflow-clip rounded-2xl bg-primary px-5 py-6 text-white shadow-xl shadow-primary/15 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-cta/20 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-fresh/30 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-5 lg:grid-cols-[1.2fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-cta-soft">Shop faster next time</p>
              <h2 className="mt-2 max-w-xl text-2xl font-extrabold leading-tight sm:mt-3 sm:text-4xl">
                Create a free account and check out in seconds.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
                Save your delivery details, track orders, and keep your favourites in one place.
              </p>
            </div>
            <div className="w-full lg:w-auto lg:justify-self-end">
              <Link
                className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#E6CF9B] bg-[#FBF4E3] px-6 text-sm font-bold !text-[#174A27] shadow-[0_10px_24px_rgba(4,26,16,0.18)] transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-[#D7B76F] hover:bg-[#F4E7CA] hover:shadow-[0_14px_28px_rgba(4,26,16,0.22)] active:translate-y-0 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#F1C27D] motion-reduce:transform-none motion-reduce:transition-none sm:w-auto lg:min-w-[220px]"
                href="/login?mode=register&next=%2F"
                prefetch={false}
              >
                <span>Create free account</span>
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14m-6-6 6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
