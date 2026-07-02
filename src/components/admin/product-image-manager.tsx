import Image from "next/image";
import { DeleteConfirmation } from "@/components/admin/delete-confirmation";
import {
  removeProductImageAction,
  removeVariantImageAction,
  replaceProductImageAction,
  uploadGalleryImagesAction,
  uploadMainProductImageAction,
  uploadVariantImageAction,
} from "@/app/admin/(protected)/products/[productId]/edit/image-actions";

type ProductImageItem = {
  id: string;
  url: string;
  storagePath: string;
  altText: string;
  isPrimary: boolean;
  variantId?: string | null;
  sortOrder: number;
  sizeBytes: number;
  format: string;
};

type ProductVariantImageItem = {
  id: string;
  sku: string;
  name: string;
  imageUrl?: string | null;
};

type ProductImageManagerProps = {
  productId: string;
  images: ProductImageItem[];
  variants: ProductVariantImageItem[];
};

function formatBytes(value: number) {
  if (value < 1024) {
    return `${value} B`;
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadInput({ name, multiple }: { name: string; multiple?: boolean }) {
  return (
    <input
      accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
      className="mt-2 block w-full cursor-pointer rounded-md border border-border bg-surface px-3 py-2 text-sm text-text file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
      multiple={multiple}
      name={name}
      type="file"
    />
  );
}

export function ProductImageManager({ productId, images, variants }: ProductImageManagerProps) {
  const primaryImage = images.find((image) => image.isPrimary && !image.variantId);
  const galleryImages = images.filter((image) => !image.isPrimary && !image.variantId);
  const variantImages = new Map(images.filter((image) => image.variantId).map((image) => [image.variantId, image]));
  const uploadMainAction = uploadMainProductImageAction.bind(null, productId);
  const uploadGalleryAction = uploadGalleryImagesAction.bind(null, productId);
  const removeMainAction = primaryImage ? removeProductImageAction.bind(null, productId, primaryImage.id) : null;

  return (
    <section className="mt-8 rounded-lg border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Product media</h2>
          <p className="mt-1 text-sm leading-6 text-text-muted">
            Use a main image for listings, gallery images for product detail pages, and variant images for exact SKU packaging.
            Allowed formats: JPG, JPEG, PNG, WEBP. Max 5MB each.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,420px)_1fr]">
        <div className="rounded-lg border border-border bg-surface-muted p-4">
          <h3 className="text-base font-semibold text-text">Main image</h3>
          <div className="relative mt-3 aspect-square overflow-hidden rounded-md border border-border bg-surface">
            {primaryImage ? (
              <Image
                alt={primaryImage.altText}
                className="h-full w-full object-cover"
                fill
                sizes="420px"
                src={primaryImage.url}
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-text-muted">
                No main image uploaded yet.
              </div>
            )}
          </div>
          {primaryImage ? (
            <p className="mt-2 text-xs text-text-muted">
              {primaryImage.format} - {formatBytes(primaryImage.sizeBytes)}
            </p>
          ) : null}
          {removeMainAction ? (
            <div className="mt-3">
              <DeleteConfirmation action={removeMainAction} itemName="main image" triggerLabel="Remove main image" />
            </div>
          ) : null}
          <form action={uploadMainAction} className="mt-4">
            <label className="block">
              <span className="text-sm font-semibold text-text">
                {primaryImage ? "Replace main image" : "Upload main image"}
              </span>
              <UploadInput name="mainImage" />
            </label>
            <label className="mt-3 block">
              <span className="text-sm font-semibold text-text">Alt text</span>
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta"
                defaultValue={primaryImage?.altText ?? ""}
                name="altText"
                placeholder="Describe this product image"
              />
            </label>
            <button
              className="mt-4 min-h-11 cursor-pointer rounded-md bg-cta px-5 text-sm font-semibold text-white transition-colors hover:bg-cta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              type="submit"
            >
              {primaryImage ? "Replace main image" : "Upload main image"}
            </button>
          </form>
        </div>

        <div>
          <div className="rounded-lg border border-border bg-surface-muted p-4">
            <h3 className="text-base font-semibold text-text">Gallery upload</h3>
            <form action={uploadGalleryAction} className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
              <label className="block">
                <span className="text-sm font-semibold text-text">Gallery images</span>
                <UploadInput multiple name="galleryImages" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-text">Alt text</span>
                <input
                  className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta"
                  name="altText"
                  placeholder="Describe these gallery images"
                />
              </label>
              <button
                className="min-h-11 cursor-pointer rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                type="submit"
              >
                Upload gallery
              </button>
            </form>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {galleryImages.length === 0 ? (
              <div className="rounded-lg border border-border bg-surface-muted p-5 text-sm text-text-muted">
                No gallery images yet.
              </div>
            ) : (
              galleryImages.map((image) => {
                const replaceAction = replaceProductImageAction.bind(null, productId, image.id);
                const removeAction = removeProductImageAction.bind(null, productId, image.id);

                return (
                  <article className="rounded-lg border border-border bg-surface-muted p-3" key={image.id}>
                    <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-surface">
                      <Image
                        alt={image.altText}
                        className="h-full w-full object-cover"
                        fill
                        sizes="(min-width: 1536px) 260px, (min-width: 768px) 45vw, 90vw"
                        src={image.url}
                        unoptimized
                      />
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold text-text">{image.altText}</p>
                    <p className="text-xs text-text-muted">
                      {image.format} - {formatBytes(image.sizeBytes)}
                    </p>
                    <form action={replaceAction} className="mt-3 border-t border-border pt-3">
                      <label className="block">
                        <span className="text-xs font-semibold text-text">Replace image</span>
                        <UploadInput name="replacementImage" />
                      </label>
                      <label className="mt-2 block">
                        <span className="text-xs font-semibold text-text">Alt text</span>
                        <input
                          className="mt-1 min-h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta"
                          defaultValue={image.altText}
                          name="altText"
                        />
                      </label>
                      <button
                        className="mt-3 min-h-10 cursor-pointer rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-muted"
                        type="submit"
                      >
                        Replace
                      </button>
                    </form>
                    <div className="mt-3">
                      <DeleteConfirmation action={removeAction} itemName={image.altText} triggerLabel="Remove image" />
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-border pt-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-text">Variant images</h3>
          <p className="text-sm leading-6 text-text-muted">
            Add one image per SKU when packaging differs by size, pack, or flavor. This updates the variant image URL automatically.
          </p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {variants.length === 0 ? (
            <div className="rounded-lg border border-border bg-surface-muted p-5 text-sm text-text-muted">
              Save at least one variant before uploading SKU images.
            </div>
          ) : (
            variants.map((variant) => {
              const savedImage = variantImages.get(variant.id);
              const imageUrl = savedImage?.url ?? variant.imageUrl ?? null;
              const uploadVariantAction = uploadVariantImageAction.bind(null, productId, variant.id);
              const removeVariantAction = removeVariantImageAction.bind(null, productId, variant.id);

              return (
                <article className="rounded-lg border border-border bg-surface-muted p-4" key={variant.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-text">{variant.name}</h4>
                      <p className="mt-1 text-xs font-semibold uppercase text-text-muted">{variant.sku}</p>
                    </div>
                    {imageUrl ? (
                      <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-info">
                        Image set
                      </span>
                    ) : (
                      <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-text-muted">
                        No image
                      </span>
                    )}
                  </div>

                  <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-md border border-border bg-surface">
                    {imageUrl ? (
                      <Image
                        alt={savedImage?.altText ?? `${variant.sku} variant image`}
                        className="h-full w-full object-cover"
                        fill
                        sizes="(min-width: 1536px) 320px, (min-width: 1024px) 45vw, 90vw"
                        src={imageUrl}
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-5 text-center text-sm text-text-muted">
                        Upload the packaging photo for this SKU.
                      </div>
                    )}
                  </div>

                  {savedImage ? (
                    <p className="mt-2 text-xs text-text-muted">
                      {savedImage.format} - {formatBytes(savedImage.sizeBytes)}
                    </p>
                  ) : null}

                  <form action={uploadVariantAction} className="mt-3 border-t border-border pt-3">
                    <label className="block">
                      <span className="text-xs font-semibold text-text">
                        {imageUrl ? "Replace variant image" : "Upload variant image"}
                      </span>
                      <UploadInput name="variantImage" />
                    </label>
                    <label className="mt-2 block">
                      <span className="text-xs font-semibold text-text">Alt text</span>
                      <input
                        className="mt-1 min-h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta"
                        defaultValue={savedImage?.altText ?? `${variant.sku} ${variant.name}`}
                        name="altText"
                        placeholder="Describe this SKU image"
                      />
                    </label>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <button
                        className="min-h-10 cursor-pointer rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                        type="submit"
                      >
                        {imageUrl ? "Replace" : "Upload"}
                      </button>
                      {imageUrl ? (
                        <DeleteConfirmation
                          action={removeVariantAction}
                          itemName={`${variant.sku} image`}
                          triggerLabel="Remove"
                        />
                      ) : null}
                    </div>
                  </form>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
