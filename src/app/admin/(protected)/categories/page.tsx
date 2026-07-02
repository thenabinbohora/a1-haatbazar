import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { AdminEmptyState } from "@/components/admin/admin-states";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteConfirmation } from "@/components/admin/delete-confirmation";
import { prisma } from "@/lib/prisma";
import { createCategoryAction, deleteCategoryAction, updateCategoryAction } from "./actions";

type CategoriesPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

const messages = {
  errors: {
    validation: "Check the category name, slug, parent, URL, and sort order.",
    unique: "A category with that slug already exists.",
    linked: "This category is linked to products or child categories and cannot be deleted.",
  },
};

export default async function AdminCategoriesPage({ searchParams }: CategoriesPageProps) {
  const params = await searchParams;
  const categories = await prisma.category.findMany({
    include: {
      parent: { select: { name: true } },
      _count: { select: { products: true, children: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalog operations"
        title="Categories"
        description="Create and manage product categories so products can be grouped, filtered, and featured."
      />

      <AdminActionMessage error={params?.error} messages={messages} success={params?.success} />

      <section className="mb-6 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Create category</h2>
        <form action={createCategoryAction} className="mt-5 grid gap-4 lg:grid-cols-4">
          <label className="block">
            <span className="text-sm font-semibold text-text">Name <span className="text-danger">*</span></span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="name" required />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Slug <span className="text-danger">*</span></span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="slug" placeholder="rice-grains" required />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Parent</span>
            <select className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="parentId">
              <option value="">No parent</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Sort order</span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" defaultValue={0} min="0" name="sortOrder" step="1" type="number" />
          </label>
          <label className="block lg:col-span-2">
            <span className="text-sm font-semibold text-text">Description</span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="description" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Image or icon URL</span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="imageUrl" placeholder="/product-images/a1-premium-basmati-rice.webp" />
          </label>
          <label className="mt-7 flex min-h-11 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm font-semibold text-text">
            <input name="isFeatured" type="checkbox" />
            Featured
          </label>
          <div className="lg:col-span-4">
            <button className="min-h-11 cursor-pointer rounded-md bg-cta px-5 text-sm font-semibold text-white transition-colors hover:bg-cta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" type="submit">
              Create category
            </button>
          </div>
        </form>
      </section>

      {categories.length === 0 ? (
        <AdminEmptyState title="No categories yet" description="Create a category here, then return to product creation and select it." />
      ) : (
        <div className="polished-scrollbar overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">Featured</th>
                <th className="px-4 py-3">Products</th>
                <th className="px-4 py-3">Sort</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((category) => (
                <tr className="align-top hover:bg-surface-muted/60" key={category.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-text">{category.name}</p>
                    {category.imageUrl ? (
                      <p className="mt-1 max-w-xs truncate text-xs font-semibold text-cta-hover">{category.imageUrl}</p>
                    ) : null}
                    <p className="mt-1 max-w-xs text-xs leading-5 text-text-muted">
                      {category.description ?? "No description"}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-text-muted">{category.slug}</td>
                  <td className="px-4 py-4 text-text-muted">{category.parent?.name ?? "None"}</td>
                  <td className="px-4 py-4 text-text-muted">{category.isFeatured ? "Yes" : "No"}</td>
                  <td className="px-4 py-4 text-text-muted">{category._count.products}</td>
                  <td className="px-4 py-4 text-text-muted">{category.sortOrder}</td>
                  <td className="px-4 py-4">
                    <details className="rounded-md border border-border bg-surface-muted p-3">
                      <summary className="cursor-pointer font-semibold text-primary">Edit advanced</summary>
                      <form action={updateCategoryAction} className="mt-3 grid gap-3">
                        <input name="id" type="hidden" value={category.id} />
                        <label className="block">
                          <span className="text-xs font-semibold text-text">Name</span>
                          <input className="mt-1 min-h-10 w-full rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="name" defaultValue={category.name} required />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold text-text">Slug</span>
                          <input className="mt-1 min-h-10 w-full rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="slug" defaultValue={category.slug} required />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold text-text">Description</span>
                          <input className="mt-1 min-h-10 w-full rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="description" defaultValue={category.description ?? ""} />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold text-text">Image or icon URL</span>
                          <input className="mt-1 min-h-10 w-full rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="imageUrl" defaultValue={category.imageUrl ?? ""} />
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold text-text">Parent</span>
                          <select className="mt-1 min-h-10 w-full rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="parentId" defaultValue={category.parentId ?? ""}>
                            <option value="">No parent</option>
                            {categories
                              .filter((item) => item.id !== category.id)
                              .map((item) => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                              ))}
                          </select>
                        </label>
                        <label className="block">
                          <span className="text-xs font-semibold text-text">Sort order</span>
                          <input className="mt-1 min-h-10 w-full rounded-md border border-border bg-surface px-3 text-text focus:border-cta" defaultValue={category.sortOrder} min="0" name="sortOrder" step="1" type="number" />
                        </label>
                        <label className="flex items-center gap-2 text-sm font-semibold text-text">
                          <input defaultChecked={category.isFeatured} name="isFeatured" type="checkbox" />
                          Featured
                        </label>
                        <button className="min-h-10 cursor-pointer rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-muted" type="submit">
                          Save category
                        </button>
                      </form>
                      <div className="mt-4 border-t border-border pt-3">
                        <DeleteConfirmation
                          action={deleteCategoryAction}
                          hiddenFields={{ id: category.id }}
                          itemName={category.name}
                        />
                      </div>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
