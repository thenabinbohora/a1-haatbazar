import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { ProductGrid } from "@/components/product/product-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/lib/site";
import {
  getProductDetailBySlug,
  getPublicProducts,
  type StorefrontProductDetail,
} from "@/lib/storefront";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ variant?: string | string[] }>;
};

function metaDescription(text: string) {
  const compact = text.replace(/\s+/g, " ").trim();
  return compact.length > 158 ? `${compact.slice(0, 157).trimEnd()}…` : compact;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetailBySlug(slug);

  if (!product) {
    return {
      title: "Product not found",
      robots: { index: false },
    };
  }

  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
  const description = metaDescription(product.description);

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/products/${product.slug}`,
      images: primaryImage ? [{ url: primaryImage.url, alt: primaryImage.altText }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: primaryImage ? [primaryImage.url] : undefined,
    },
  };
}

function buildProductSchema(product: StorefrontProductDetail) {
  const sellableVariants = product.variants.filter((variant) => variant.isAvailable && variant.stock > 0);
  const pricedVariants = sellableVariants.length ? sellableVariants : product.variants;
  const prices = pricedVariants.map((variant) => variant.salePrice ?? variant.price);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: metaDescription(product.description),
    image: product.images.map((image) => image.url),
    sku: product.variants[0]?.sku,
    category: product.category.name,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    offers: prices.length
      ? {
          "@type": "AggregateOffer",
          priceCurrency: product.variants[0]?.currency ?? "AUD",
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: pricedVariants.length,
          availability: sellableVariants.length ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          url: absoluteUrl(`/products/${product.slug}`),
        }
      : undefined,
  };
}

function buildBreadcrumbSchema(product: StorefrontProductDetail) {
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    { name: product.category.name, path: `/category/${product.category.slug}` },
    { name: product.name, path: `/products/${product.slug}` },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
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
      <JsonLd data={buildProductSchema(product)} />
      <JsonLd data={buildBreadcrumbSchema(product)} />
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
