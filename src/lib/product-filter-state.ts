import { sanitizeSlug } from "@/lib/slug";

export const PRODUCT_SORT_OPTIONS = [
  { label: "Recommended", value: "recommended" },
  { label: "Newest", value: "newest" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Best selling", value: "best-selling" },
  { label: "Biggest saving", value: "biggest-saving" },
] as const;

export type ProductSort = (typeof PRODUCT_SORT_OPTIONS)[number]["value"];

export type StorefrontSearchParams = {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: boolean;
  sale?: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  sort?: ProductSort;
};

export type ProductCollection = "offers" | "featured" | "best-sellers";

export type ProductFilterKey =
  | "category"
  | "brand"
  | "price"
  | "inStock"
  | "sale"
  | "featured"
  | "bestSeller";

export type ProductFilterContext = {
  basePath: string;
  lockedCategory?: { name: string; slug: string };
  collection?: ProductCollection;
};

type FilterableStorefrontProduct = {
  brand?: { name: string; slug: string } | null;
  category: { name: string; slug: string };
  createdAt: Date | string;
  description: string;
  discountPercent?: number | null;
  isBestSeller: boolean;
  isFeatured: boolean;
  isInStock: boolean;
  isOnSale: boolean;
  isWeeklyOffer: boolean;
  name: string;
  searchTerms?: readonly string[];
  startingPrice: number;
};

type NormalizeOptions = {
  categorySlugs?: readonly string[];
  brandSlugs?: readonly string[];
  lockedCategorySlug?: string;
  collection?: ProductCollection;
};

const sortAliases: Readonly<Record<string, ProductSort>> = {
  recommended: "recommended",
  newest: "newest",
  "price-asc": "price-asc",
  "price-low": "price-asc",
  "price-desc": "price-desc",
  "price-high": "price-desc",
  "best-selling": "best-selling",
  popular: "best-selling",
  "biggest-saving": "biggest-saving",
  discount: "biggest-saving",
  offers: "biggest-saving",
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function storefrontSearchParamsRecord(
  searchParams: Pick<URLSearchParams, "forEach">,
) {
  const record: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    // Match Next's server searchParams contract: duplicated values are
    // represented as an array and the normalizer intentionally uses the first.
    if (!Object.prototype.hasOwnProperty.call(record, key)) {
      record[key] = value;
    }
  });

  return record;
}

function normalizeBoolean(value: string | undefined) {
  return value === "true" || value === "on" || value === "1";
}

function normalizeMoney(value: string | undefined) {
  const trimmed = value?.trim();

  if (!trimmed || !/^\d{1,7}(?:\.\d{1,2})?$/.test(trimmed)) {
    return undefined;
  }

  const amount = Number(trimmed);

  if (!Number.isFinite(amount) || amount < 0 || amount > 9_999_999) {
    return undefined;
  }

  return amount.toFixed(2).replace(/\.?0+$/, "");
}

function normalizeFilterSlug(value: string | undefined, allowedValues?: readonly string[]) {
  const trimmed = value?.trim().toLowerCase();

  if (!trimmed || trimmed.length > 80 || sanitizeSlug(trimmed) !== trimmed) {
    return undefined;
  }

  if (allowedValues && !allowedValues.includes(trimmed)) {
    return undefined;
  }

  return trimmed;
}

function normalizeQuery(value: string | undefined) {
  const trimmed = value?.trim().replace(/\s+/g, " ");
  return trimmed ? trimmed.slice(0, 120) : undefined;
}

function normalizeSort(value: string | undefined) {
  return (value && sortAliases[value]) || "recommended";
}

export function normalizeStorefrontSearchParams(
  searchParams?: Record<string, string | string[] | undefined>,
  options: NormalizeOptions = {},
): StorefrontSearchParams {
  const rawCategory = first(searchParams?.category);
  const legacyVegetables = normalizeBoolean(first(searchParams?.freshVegetables));
  const minPrice = normalizeMoney(first(searchParams?.minPrice));
  const normalizedMaxPrice = normalizeMoney(first(searchParams?.maxPrice));
  const maxPrice =
    minPrice && normalizedMaxPrice && Number(normalizedMaxPrice) < Number(minPrice)
      ? undefined
      : normalizedMaxPrice;
  const category = options.lockedCategorySlug
    ? undefined
    : normalizeFilterSlug(
        rawCategory || (legacyVegetables ? "vegetables" : undefined),
        options.categorySlugs,
      );
  const featured =
    options.collection === "featured"
      ? undefined
      : normalizeBoolean(first(searchParams?.featured));
  const bestSeller =
    options.collection === "best-sellers"
      ? undefined
      : normalizeBoolean(first(searchParams?.bestSeller));
  const sale =
    options.collection === "offers"
      ? undefined
      : normalizeBoolean(first(searchParams?.sale));

  return {
    q: normalizeQuery(first(searchParams?.q) || first(searchParams?.search)),
    category,
    brand: normalizeFilterSlug(first(searchParams?.brand), options.brandSlugs),
    minPrice,
    maxPrice,
    inStock: normalizeBoolean(
      first(searchParams?.inStock) ||
        (first(searchParams?.availability) === "in-stock" ? "true" : undefined),
    ),
    sale,
    featured,
    bestSeller,
    sort: normalizeSort(first(searchParams?.sort)),
  };
}

