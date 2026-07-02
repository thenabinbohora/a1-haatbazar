import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { AdminEmptyState } from "@/components/admin/admin-states";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteConfirmation } from "@/components/admin/delete-confirmation";
import { prisma } from "@/lib/prisma";
import { createBannerAction, deleteBannerAction, updateBannerAction } from "./actions";

type BannersPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

function dateValue(value: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

const messages = {
  errors: {
    validation: "Check title, URLs, placement, sort order, and schedule dates.",
  },
};

export default async function AdminBannersPage({ searchParams }: BannersPageProps) {
  const params = await searchParams;
  const banners = await prisma.banner.findMany({
    orderBy: [{ placement: "asc" }, { sortOrder: "asc" }, { updatedAt: "desc" }],
    take: 100,
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Storefront content"
        title="Banners"
        description="Create and schedule storefront banners by placement. Image upload will move to Supabase Storage in a later stage."
      />

      <AdminActionMessage error={params?.error} messages={messages} success={params?.success} />

      <section className="mb-6 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Create banner</h2>
        <form action={createBannerAction} className="mt-5 grid gap-4 lg:grid-cols-4">
          <label className="block">
            <span className="text-sm font-semibold text-text">Title <span className="text-danger">*</span></span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="title" required />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Subtitle</span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="subtitle" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Placement</span>
            <select className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="placement">
              <option value="HOME_HERO">Home hero</option>
              <option value="HOME_STRIP">Home strip</option>
              <option value="CATEGORY_TOP">Category top</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Sort order</span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" defaultValue={0} min="0" name="sortOrder" step="1" type="number" />
          </label>
          <label className="block lg:col-span-2">
            <span className="text-sm font-semibold text-text">Image URL</span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="imageUrl" type="url" />
          </label>
          <label className="block lg:col-span-2">
            <span className="text-sm font-semibold text-text">Link URL</span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="linkUrl" placeholder="/products" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Starts</span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="startsAt" type="date" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Ends</span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="endsAt" type="date" />
          </label>
          <label className="mt-7 flex min-h-11 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm font-semibold text-text">
            <input defaultChecked name="isActive" type="checkbox" />
            Active
          </label>
          <div className="lg:col-span-4">
            <button className="min-h-11 cursor-pointer rounded-md bg-cta px-5 text-sm font-semibold text-white transition-colors hover:bg-cta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" type="submit">
              Create banner
            </button>
          </div>
        </form>
      </section>

      {banners.length === 0 ? (
        <AdminEmptyState title="No banners yet" description="Create a banner for future storefront hero or category placements." />
      ) : (
        <div className="polished-scrollbar overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
          <table className="min-w-[1000px] w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Banner</th>
                <th className="px-4 py-3">Placement</th>
                <th className="px-4 py-3">Schedule</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {banners.map((banner) => (
                <tr className="align-top hover:bg-surface-muted/60" key={banner.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-text">{banner.title}</p>
                    <p className="mt-1 text-xs text-text-muted">{banner.subtitle ?? "No subtitle"}</p>
                  </td>
                  <td className="px-4 py-4 text-text-muted">{banner.placement}</td>
                  <td className="px-4 py-4 text-text-muted">
                    {dateValue(banner.startsAt) || "Anytime"} to {dateValue(banner.endsAt) || "No end"}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-text">
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <details className="rounded-md border border-border bg-surface-muted p-3">
                      <summary className="cursor-pointer font-semibold text-primary">Edit</summary>
                      <form action={updateBannerAction} className="mt-3 grid gap-3">
                        <input name="id" type="hidden" value={banner.id} />
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="title" defaultValue={banner.title} required />
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="subtitle" defaultValue={banner.subtitle ?? ""} placeholder="Subtitle" />
                        <select className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="placement" defaultValue={banner.placement}>
                          <option value="HOME_HERO">Home hero</option>
                          <option value="HOME_STRIP">Home strip</option>
                          <option value="CATEGORY_TOP">Category top</option>
                        </select>
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="imageUrl" defaultValue={banner.imageUrl ?? ""} placeholder="Image URL" type="url" />
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="linkUrl" defaultValue={banner.linkUrl ?? ""} placeholder="Link URL" />
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" min="0" name="sortOrder" defaultValue={banner.sortOrder} step="1" type="number" />
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="startsAt" defaultValue={dateValue(banner.startsAt)} type="date" />
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="endsAt" defaultValue={dateValue(banner.endsAt)} type="date" />
                        <label className="flex items-center gap-2 text-sm font-semibold text-text">
                          <input defaultChecked={banner.isActive} name="isActive" type="checkbox" />
                          Active
                        </label>
                        <button className="min-h-10 cursor-pointer rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-muted" type="submit">
                          Save banner
                        </button>
                      </form>
                      <div className="mt-4 border-t border-border pt-3">
                        <DeleteConfirmation
                          action={deleteBannerAction}
                          hiddenFields={{ id: banner.id }}
                          itemName={banner.title}
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
