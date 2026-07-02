"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  deleteProductImageFromStorage,
  uploadProductImageToStorage,
  validateImageFile,
} from "@/lib/supabase-storage";

function productEditPath(productId: string, status: string) {
  return `/admin/products/${productId}/edit?${status}`;
}

function fileFromForm(formData: FormData, name: string) {
  const value = formData.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}

function filesFromForm(formData: FormData, name: string) {
  return formData
    .getAll(name)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

async function ensureProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true },
  });

  if (!product) {
    redirect("/admin/products?error=failed");
  }

  return product;
}

async function safeDeleteStorage(path: string) {
  try {
    await deleteProductImageFromStorage(path);
  } catch {
    // Database state is authoritative for admin UI; storage cleanup can be retried manually if needed.
  }
}

export async function uploadMainProductImageAction(productId: string, formData: FormData) {
  await requireAdmin();
  await ensureProduct(productId);

  const file = fileFromForm(formData, "mainImage");
  const altText = String(formData.get("altText") ?? "").trim() || "Product main image";
  let status = "success=image-uploaded";

  try {
    if (!file) {
      throw new Error("Choose a main image to upload.");
    }

    validateImageFile(file);
    const uploaded = await uploadProductImageToStorage(productId, file);

    const previousPrimaryImages = await prisma.productImage.findMany({
      where: { productId, isPrimary: true },
      select: { id: true, storagePath: true },
    });

    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({
        where: { productId, isPrimary: true },
      });

      await tx.productImage.create({
        data: {
          productId,
          url: uploaded.publicUrl,
          storagePath: uploaded.storagePath,
          altText,
          format: uploaded.format,
          sizeBytes: uploaded.sizeBytes,
          sortOrder: 0,
          isPrimary: true,
        },
      });
    });

    await Promise.all(previousPrimaryImages.map((image) => safeDeleteStorage(image.storagePath)));

    revalidatePath(`/admin/products/${productId}/edit`);
  } catch (error) {
    const reason = error instanceof Error ? encodeURIComponent(error.message) : "upload-failed";
    status = `error=image-upload&reason=${reason}`;
  }

  redirect(productEditPath(productId, status));
}

export async function uploadGalleryImagesAction(productId: string, formData: FormData) {
  await requireAdmin();
  await ensureProduct(productId);

  const files = filesFromForm(formData, "galleryImages");
  const altText = String(formData.get("altText") ?? "").trim() || "Product gallery image";
  let status = "success=image-uploaded";

  try {
    if (files.length === 0) {
      throw new Error("Choose at least one gallery image to upload.");
    }

    if (files.length > 8) {
      throw new Error("Upload up to 8 gallery images at a time.");
    }

    files.forEach(validateImageFile);

    const existingCount = await prisma.productImage.count({ where: { productId } });
    const uploadedImages = await Promise.all(
      files.map((file) => uploadProductImageToStorage(productId, file)),
    );

    await prisma.productImage.createMany({
      data: uploadedImages.map((uploaded, index) => ({
        productId,
        url: uploaded.publicUrl,
        storagePath: uploaded.storagePath,
        altText,
        format: uploaded.format,
        sizeBytes: uploaded.sizeBytes,
        sortOrder: existingCount + index + 1,
        isPrimary: false,
      })),
    });

    revalidatePath(`/admin/products/${productId}/edit`);
  } catch (error) {
    const reason = error instanceof Error ? encodeURIComponent(error.message) : "upload-failed";
    status = `error=image-upload&reason=${reason}`;
  }

  redirect(productEditPath(productId, status));
}

