"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteProductImageFromStorage } from "@/lib/supabase-storage";
import { productInputSchema } from "@/lib/validation/product";

export type ProductVariantFormValues = {
  id?: string;
  sku: string;
  name: string;
  price: string;
  salePrice?: string;
  stock: string;
  barcode?: string;
  imageUrl?: string;
  isAvailable: boolean;
};

export type ProductFormValues = {
  name: string;
  slug: string;
  categoryId: string;
  brandId?: string;
  description: string;
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
  weeklyOffer: boolean;
  tags: string;
  seoTitle?: string;
  seoDescription?: string;
  variants: ProductVariantFormValues[];
};

export type ProductFormState = {
  values?: ProductFormValues;
  fieldErrors?: Record<string, string>;
  variantErrors?: Record<number, Record<string, string>>;
  formError?: string;
  debugError?: string;
  messageId?: string;
};

function checkboxValue(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function collectVariantValues(formData: FormData): ProductVariantFormValues[] {
  const ids = formData.getAll("variantId").map(String);
  const skus = formData.getAll("variantSku").map(String);
  const names = formData.getAll("variantName").map(String);
  const prices = formData.getAll("variantPrice").map(String);
  const salePrices = formData.getAll("variantSalePrice").map(String);
  const stocks = formData.getAll("variantStock").map(String);
  const barcodes = formData.getAll("variantBarcode").map(String);
  const imageUrls = formData.getAll("variantImageUrl").map(String);
  const availableIndexes = new Set(formData.getAll("variantAvailableIndex").map(String));

  return skus.map((sku, index) => ({
      id: ids[index] || undefined,
      sku,
      name: names[index] ?? "",
      price: prices[index] ?? "",
      salePrice: salePrices[index] ?? "",
      stock: stocks[index] ?? "0",
      barcode: barcodes[index] ?? "",
      imageUrl: imageUrls[index] ?? "",
      isAvailable: availableIndexes.has(String(index)),
    }));
}

function collectProductValues(formData: FormData): ProductFormValues {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    brandId: String(formData.get("brandId") ?? ""),
    description: String(formData.get("description") ?? ""),
    active: checkboxValue(formData, "active"),
    featured: checkboxValue(formData, "featured"),
    bestSeller: checkboxValue(formData, "bestSeller"),
    weeklyOffer: checkboxValue(formData, "weeklyOffer"),
    tags: String(formData.get("tags") ?? ""),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
    variants: collectVariantValues(formData),
  };
}

function parseProductValues(values: ProductFormValues) {
  return productInputSchema.safeParse(values);
}

function toVariantData(variant: ReturnType<typeof productInputSchema.parse>["variants"][number]) {
  return {
    sku: variant.sku,
    name: variant.name,
    price: variant.price,
    salePrice: variant.salePrice ?? null,
    stock: variant.stock,
    barcode: variant.barcode ?? null,
    imageUrl: variant.imageUrl ?? null,
    status: variant.isAvailable ? "ACTIVE" : "INACTIVE",
  } satisfies Prisma.ProductVariantUncheckedCreateWithoutProductInput;
}

function productData(input: ReturnType<typeof productInputSchema.parse>) {
  return {
    name: input.name,
    slug: input.slug,
    categoryId: input.categoryId,
    brandId: input.brandId ?? null,
    description: input.description,
    status: input.active ? "ACTIVE" : "DRAFT",
    isFeatured: input.featured,
    isBestSeller: input.bestSeller,
    isWeeklyOffer: input.weeklyOffer,
    tags: input.tags,
    seoTitle: input.seoTitle ?? null,
    seoDescription: input.seoDescription ?? null,
  } satisfies Prisma.ProductUncheckedCreateInput;
}

function validationState(values: ProductFormValues, error: z.ZodError): ProductFormState {
  const fieldErrors: Record<string, string> = {};
  const variantErrors: Record<number, Record<string, string>> = {};
  let formError: string | undefined;

  for (const issue of error.issues) {
    const [field, index, nestedField] = issue.path;

    if (field === "variants" && typeof index === "number") {
      variantErrors[index] = {
        ...variantErrors[index],
        [String(nestedField ?? "row")]: issue.message,
      };
      continue;
    }

    if (field === "variants") {
      variantErrors[0] = {
        ...variantErrors[0],
        sku: issue.message,
        name: issue.message,
        price: issue.message,
      };
      formError = issue.message;
      continue;
    }

    if (typeof field === "string" && field !== "variants") {
      fieldErrors[field] = issue.message;
      continue;
    }

    formError = issue.message;
  }

  return {
    values,
    fieldErrors,
    variantErrors,
    formError: formError ?? "Check the highlighted product fields.",
    messageId: String(Date.now()),
  };
}

function uniqueState(values: ProductFormValues, error: Prisma.PrismaClientKnownRequestError): ProductFormState {
  const target = Array.isArray(error.meta?.target)
    ? error.meta.target.map(String)
    : [String(error.meta?.target ?? "")];
  const targetText = target.join(" ").toLowerCase();

  if (targetText.includes("slug")) {
    return {
      values,
      fieldErrors: { slug: "A product with this slug already exists." },
      formError: "Use a unique product slug.",
      messageId: String(Date.now()),
    };
  }

  if (targetText.includes("sku")) {
    const variantErrors = Object.fromEntries(
      values.variants.map((_, index) => [index, { sku: "Use a unique SKU code." }]),
    );

    return {
      values,
      variantErrors,
      formError: "A variant SKU already exists. Use a unique SKU code.",
      messageId: String(Date.now()),
    };
  }

  if (targetText.includes("barcode")) {
    const variantErrors = Object.fromEntries(
      values.variants
        .map((variant, index) => [index, variant.barcode ? { barcode: "Use a unique barcode." } : undefined] as const)
        .filter((entry): entry is readonly [number, { barcode: string }] => Boolean(entry[1])),
    );

    return {
      values,
      variantErrors,
      formError: "A variant barcode already exists. Use a unique barcode.",
      messageId: String(Date.now()),
    };
  }

  return {
    values,
    formError: "A product slug, SKU, or barcode already exists.",
    messageId: String(Date.now()),
  };
}

