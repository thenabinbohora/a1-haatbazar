import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { customerImageUrl } from "@/lib/customer-images";
import { customerImageAlt, customerProductName } from "@/lib/display";
import { sanitizeSlug } from "@/lib/slug";

export type StorefrontSearchParams = {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  sale?: string;
  freshVegetables?: string;
  sort?: string;
};

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
  createdAt: Date;
};

export type StorefrontFilters = {
  categories: Array<{ id: string; name: string; slug: string; productCount: number }>;
  brands: Array<{ id: string; name: string; slug: string; country?: string | null }>;
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

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function normalizeStorefrontSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
): StorefrontSearchParams {
  return {
    q: one(searchParams?.q)?.trim() || one(searchParams?.search)?.trim() || undefined,
    category: one(searchParams?.category)?.trim() || undefined,
    brand: one(searchParams?.brand)?.trim() || undefined,
    minPrice: one(searchParams?.minPrice)?.trim() || undefined,
    maxPrice: one(searchParams?.maxPrice)?.trim() || undefined,
    inStock: one(searchParams?.inStock) === "on" || one(searchParams?.availability) === "in-stock" ? "on" : undefined,
    sale: one(searchParams?.sale) === "on" || one(searchParams?.sale) === "true" ? "on" : undefined,
    freshVegetables: one(searchParams?.freshVegetables) === "on" ? "on" : undefined,
    sort: one(searchParams?.sort)?.trim() || "newest",
  };
}

function numberFromDecimal(value: unknown) {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return Number(value.toString());
}

function validMoney(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
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
    createdAt: product.createdAt,
  };

  return card;
}

function sortProducts(products: StorefrontProductCard[], sort = "newest") {
  return [...products].sort((first, second) => {
    if (sort === "price-low") {
      return first.startingPrice - second.startingPrice;
    }

    if (sort === "price-high") {
      return second.startingPrice - first.startingPrice;
    }

    if (sort === "popular") {
      const firstScore = Number(first.isBestSeller) * 4 + Number(first.isFeatured) * 2 + Number(first.isWeeklyOffer);
      const secondScore = Number(second.isBestSeller) * 4 + Number(second.isFeatured) * 2 + Number(second.isWeeklyOffer);
      return secondScore - firstScore || second.createdAt.getTime() - first.createdAt.getTime();
    }

    if (sort === "discount" || sort === "offers") {
      return (second.discountPercent ?? 0) - (first.discountPercent ?? 0);
    }

    return second.createdAt.getTime() - first.createdAt.getTime();
  });
}

export async function getStorefrontFilters(): Promise<StorefrontFilters> {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { products: { some: { status: "ACTIVE" } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
      },
    }),
    prisma.brand.findMany({
      where: { products: { some: { status: "ACTIVE" } } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, country: true },
    }),
  ]);

  return {
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      productCount: category._count.products,
    })),
    brands,
  };
}

export async function getPublicProducts(
  params: StorefrontSearchParams = {},
  options: { categorySlug?: string; take?: number; featured?: boolean; bestSeller?: boolean; weeklyOffer?: boolean } = {},
) {
  const minPrice = validMoney(params.minPrice);
  const maxPrice = validMoney(params.maxPrice);
  const categorySlug = options.categorySlug ?? (params.freshVegetables ? "vegetables" : params.category);
  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(options.featured ? { isFeatured: true } : {}),
    ...(options.bestSeller ? { isBestSeller: true } : {}),
    ...(options.weeklyOffer ? { isWeeklyOffer: true } : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" } },
            { description: { contains: params.q, mode: "insensitive" } },
            { tags: { has: params.q } },
          ],
        }
      : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(params.brand ? { brand: { slug: params.brand } } : {}),
    variants: {
      some: {
        status: "ACTIVE",
        ...(params.inStock ? { stock: { gt: 0 } } : {}),
        ...(params.sale ? { salePrice: { not: null } } : {}),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              price: {
                ...(minPrice !== undefined ? { gte: minPrice } : {}),
                ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
              },
            }
          : {}),
      },
    },
  };

  const products = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: { createdAt: "desc" },
    take: options.take ?? 96,
  });

  const productCards = products.map(toProductCard).filter((product): product is StorefrontProductCard => Boolean(product));
  const saleFilteredProducts = params.sale ? productCards.filter((product) => product.isOnSale) : productCards;

  return sortProducts(saleFilteredProducts, params.sort);
}

export async function getFeaturedCategories(take = 8) {
  const categories = await prisma.category.findMany({
    where: { products: { some: { status: "ACTIVE" } } },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    take,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      imageUrl: true,
      _count: { select: { products: { where: { status: "ACTIVE" } } } },
    },
  });

  return categories.map((category) => ({
    ...category,
    imageUrl: customerImageUrl(category.imageUrl),
  }));
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
