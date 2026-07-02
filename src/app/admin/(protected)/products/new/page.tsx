import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { ProductStatusMessage } from "@/components/admin/product-status-message";
import { prisma } from "@/lib/prisma";
import { createProductAction } from "@/app/admin/(protected)/products/actions";

type NewProductPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function NewProductPage({ searchParams }: NewProductPageProps) {
  const params = await searchParams;
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true },
    }),
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Create catalog item"
        title="Create product"
        description="Add product details and one or more sellable variants. All writes are validated and require ADMIN access."
      />
      <ProductStatusMessage error={params?.error} />
      <ProductForm
        action={createProductAction}
        brands={brands}
        categories={categories}
        submitLabel="Create product"
      />
    </div>
  );
}

