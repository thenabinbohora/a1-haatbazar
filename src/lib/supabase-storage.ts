import { randomUUID } from "node:crypto";

const allowedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp"]);
const maxImageSizeBytes = 5 * 1024 * 1024;

export type ValidatedImageFile = {
  file: File;
  extension: "jpg" | "jpeg" | "png" | "webp";
  format: "JPG" | "JPEG" | "PNG" | "WEBP";
  contentType: keyof typeof allowedImageTypes;
  sizeBytes: number;
};

export type UploadedStorageImage = {
  storagePath: string;
  publicUrl: string;
  format: ValidatedImageFile["format"];
  sizeBytes: number;
};

export function validateImageFile(file: File): ValidatedImageFile {
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image file before uploading.");
  }

  if (file.size > maxImageSizeBytes) {
    throw new Error("Image must be 5MB or smaller.");
  }

  if (!(file.type in allowedImageTypes)) {
    throw new Error("Only JPG, JPEG, PNG, and WEBP images are allowed.");
  }

  const rawExtension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedExtensions.has(rawExtension)) {
    throw new Error("Image file extension must be jpg, jpeg, png, or webp.");
  }

  const extension = rawExtension as ValidatedImageFile["extension"];

  return {
    file,
    extension,
    format: extension.toUpperCase() as ValidatedImageFile["format"],
    contentType: file.type as keyof typeof allowedImageTypes,
    sizeBytes: file.size,
  };
}

function getStorageConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? "product-images";

  if (!supabaseUrl || supabaseUrl.includes("example.supabase.co")) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required for product image uploads.");
  }

  if (!serviceRoleKey || serviceRoleKey.includes("replace-with")) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for server-side product image uploads.");
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ""),
    serviceRoleKey,
    bucket,
  };
}

function storageHeaders(contentType?: string) {
  const { serviceRoleKey } = getStorageConfig();

  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...(contentType ? { "Content-Type": contentType } : {}),
  };
}

export async function uploadProductImageToStorage(productId: string, file: File) {
  const image = validateImageFile(file);
  const { supabaseUrl, bucket } = getStorageConfig();
  const storagePath = `products/${productId}/${Date.now()}-${randomUUID()}.${image.extension}`;
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${storagePath}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      ...storageHeaders(image.contentType),
      "Cache-Control": "31536000",
      "x-upsert": "false",
    },
    body: await image.file.arrayBuffer(),
  });

  if (!response.ok) {
    throw new Error("Image upload failed. Check Supabase Storage bucket and policies.");
  }

  return {
    storagePath,
    publicUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`,
    format: image.format,
    sizeBytes: image.sizeBytes,
  } satisfies UploadedStorageImage;
}

export async function deleteProductImageFromStorage(storagePath: string) {
  const { supabaseUrl, bucket } = getStorageConfig();
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers: {
      ...storageHeaders("application/json"),
    },
    body: JSON.stringify({ prefixes: [storagePath] }),
  });

  if (!response.ok) {
    throw new Error("Image removal from storage failed.");
  }
}
