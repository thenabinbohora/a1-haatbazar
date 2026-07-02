import Link from "next/link";
import { AdminEmptyState } from "@/components/admin/admin-states";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductStatusMessage } from "@/components/admin/product-status-message";
import { prisma } from "@/lib/prisma";

type ProductsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: string;
    category?: string;
    success?: string;
  }>;
};

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const status = params?.status ?? "";
  const category = params?.category ?? "";

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  const products = await prisma.product.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { slug: { contains: query, mode: "insensitive" } },
              { variants: { some: { sku: { contains: query, mode: "insensitive" } } } },
            ],
          }
        : {}),
      ...(status ? { status: status === "ACTIVE" ? "ACTIVE" : "DRAFT" } : {}),
      ...(category ? { categoryId: category } : {}),
    },
    include: {
      category: { select: { name: true } },
      brand: { select: { name: true } },
      variants: {
        select: { stock: true, price: true, salePrice: true, sku: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <AdminPageHeader
          eyebrow="Catalog operations"
          title="Products"
          description="Search, filter, create, edit, and delete grocery products with multiple variants and SKUs."
        />
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-cta px-5 text-sm font-semibold text-white transition-colors hover:bg-cta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          href="/admin/products/new"
        >
          Create product
        </Link>
      </div>

      <ProductStatusMessage success={params?.success} />

      <form className="mb-5 grid gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm lg:grid-cols-[1fr_220px_220px_auto]">
        <label className="block">
          <span className="text-sm font-semibold text-text">Search</span>
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta"
            defaultValue={query}
            name="q"
            placeholder="Name, slug, or SKU"
            type="search"
          />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-text">Status</span>
          <select
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta"
            defaultValue={status}
            name="status"
          >
            <option value="">Any status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-text">Category</span>
          <select
            className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta"
            defaultValue={category}
            name="category"
          >
            <option value="">Any category</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button
          className="mt-7 min-h-11 cursor-pointer rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          type="submit"
        >
          Filter
        </button>
      </form>

      {products.length === 0 ? (
        <AdminEmptyState
          title="No products found"
          description="Create your first product or adjust the search and filter controls."
        />
      ) : (
        <div className="polished-scrollbar overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
          <table className="min-w-[920px] w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Variants</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Price from</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => {
                const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
                const firstPrice = product.variants[0]?.salePrice ?? product.variants[0]?.price;

                return (
                  <tr className="align-top" key={product.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-text">{product.name}</p>
                      <p className="mt-1 text-xs text-text-muted">{product.slug}</p>
                    </td>
                    <td className="px-4 py-4 text-text-muted">{product.category.name}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-text">
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-text-muted">{product.variants.length}</td>
                    <td className="px-4 py-4 text-text-muted">{totalStock}</td>
                    <td className="px-4 py-4 text-text-muted">
                      {firstPrice ? `$${firstPrice.toString()}` : "No price"}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                        href={`/admin/products/${product.id}/edit`}
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