function knownDatabaseState(values: ProductFormValues, error: Prisma.PrismaClientKnownRequestError): ProductFormState {
  if (error.code === "P2002") {
    return uniqueState(values, error);
  }

  if (error.code === "P2003") {
    return {
      values,
      fieldErrors: {
        categoryId: "Select a valid category before saving the product.",
      },
      formError: "Select a valid category before saving.",
      messageId: String(Date.now()),
    };
  }

  if (error.code === "P2025") {
    return {
      values,
      formError: "The product or variant could not be found. Refresh and try again.",
      messageId: String(Date.now()),
    };
  }

  return {
    values,
    formError: "The product could not be saved. Check the highlighted fields and try again.",
    messageId: String(Date.now()),
  };
}

function fallbackProductState(values: ProductFormValues, message: string): ProductFormState {
  const fieldErrors: Record<string, string> = {};
  const variantErrors: Record<number, Record<string, string>> = {};

  if (!values.categoryId) {
    fieldErrors.categoryId = "Select a category before saving the product.";
  }

  if (!values.slug) {
    fieldErrors.slug = "Enter a product slug.";
  }

  values.variants.forEach((variant, index) => {
    const errors: Record<string, string> = {};

    if (!variant.sku.trim()) {
      errors.sku = "SKU is required.";
    }

    if (!variant.name.trim()) {
      errors.name = "Size or pack label is required.";
    }

    if (!variant.price.trim()) {
      errors.price = "Price is required.";
    }

    if (Object.keys(errors).length > 0) {
      variantErrors[index] = errors;
    }
  });

  return {
    values,
    fieldErrors,
    variantErrors,
    formError: message,
    messageId: String(Date.now()),
  };
}

function debugMessage(error: unknown) {
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  if (error instanceof Error) {
    return error.message.slice(0, 1200);
  }

  return String(error).slice(0, 1200);
}

export async function createProductAction(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  let successPath = "/admin/products";
  const values = collectProductValues(formData);
  const parsed = parseProductValues(values);

  if (!parsed.success) {
    return validationState(values, parsed.error);
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: productData(parsed.data),
      });

      for (const variant of parsed.data.variants) {
        await tx.productVariant.create({
          data: {
            ...toVariantData(variant),
            productId: createdProduct.id,
          },
        });
      }

      return createdProduct;
    });

    revalidatePath("/admin/products");
    successPath = `/admin/products/${product.id}/edit?success=created`;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return knownDatabaseState(values, error);
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      const state = fallbackProductState(
        values,
        "The product form data could not be saved. Check category, slug, and variant fields.",
      );
      return { ...state, debugError: debugMessage(error) };
    }

    const state = fallbackProductState(
      values,
      "The product could not be saved. Check category, slug, and variant details.",
    );
    return { ...state, debugError: debugMessage(error) };
  }

  redirect(successPath);
}

export async function updateProductAction(
  productId: string,
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin();

  const values = collectProductValues(formData);
  const parsed = parseProductValues(values);

  if (!parsed.success) {
    return validationState(values, parsed.error);
  }

  try {
    const submittedVariantIds = parsed.data.variants
      .map((variant) => variant.id)
      .filter((id): id is string => Boolean(id));
    const removedVariantImages = await prisma.productImage.findMany({
      where: {
        productId,
        variantId: {
          not: null,
          notIn: submittedVariantIds,
        },
      },
      select: { storagePath: true },
    });

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: productData(parsed.data),
      });

      await tx.productImage.deleteMany({
        where: {
          productId,
          variantId: {
            not: null,
            notIn: submittedVariantIds,
          },
        },
      });

      await tx.productVariant.deleteMany({
        where: {
          productId,
          id: {
            notIn: submittedVariantIds.length ? submittedVariantIds : ["never-match"],
          },
        },
      });

      for (const variant of parsed.data.variants) {
        if (variant.id) {
          await tx.productVariant.update({
            where: { id: variant.id, productId },
            data: toVariantData(variant),
          });
        } else {
          await tx.productVariant.create({
            data: {
              ...toVariantData(variant),
              productId,
            },
          });
        }
      }
    });

    await Promise.all(
      removedVariantImages.map(async (image) => {
        try {
          await deleteProductImageFromStorage(image.storagePath);
        } catch {
          // Database state is authoritative for the admin UI; storage cleanup can be retried manually.
        }
      }),
    );

    revalidatePath("/admin/products");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return knownDatabaseState(values, error);
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      const state = fallbackProductState(
        values,
        "The product form data could not be updated. Check category, slug, and variant fields.",
      );
      return { ...state, debugError: debugMessage(error) };
    }

    const state = fallbackProductState(
      values,
      "The product could not be updated. Check category, slug, and variant details.",
    );
    return { ...state, debugError: debugMessage(error) };
  }

  redirect(`/admin/products/${productId}/edit?success=updated`);
}

export async function deleteProductAction(productId: string) {
  await requireAdmin();

  try {
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/admin/products");
  } catch {
    redirect(`/admin/products/${productId}/edit?error=delete-failed`);
  }

  redirect("/admin/products?success=deleted");
}