export async function replaceProductImageAction(productId: string, imageId: string, formData: FormData) {
  await requireAdmin();
  await ensureProduct(productId);

  const file = fileFromForm(formData, "replacementImage");
  const altText = String(formData.get("altText") ?? "").trim();
  let status = "success=image-updated";

  try {
    if (!file) {
      throw new Error("Choose a replacement image.");
    }

    validateImageFile(file);

    const currentImage = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
      select: { id: true, storagePath: true, altText: true, isPrimary: true },
    });

    if (!currentImage) {
      throw new Error("Image could not be found.");
    }

    const uploaded = await uploadProductImageToStorage(productId, file);

    await prisma.productImage.update({
      where: { id: imageId },
      data: {
        url: uploaded.publicUrl,
        storagePath: uploaded.storagePath,
        altText: altText || currentImage.altText,
        format: uploaded.format,
        sizeBytes: uploaded.sizeBytes,
      },
    });

    await safeDeleteStorage(currentImage.storagePath);

    revalidatePath(`/admin/products/${productId}/edit`);
  } catch (error) {
    const reason = error instanceof Error ? encodeURIComponent(error.message) : "replace-failed";
    status = `error=image-upload&reason=${reason}`;
  }

  redirect(productEditPath(productId, status));
}

export async function removeProductImageAction(productId: string, imageId: string) {
  await requireAdmin();
  await ensureProduct(productId);
  let status = "success=image-removed";

  try {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
      select: { id: true, storagePath: true },
    });

    if (!image) {
      throw new Error("Image could not be found.");
    }

    await prisma.productImage.delete({ where: { id: image.id } });
    await safeDeleteStorage(image.storagePath);

    revalidatePath(`/admin/products/${productId}/edit`);
  } catch (error) {
    const reason = error instanceof Error ? encodeURIComponent(error.message) : "remove-failed";
    status = `error=image-remove&reason=${reason}`;
  }

  redirect(productEditPath(productId, status));
}

export async function uploadVariantImageAction(productId: string, variantId: string, formData: FormData) {
  await requireAdmin();
  await ensureProduct(productId);

  const file = fileFromForm(formData, "variantImage");
  const altText = String(formData.get("altText") ?? "").trim() || "Variant image";
  let status = "success=variant-image-updated";

  try {
    if (!file) {
      throw new Error("Choose a variant image.");
    }

    validateImageFile(file);

    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      select: { id: true, sku: true },
    });

    if (!variant) {
      throw new Error("Variant could not be found.");
    }

    const previousImages = await prisma.productImage.findMany({
      where: { productId, variantId },
      select: { id: true, storagePath: true },
    });

    const uploaded = await uploadProductImageToStorage(productId, file);

    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({
        where: { productId, variantId },
      });

      await tx.productImage.create({
        data: {
          productId,
          variantId,
          url: uploaded.publicUrl,
          storagePath: uploaded.storagePath,
          altText: altText || `${variant.sku} image`,
          format: uploaded.format,
          sizeBytes: uploaded.sizeBytes,
          sortOrder: 0,
          isPrimary: false,
        },
      });

      await tx.productVariant.update({
        where: { id: variantId },
        data: { imageUrl: uploaded.publicUrl },
      });
    });

    await Promise.all(previousImages.map((image) => safeDeleteStorage(image.storagePath)));

    revalidatePath(`/admin/products/${productId}/edit`);
  } catch (error) {
    const reason = error instanceof Error ? encodeURIComponent(error.message) : "variant-upload-failed";
    status = `error=variant-image&reason=${reason}`;
  }

  redirect(productEditPath(productId, status));
}

export async function removeVariantImageAction(productId: string, variantId: string) {
  await requireAdmin();
  await ensureProduct(productId);
  let status = "success=variant-image-removed";

  try {
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      select: { id: true },
    });

    if (!variant) {
      throw new Error("Variant could not be found.");
    }

    const images = await prisma.productImage.findMany({
      where: { productId, variantId },
      select: { id: true, storagePath: true },
    });

    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({
        where: { productId, variantId },
      });

      await tx.productVariant.update({
        where: { id: variantId },
        data: { imageUrl: null },
      });
    });

    await Promise.all(images.map((image) => safeDeleteStorage(image.storagePath)));

    revalidatePath(`/admin/products/${productId}/edit`);
  } catch (error) {
    const reason = error instanceof Error ? encodeURIComponent(error.message) : "variant-remove-failed";
    status = `error=variant-image&reason=${reason}`;
  }

  redirect(productEditPath(productId, status));
}
