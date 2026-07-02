import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteConfirmation } from "@/components/admin/delete-confirmation";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { ProductForm } from "@/components/admin/product-form";
import { ProductStatusMessage } from "@/components/admin/product-status-message";
import { deleteProductAction, updateProductAction } from "@/app/admin/(protected)/products/actions";
import { prisma } from "@/lib/prisma";

type EditProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    reason?: string;
    success?: string;
  }>;
};

export default async function EditProductPage({ params, searchParams }: EditProductPageProps) {
  const [{ productId }, query] = await Promise.all([params, searchParams]);
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: { orderBy: { createdAt: "asc" } },
        images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }, { createdAt: "asc" }] },
      },
    }),
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const updateAction = updateProductAction.bind(null, product.id);
  const deleteAction = deleteProductAction.bind(null, product.id);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Edit catalog item"
        title={`Edit ${product.name}`}
        description="Update product details, merchandising flags, SEO metadata, and multiple variants/SKUs."
      />
      <ProductStatusMessage error={query?.error} reason={query?.reason} success={query?.success} />
      <ProductForm
        action={updateAction}
        brands={brands}
        categories={categories}
        initialData={{
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          brandId: product.brandId ?? undefined,
          description: product.description,
          active: product.status === "ACTIVE",
          featured: product.isFeatured,
          bestSeller: product.isBestSeller,
          weeklyOffer: product.isWeeklyOffer,
          tags: product.tags.join(", "),
          seoTitle: product.seoTitle ?? undefined,
          seoDescription: product.seoDescription ?? undefined,
          variants: product.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            name: variant.name,
            price: variant.price.toString(),
            salePrice: variant.salePrice?.toString(),
            stock: variant.stock,
            barcode: variant.barcode ?? undefined,
            imageUrl: variant.imageUrl ?? undefined,
            isAvailable: variant.status === "ACTIVE",
          })),
        }}
        submitLabel="Save product"
      />

      <ProductImageManager
        images={product.images.map((image) => ({
          id: image.id,
          url: image.url,
          storagePath: image.storagePath,
          altText: image.altText,
          isPrimary: image.isPrimary,
          sortOrder: image.sortOrder,
          sizeBytes: image.sizeBytes,
          format: image.format,
          variantId: image.variantId,
        }))}
        productId={product.id}
        variants={product.variants.map((variant) => ({
          id: variant.id,
          sku: variant.sku,
          name: variant.name,
          imageUrl: variant.imageUrl,
        }))}
      />

      <section className="mt-8 rounded-lg border border-danger bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-danger">Delete product</h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          This permanently deletes the product and its variants if they are not linked to protected records.
        </p>
        <div className="mt-4">
          <DeleteConfirmation action={deleteAction} itemName={product.name} triggerLabel="Delete product" />
        </div>
      </section>
    </div>
  );
}
