import type { Prisma } from "@prisma/client";
import { cache } from "react";
import { HOME_FEATURED_CATEGORY_SLUGS } from "@/config/categories";
import { prisma } from "@/lib/prisma";
import { customerImageUrl } from "@/lib/customer-images";
import { customerImageAlt, customerProductName } from "@/lib/display";
import {
  filterAndSortStorefrontProducts,
  normalizeStorefrontSearchParams,
  type ProductCollection,
  type StorefrontSearchParams,
} from "@/lib/product-filter-state";
import { sanitizeSlug } from "@/lib/slug";

export { normalizeStorefrontSearchParams };
export type { ProductCollection, StorefrontSearchParams };

type StorefrontProductRecord = Prisma.ProductGetPayload<{
  include: {
    category: { select: { id: true; name: true; slug: true } };
    brand: { select: { id: true; name: true; slug: true; country: true } };
    images: {
      orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }];
    };
    variants: {
      where: { status: "ACTIVE" };
      orderBy: [{ price: "asc" }, { createdAt: "asc" }];
    };
  };
}>;

export type StorefrontProductCard = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: { name: string; slug: string };
  brand?: { name: string; slug: string; country?: string | null } | null;
  imageUrl?: string | null;
  imageAlt: string;
  startingPrice: number;
  compareAtPrice?: number | null;
  currency: string;
  leadVariantId: string;
  leadVariantSku: string;
  leadVariantStock: number;
  variantLabel: string;
  variantCount: number;
  sellableVariantCount: number;
  discountedVariantCount: number;
  totalStock: number;
  isInStock: boolean;
  isOnSale: boolean;
  discountPercent?: number | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  isWeeklyOffer: boolean;
  searchTerms: string[];
  createdAt: Date;
};

export type StorefrontFilters = {
  categories: Array<{ id: string; name: string; slug: string; productCount: number }>;
  brands: Array<{ id: string; name: string; slug: string; country?: string | null }>;
  collectionCounts: {
    bestSellers: number;
    featured: number;
    onSale: number;
  };
};

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  productCount: number;
  displayOrder: number;
  isFeatured: boolean;
  isFeaturedOnHome: boolean;
};

export type StorefrontProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  ingredients?: string | null;
  storage?: string | null;
  origin?: string | null;
  allergens?: string | null;
  tags: string[];
  category: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string; country?: string | null } | null;
  images: Array<{
    id: string;
    url: string;
    altText: string;
    isPrimary: boolean;
    variantId?: string | null;
  }>;
  variants: Array<{
    id: string;
    sku: string;
    name: string;
    price: number;
    salePrice?: number | null;
    currency: string;
    stock: number;
    imageUrl?: string | null;
    isAvailable: boolean;
  }>;
  isFeatured: boolean;
  isBestSeller: boolean;
  isWeeklyOffer: boolean;
};

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true, country: true } },
  images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }] },
  variants: {
    where: { status: "ACTIVE" },
    orderBy: [{ price: "asc" }, { createdAt: "asc" }],
  },
} satisfies Prisma.ProductInclude;

function numberFromDecimal(value: unknown) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return Number(value.toString());
}

function effectiveVariantPrice(variant: StorefrontProductRecord["variants"][number]) {
  const price = numberFromDecimal(variant.price);
  const salePrice = variant.salePrice ? numberFromDecimal(variant.salePrice) : null;
  return salePrice && salePrice < price ? salePrice : price;
}

function hasValidSalePrice(variant: StorefrontProductRecord["variants"][number]) {
  const price = numberFromDecimal(variant.price);
  const salePrice = variant.salePrice ? numberFromDecimal(variant.salePrice) : null;

  return Boolean(salePrice && salePrice < price);
}

