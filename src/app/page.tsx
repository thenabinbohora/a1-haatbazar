import Image from "next/image";
import Link from "next/link";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { WeeklyOffersCarousel } from "@/components/home/weekly-offers-carousel";
import { ProductGrid } from "@/components/product/product-grid";
import { STORE_CONFIG } from "@/config/store";
import {
  getActiveHomeBanners,
  getFeaturedCategories,
  getPublicProducts,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

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
      <div className="p-4">
        <h3 className="text-base font-bold text-text">{category.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-text-muted">
          {category.description ?? "Authentic pantry staples, fresh essentials, and weekly grocery picks."}
        </p>
        <p className="mt-3 text-sm font-bold text-primary">{category._count.products} products</p>
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
      <section className="border-y border-border bg-[linear-gradient(180deg,#FAF8F1_0%,#F2F6EE_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-8">
          <div className="a1-no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 md:grid-cols-3 lg:grid-cols-5">
            {promises.map((promise, index) => (
              <div
                className="group flex min-h-[6rem] min-w-[17.5rem] snap-start items-start gap-3 rounded-lg border border-primary/10 bg-white px-4 py-4 text-primary shadow-[0_10px_28px_rgba(15,46,26,0.055)] transition-[border-color,box-shadow,transform] duration-200 sm:min-w-0 lg:min-h-[6.25rem] lg:hover:-translate-y-0.5 lg:hover:border-cta/25 lg:hover:shadow-[0_14px_34px_rgba(15,46,26,0.095)]"
                key={promise.label}
              >
              <span
                className="a1-promise-icon-float flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-primary text-white shadow-[0_6px_14px_rgba(15,46,26,0.14)] transition-colors duration-200 group-hover:bg-primary-muted"
                style={{ animationDelay: `${index * 420}ms` }}
              >
                <PromiseIcon type={promise.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-extrabold leading-5 text-primary">{promise.label}</span>
                  <span className="mt-1 block line-clamp-2 text-xs font-semibold leading-5 text-text-muted">
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
      label: "Opening hours",
      value: STORE_CONFIG.openingHours,
    },
    {
      icon: "pickup",
      label: "Store pickup",
      value: STORE_CONFIG.pickupMessage,
    },
    {
      icon: "truck",
      label: "Local delivery",
      value: STORE_CONFIG.deliveryMessage,
    },
    {
      icon: "wallet",
      label: "Payment",
      value: STORE_CONFIG.paymentMessage,
    },
  ] as const;

  return (
    <section className="border-b border-border bg-[linear-gradient(180deg,#FAF8F1_0%,#F2F6EE_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <SectionHeading
          description="Shop online for delivery or choose store pickup at checkout."
          eyebrow="Store pickup location"
          title="Visit A1 Haat Bazar"
        />
        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
          <div className="rounded-lg border border-border bg-surface p-5 shadow-[0_14px_42px_rgba(15,46,26,0.08)] sm:p-6">
            <p className="text-sm font-bold uppercase text-fresh">Local Salisbury store</p>
            <h3 className="mt-2 text-2xl font-extrabold text-primary">{STORE_CONFIG.storeName}</h3>
            <div className="mt-5 space-y-4">
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
              className="a1-primary-button mt-6 w-full px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:w-auto"
              href={STORE_CONFIG.directionsUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              Get directions
            </a>
          </div>

          <div className="min-h-[280px] overflow-hidden rounded-lg border border-border bg-surface shadow-[0_14px_42px_rgba(15,46,26,0.08)] sm:min-h-[320px] lg:min-h-[350px]">
            <iframe
              className="h-full min-h-[280px] w-full border-0 sm:min-h-[320px] lg:min-h-[350px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={STORE_CONFIG.mapEmbedUrl}
              title="A1 Haat Bazar location map"
            />
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
        <Link className="text-sm font-bold text-cta-hover transition-colors hover:text-primary" href={href}>
          {action}
        </Link>
      ) : null}
    </div>
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

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-hero">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-bold uppercase text-fresh">A1 Haat Bazar Authentic Groceries</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-text sm:text-5xl">
              Authentic Nepali groceries, fresh vegetables, and daily essentials all in one place.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-text-muted sm:text-lg">
              Shop rice, lentils, spices, pickles, snacks, frozen foods, fresh produce, and weekly offers from A1 Haat
              Bazar.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link className="a1-primary-button px-6 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" href="/products">
                Shop groceries
              </Link>
              <Link
                className="a1-secondary-button px-6 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                href="/products?sale=on"
              >
                View weekly offers
              </Link>
            </div>

            <form action="/search" className="mt-7 max-w-2xl" role="search">
              <label className="mb-2 block text-sm font-bold text-text" htmlFor="home-search">
                Search groceries
              </label>
              <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-2 shadow-sm sm:flex-row">
                <input
                  className="min-h-12 flex-1 rounded-md border border-transparent bg-background px-4 text-base text-text placeholder:text-text-muted focus:border-cta"
                  id="home-search"
                  name="q"
                  placeholder="Search rice, masala, noodles, tea"
                  type="search"
                />
                <button
                  className="a1-primary-button cursor-pointer px-6 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  type="submit"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          <HeroVisual />
        </div>
      </section>

      <A1PromiseBar />

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

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading
          action="Browse all"
          description="Choose from pantry staples, spices, fresh vegetables, frozen favourites, snacks, drinks, and more."
          eyebrow="Shop by category"
          href="/products"
          title="Find what you need quickly"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => (
            <CategoryCard category={category} key={category.id} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="a1-reveal relative min-h-[440px] overflow-hidden rounded-lg border border-border bg-surface shadow-[0_20px_70px_rgba(15,46,26,0.11)]">
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

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeading
          action="Shop featured"
          eyebrow="Featured products"
          href="/products?sort=popular"
          title="Pantry picks worth a look"
        />
        <ProductGrid products={featuredProducts.slice(0, 8)} />
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Best sellers" title="Popular with local shoppers" />
          <ProductGrid emptyTitle="No best sellers yet" products={bestSellers.slice(0, 8)} />
        </div>
      </section>

      <section className="border-y border-border bg-fresh-soft">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Why shop with A1 Haat Bazar?" title="A local grocery experience built on trust" />
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Fresh stock updated regularly", "Browse clear stock states before adding groceries to your cart."],
              ["Local delivery", "Choose delivery at checkout and our team will confirm details with you."],
              ["Store pickup", "Pickup is free. We will contact you when your order is ready."],
              ["Secure account", "Save addresses, manage wishlist items, and track your order history."],
            ].map(([title, text]) => (
              <div className="rounded-lg border border-border bg-surface p-5" key={title}>
                <h3 className="text-base font-bold text-text">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StoreLocationSection />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-lg border border-cta/20 bg-[linear-gradient(135deg,#FBF4E3_0%,#FFFFFF_70%,#FAF8F1_100%)] p-5 shadow-sm sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-end">
            <div className="relative">
              <p className="text-sm font-bold uppercase text-fresh">Offer updates</p>
              <h2 className="mt-2 text-3xl font-extrabold text-primary">Weekly pantry offers and new arrivals.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
                Newsletter signup is coming soon. For now, browse weekly offers and best sellers directly from the catalog.
              </p>
            </div>
            <form className="relative flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                className="min-h-12 flex-1 rounded-md border border-white/20 bg-white px-4 text-sm text-text placeholder:text-text-muted"
                disabled
                id="newsletter-email"
                placeholder="Newsletter coming soon"
                type="email"
              />
              <button
                className="a1-primary-button cursor-not-allowed px-5 text-sm opacity-80"
                disabled
                type="button"
              >
                Coming soon
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
