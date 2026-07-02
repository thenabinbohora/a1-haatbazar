import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { ProductGrid } from "@/components/product/product-grid";
import {
  getProductDetailBySlug,
  getPublicProducts,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ variant?: string | string[] }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetailBySlug(slug);

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params, searchParams }: ProductDetailPageProps) {
  const { slug } = await params;
  const selectedVariantParam = (await searchParams)?.variant;
  const selectedVariant = Array.isArray(selectedVariantParam) ? selectedVariantParam[0] : selectedVariantParam;
  const product = await getProductDetailBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (await getPublicProducts({ sort: "popular" }, { categorySlug: product.category.slug, take: 9 }))
    .filter((item) => item.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-text-muted" aria-label="Breadcrumb">
            <Link className="font-semibold hover:text-text" href="/">
              Home
            </Link>
            <span>/</span>
            <Link className="font-semibold hover:text-text" href="/products">
              Products
            </Link>
            <span>/</span>
            <Link className="font-semibold hover:text-text" href={`/category/${product.category.slug}`} scroll>
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="font-semibold text-text">{product.name}</span>
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <ProductDetailView initialVariant={selectedVariant} product={product} />
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-fresh">Related products</p>
              <h2 className="mt-1 text-3xl font-bold text-text">More from {product.category.name}</h2>
            </div>
            <Link className="text-sm font-semibold text-cta-hover hover:text-cta" href={`/category/${product.category.slug}`} scroll>
              View category
            </Link>
          </div>
          <ProductGrid
            emptyDescription="Add more active products in this category to show recommendations."
            emptyTitle="No related products yet"
            products={relatedProducts}
            variant="related"
          />
        </div>
      </section>
    </div>
  );
}
