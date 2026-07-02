import { AdminActionMessage } from "@/components/admin/admin-action-message";

type ProductStatusMessageProps = {
  error?: string;
  reason?: string;
  success?: string;
};

const errorMessages: Record<string, string> = {
  validation: "Check required fields, prices, stock, and variant data.",
  unique: "A product slug, SKU, or barcode already exists.",
  failed: "The product could not be saved.",
  "delete-confirmation": "Type DELETE to confirm product deletion.",
  "delete-failed": "The product could not be deleted. It may already be linked to other records.",
  "image-upload": "The image could not be uploaded.",
  "image-remove": "The image could not be removed.",
  "variant-image": "The variant image could not be updated.",
};

const successMessages: Record<string, string> = {
  created: "Product created.",
  updated: "Product updated.",
  deleted: "Product deleted.",
  "image-uploaded": "Product image uploaded.",
  "image-updated": "Product image updated.",
  "image-removed": "Product image removed.",
  "variant-image-updated": "Variant image updated.",
  "variant-image-removed": "Variant image removed.",
};

export function ProductStatusMessage({ error, reason, success }: ProductStatusMessageProps) {
  const decodedReason = reason ? decodeURIComponent(reason) : undefined;

  return (
    <AdminActionMessage
      error={error}
      messages={{
        errors: {
          ...errorMessages,
          ...(error && decodedReason ? { [error]: decodedReason } : {}),
        },
        successes: successMessages,
      }}
      success={success}
    />
  );
}
