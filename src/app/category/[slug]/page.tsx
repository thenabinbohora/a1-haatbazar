import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListingShell } from "@/components/product/product-listing-shell";
import {
  getCategoryBySlug,
  getPublicProducts,
  getStorefrontFilters,
  normalizeStorefrontSearchParams,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category not found",
    };
  }

  return {
    title: category.name,
    description: category.description ?? `Browse ${category.name} groceries and pantry essentials.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, rawSearchParams] = await Promise.all([params, searchParams]);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const query = normalizeStorefrontSearchParams(rawSearchParams);
  const [products, filters] = await Promise.all([
    getPublicProducts(query, { categorySlug: category.slug }),
    getStorefrontFilters(),
  ]);

  return (
    <ProductListingShell
      categoryLinks={category.children}
      description={category.description ?? `Browse ${category.name} groceries with current stock, offers, and variant pricing.`}
      eyebrow="Category"
      filters={filters}
      lockedCategorySlug={category.slug}
      products={products}
      title={category.name}
      values={query}
    />
  );
}