export function serializeStorefrontSearchParams(values: StorefrontSearchParams) {
  const params = new URLSearchParams();

  if (values.q) params.set("q", values.q);
  if (values.category) params.set("category", values.category);
  if (values.brand) params.set("brand", values.brand);
  if (values.minPrice) params.set("minPrice", values.minPrice);
  if (values.maxPrice) params.set("maxPrice", values.maxPrice);
  if (values.inStock) params.set("inStock", "true");
  if (values.sale) params.set("sale", "true");
  if (values.featured) params.set("featured", "true");
  if (values.bestSeller) params.set("bestSeller", "true");
  if (values.sort && values.sort !== "recommended") params.set("sort", values.sort);

  return params;
}

function productCreatedAt(product: FilterableStorefrontProduct) {
  return new Date(product.createdAt).getTime();
}

export function filterAndSortStorefrontProducts<
  Product extends FilterableStorefrontProduct,
>(products: readonly Product[], values: StorefrontSearchParams) {
  const query = values.q?.trim().toLocaleLowerCase("en-AU");
  const minimumPrice = values.minPrice ? Number(values.minPrice) : undefined;
  const maximumPrice = values.maxPrice ? Number(values.maxPrice) : undefined;
  const filteredProducts = products.filter((product) => {
    if (query) {
      const searchableValues = [
        product.name,
        product.description,
        product.category.name,
        product.brand?.name ?? "",
        ...(product.searchTerms ?? []),
      ];

      if (
        !searchableValues.some((value) =>
          value.toLocaleLowerCase("en-AU").includes(query),
        )
      ) {
        return false;
      }
    }

    return (
      (!values.category || product.category.slug === values.category) &&
      (!values.brand || product.brand?.slug === values.brand) &&
      (minimumPrice === undefined || product.startingPrice >= minimumPrice) &&
      (maximumPrice === undefined || product.startingPrice <= maximumPrice) &&
      (!values.inStock || product.isInStock) &&
      (!values.sale || product.isOnSale) &&
      (!values.featured || product.isFeatured) &&
      (!values.bestSeller || product.isBestSeller)
    );
  });

  return [...filteredProducts].sort((first, second) => {
    if (values.sort === "price-asc") {
      return first.startingPrice - second.startingPrice;
    }

    if (values.sort === "price-desc") {
      return second.startingPrice - first.startingPrice;
    }

    if (values.sort === "newest") {
      return productCreatedAt(second) - productCreatedAt(first);
    }

    if (values.sort === "best-selling") {
      return (
        Number(second.isBestSeller) - Number(first.isBestSeller) ||
        Number(second.isFeatured) - Number(first.isFeatured) ||
        productCreatedAt(second) - productCreatedAt(first)
      );
    }

    if (values.sort === "biggest-saving") {
      return (second.discountPercent ?? 0) - (first.discountPercent ?? 0);
    }

    const firstScore =
      Number(first.isFeatured) * 6 +
      Number(first.isBestSeller) * 4 +
      Number(first.isWeeklyOffer) * 2 +
      Number(first.isInStock);
    const secondScore =
      Number(second.isFeatured) * 6 +
      Number(second.isBestSeller) * 4 +
      Number(second.isWeeklyOffer) * 2 +
      Number(second.isInStock);

    return (
      secondScore - firstScore ||
      productCreatedAt(second) - productCreatedAt(first)
    );
  });
}

export function buildProductListingHref(
  basePath: string,
  values: StorefrontSearchParams,
  options: { includeResultsHash?: boolean } = {},
) {
  const query = serializeStorefrontSearchParams(values).toString();
  const hash = options.includeResultsHash ? "#product-results" : "";
  return `${basePath}${query ? `?${query}` : ""}${hash}`;
}

export function clearProductFilters(values: StorefrontSearchParams): StorefrontSearchParams {
  return {
    q: values.q,
    sort: values.sort,
  };
}

export function removeProductFilter(
  values: StorefrontSearchParams,
  key: ProductFilterKey,
): StorefrontSearchParams {
  if (key === "price") {
    const next = { ...values };
    delete next.minPrice;
    delete next.maxPrice;
    return next;
  }

  const next = { ...values };
  delete next[key];
  return next;
}

export function countActiveProductFilters(
  values: StorefrontSearchParams,
  context: Pick<ProductFilterContext, "lockedCategory" | "collection"> = {},
) {
  return [
    !context.lockedCategory && values.category,
    values.brand,
    values.minPrice || values.maxPrice,
    values.inStock,
    context.collection !== "offers" && values.sale,
    context.collection !== "featured" && values.featured,
    context.collection !== "best-sellers" && values.bestSeller,
  ].filter(Boolean).length;
}

export function hasActiveProductFilters(
  values: StorefrontSearchParams,
  context: Pick<ProductFilterContext, "lockedCategory" | "collection"> = {},
) {
  return countActiveProductFilters(values, context) > 0;
}

export function formatFilterPrice(value: string) {
  return new Intl.NumberFormat("en-AU", {
    currency: "AUD",
    maximumFractionDigits: 2,
    minimumFractionDigits: Number(value) % 1 === 0 ? 0 : 2,
    style: "currency",
  }).format(Number(value));
}