function toProductCard(product: StorefrontProductRecord): StorefrontProductCard | null {
  const variants = product.variants.filter((variant) => variant.status === "ACTIVE");

  if (variants.length === 0) {
    return null;
  }

  const sortedVariants = [...variants].sort((first, second) => effectiveVariantPrice(first) - effectiveVariantPrice(second));
  const sellableVariants = variants.filter((variant) => variant.stock > 0);
  const sortedSaleVariants = sortedVariants.filter(hasValidSalePrice);
  const sortedSellableSaleVariants = sortedSaleVariants.filter((variant) => variant.stock > 0);
  const leadVariant =
    sortedSellableSaleVariants.length > 0
      ? sortedSellableSaleVariants[0]
      : sortedSaleVariants.length > 0
        ? sortedSaleVariants[0]
        : sortedVariants[0];
  const startingPrice = effectiveVariantPrice(leadVariant);
  const leadPrice = numberFromDecimal(leadVariant.price);
  const compareAtPrice = leadVariant.salePrice && startingPrice < leadPrice ? leadPrice : null;
  const leadDiscountPercent = compareAtPrice ? Math.round(((compareAtPrice - startingPrice) / compareAtPrice) * 100) : null;
  const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
  const saleDiscounts = variants
    .map((variant) => {
      const price = numberFromDecimal(variant.price);
      const salePrice = variant.salePrice ? numberFromDecimal(variant.salePrice) : null;
      return salePrice && salePrice < price ? Math.round(((price - salePrice) / price) * 100) : 0;
    })
    .filter(Boolean);
  const primaryImage = product.images.find((image) => image.isPrimary && !image.variantId && customerImageUrl(image.url));
  const galleryImage = product.images.find((image) => !image.variantId && customerImageUrl(image.url));
  const variantImage = variants.map((variant) => customerImageUrl(variant.imageUrl)).find(Boolean);
  const image = primaryImage ?? galleryImage;

  const card = {
    id: product.id,
    name: customerProductName(product.name),
    slug: product.slug,
    description: product.description,
    category: product.category,
    brand: product.brand,
    imageUrl: customerImageUrl(image?.url) ?? variantImage ?? null,
    imageAlt: customerImageAlt(image?.altText, product.name),
    startingPrice,
    compareAtPrice,
    currency: leadVariant.currency,
    leadVariantId: leadVariant.id,
    leadVariantSku: leadVariant.sku,
    leadVariantStock: leadVariant.stock,
    variantLabel: leadVariant.name,
    variantCount: variants.length,
    sellableVariantCount: sellableVariants.length,
    discountedVariantCount: sortedSaleVariants.length,
    totalStock,
    isInStock: totalStock > 0,
    isOnSale: saleDiscounts.length > 0,
    discountPercent: leadDiscountPercent ?? (saleDiscounts.length ? Math.max(...saleDiscounts) : null),
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isWeeklyOffer: product.isWeeklyOffer,
    searchTerms: [
      ...product.tags,
      ...product.regionTags,
      ...product.dietaryTags,
    ].filter(Boolean),
    createdAt: product.createdAt,
  };

  return card;
}

const publicCategoryProductWhere = {
  status: "ACTIVE",
  variants: { some: { status: "ACTIVE" } },
} satisfies Prisma.ProductWhereInput;

export const getStorefrontCategories = cache(async (): Promise<StorefrontCategory[]> => {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      parentId: true,
      sortOrder: true,
      isFeatured: true,
      _count: { select: { products: { where: publicCategoryProductWhere } } },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    imageUrl: customerImageUrl(category.imageUrl),
    parentId: category.parentId,
    productCount: category._count.products,
    displayOrder: category.sortOrder,
    isFeatured: category.isFeatured,
    isFeaturedOnHome: HOME_FEATURED_CATEGORY_SLUGS.some((slug) => slug === category.slug),
  }));
});

export async function getHomeFeaturedCategories(): Promise<StorefrontCategory[]> {
  const categories = await getStorefrontCategories();
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));

  return HOME_FEATURED_CATEGORY_SLUGS.flatMap((slug) => {
    const category = categoryBySlug.get(slug);
    return category ? [category] : [];
  });
}

type StorefrontFilterScope = {
  categorySlug?: string;
  collection?: ProductCollection;
};

function collectionWhere(collection?: ProductCollection): Prisma.ProductWhereInput {
  if (collection === "featured") {
    return { isFeatured: true };
  }

  if (collection === "best-sellers") {
    return { isBestSeller: true };
  }

  if (collection === "offers") {
    return { isWeeklyOffer: true };
  }

  return {};
}

function scopedPublicProductWhere({
  categorySlug,
  collection,
}: StorefrontFilterScope = {}): Prisma.ProductWhereInput {
  return {
    status: "ACTIVE",
    variants: { some: { status: "ACTIVE" } },
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...collectionWhere(collection),
  };
}

