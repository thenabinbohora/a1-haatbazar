import type { Metadata } from "next";
import Link from "next/link";
import { CategoryCard } from "@/components/category/category-card";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";
import { getStorefrontCategories } from "@/lib/storefront";

export const revalidate = 60;

const title = "Shop Grocery Categories | A1 Haat Bazar Salisbury";
const description =
  "Browse authentic Nepali groceries, Indian products, Asian pantry staples, rice, lentils, spices, noodles, frozen foods, snacks, tea and fresh vegetables from A1 Haat Bazar in Salisbury, Adelaide.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    title,
    description,
    url: "/categories",
  },
};

export default async function CategoriesPage() {
  const categories = (await getStorefrontCategories()).filter((category) => category.parentId === null);
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: absoluteUrl("/categories"),
      },
    ],
  };
  const categoryListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "A1 Haat Bazar grocery categories",
    numberOfItems: categories.length,
    itemListElement: categories.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: category.name,
      url: absoluteUrl(`/category/${category.slug}`),
    })),
  };

  return (
    <div className="bg-background">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={categoryListSchema} />

      <section className="border-b border-border bg-hero">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm font-semibold text-text-muted">
              <li>
                <Link
                  className="inline-flex min-h-11 items-center rounded-lg underline decoration-primary/20 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  href="/"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-text">
                Categories
              </li>
            </ol>
          </nav>

          <div className="mt-5 max-w-3xl">
            <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-cta-hover">Shop by category</p>
            <h1 className="mt-2 text-3xl font-black leading-tight tracking-[-0.025em] text-text sm:text-5xl">
              Find your aisle
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-muted sm:text-base sm:leading-7">
              Browse authentic Nepali groceries, Indian favourites, Asian pantry staples, fresh vegetables, frozen foods,
              snacks, beverages, and more.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="category-directory-heading" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-fresh">All departments</p>
            <h2 className="mt-2 text-2xl font-extrabold text-text sm:text-3xl" id="category-directory-heading">
              Browse every category
            </h2>
          </div>
          <Link
            className="inline-flex min-h-11 w-fit items-center rounded-full border border-primary/15 bg-surface px-4 text-sm font-extrabold text-primary shadow-sm transition-[border-color,background-color] duration-200 hover:border-primary/35 hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href="/products"
            prefetch={false}
          >
            Shop all groceries
          </Link>
        </div>

        <ul className="grid auto-rows-fr grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map((category) => (
            <li className="min-w-0" key={category.id}>
              <CategoryCard
                category={category}
                headingLevel="h3"
                imageSizes="(max-width: 767px) 46vw, (max-width: 1023px) 31vw, (max-width: 1279px) 23vw, 220px"
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