export async function getStorefrontFilters(
  scope: StorefrontFilterScope = {},
): Promise<StorefrontFilters> {
  const scopedWhere = scopedPublicProductWhere(scope);
  const [categories, brands, featured, bestSellers, onSale] = await Promise.all([
    getStorefrontCategories(),
    prisma.brand.findMany({
      where: { products: { some: scopedWhere } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, country: true },
    }),
    prisma.product.count({ where: { ...scopedWhere, isFeatured: true } }),
    prisma.product.count({ where: { ...scopedWhere, isBestSeller: true } }),
    prisma.product.count({
      where: {
        ...scopedWhere,
        variants: { some: { salePrice: { not: null }, status: "ACTIVE" } },
      },
    }),
  ]);

  return {
    categories: categories
      .filter((category) => category.productCount > 0)
      .map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        productCount: category.productCount,
      })),
    brands,
    collectionCounts: {
      bestSellers,
      featured,
      onSale,
    },
  };
}

export async function getPublicProducts(
  params: StorefrontSearchParams = {},
  options: {
    categorySlug?: string;
    take?: number;
    featured?: boolean;
    bestSeller?: boolean;
    weeklyOffer?: boolean;
    collection?: ProductCollection;
  } = {},
) {
  const categorySlug = options.categorySlug;
  const featured = options.featured || options.collection === "featured";
  const bestSeller = options.bestSeller || options.collection === "best-sellers";
  const weeklyOffer = options.weeklyOffer || options.collection === "offers";
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(featured ? { isFeatured: true } : {}),
    ...(bestSeller ? { isBestSeller: true } : {}),
    ...(weeklyOffer ? { isWeeklyOffer: true } : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    variants: { some: { status: "ACTIVE" } },
  };

  const products = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });

  const productCards = products
    .map(toProductCard)
    .filter(
      (product): product is StorefrontProductCard => Boolean(product),
    );
  const filteredProducts = filterAndSortStorefrontProducts(
    productCards,
    params,
  );

  return options.take
    ? filteredProducts.slice(0, options.take)
    : filteredProducts;
}

export async function getFeaturedCategories(take = 8) {
  const categories = await getStorefrontCategories();

  return categories
    .filter((category) => category.isFeatured && category.productCount > 0)
    .slice(0, take);
}

export async function getActiveHomeBanners() {
  const now = new Date();

  return prisma.banner.findMany({
    where: {
      isActive: true,
      placement: { in: ["HOME_HERO", "HOME_STRIP"] },
      OR: [{ startsAt: null }, { startsAt: { lte: now } }],
      AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
    },
    orderBy: [{ placement: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    take: 4,
  });
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      children: {
        where: { products: { some: { status: "ACTIVE" } } },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return category
    ? {
        ...category,
        imageUrl: customerImageUrl(category.imageUrl),
      }
    : null;
}

export async function getProductDetailBySlug(slug: string): Promise<StorefrontProductDetail | null> {
  const safeSlug = sanitizeSlug(slug);

  if (!safeSlug || safeSlug !== slug) {
    return null;
  }

  const product = await prisma.product.findFirst({
    where: {
      slug: safeSlug,
      status: "ACTIVE",
      variants: { some: { status: "ACTIVE" } },
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      brand: { select: { id: true, name: true, slug: true, country: true } },
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, url: true, altText: true, isPrimary: true, variantId: true },
      },
      variants: {
        where: { status: "ACTIVE" },
        orderBy: [{ price: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          sku: true,
          name: true,
          price: true,
          salePrice: true,
          currency: true,
          stock: true,
          imageUrl: true,
          status: true,
        },
      },
    },
  });

  if (!product || product.variants.length === 0) {
    return null;
  }

  return {
    id: product.id,
    name: customerProductName(product.name),
    slug: product.slug,
    description: product.description,
    ingredients: product.ingredients,
    storage: product.storage,
    origin: product.origin,
    allergens: product.allergens,
    tags: [...product.tags, ...product.regionTags, ...product.dietaryTags].filter(Boolean),
    category: product.category,
    brand: product.brand,
    images: product.images
      .filter((image) => customerImageUrl(image.url))
      .map((image) => ({
        ...image,
        altText: customerImageAlt(image.altText, product.name),
      })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      price: numberFromDecimal(variant.price),
      salePrice: variant.salePrice ? numberFromDecimal(variant.salePrice) : null,
      currency: variant.currency,
      stock: variant.stock,
      imageUrl: customerImageUrl(variant.imageUrl),
      isAvailable: variant.status === "ACTIVE",
    })),
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isWeeklyOffer: product.isWeeklyOffer,
  };
}
