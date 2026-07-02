import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { AdminEmptyState } from "@/components/admin/admin-states";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteConfirmation } from "@/components/admin/delete-confirmation";
import { prisma } from "@/lib/prisma";
import { createCouponAction, deleteCouponAction, updateCouponAction } from "./actions";

type CouponsPageProps = {
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
    validation: "Check coupon code, value, dates, and usage limits.",
    unique: "A coupon with that code already exists.",
  },
};

export default async function AdminCouponsPage({ searchParams }: CouponsPageProps) {
  const params = await searchParams;
  const coupons = await prisma.coupon.findMany({
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    take: 100,
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Promotions"
        title="Coupons"
        description="Create and manage discount codes. Checkout recalculates coupon eligibility and totals before creating orders."
      />

      <AdminActionMessage error={params?.error} messages={messages} success={params?.success} />

      <section className="mb-6 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Create coupon</h2>
        <form action={createCouponAction} className="mt-5 grid gap-4 lg:grid-cols-4">
          <label className="block">
            <span className="text-sm font-semibold text-text">Code <span className="text-danger">*</span></span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm uppercase text-text focus:border-cta" name="code" placeholder="WELCOME10" required />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Name <span className="text-danger">*</span></span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="name" required />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Type</span>
            <select className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="type" defaultValue="PERCENT">
              <option value="PERCENT">Percent</option>
              <option value="FIXED_AMOUNT">Fixed amount</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Value <span className="text-danger">*</span></span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" min="0" name="value" required step="0.01" type="number" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Minimum subtotal</span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" min="0" name="minimumSubtotal" step="0.01" type="number" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Max discount</span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" min="0" name="maxDiscount" step="0.01" type="number" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Usage limit</span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" min="1" name="usageLimit" step="1" type="number" />
          </label>
          <label className="mt-7 flex min-h-11 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm font-semibold text-text">
            <input defaultChecked name="isActive" type="checkbox" />
            Active
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Starts</span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="startsAt" type="date" />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-text">Expires</span>
            <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" name="expiresAt" type="date" />
          </label>
          <div className="lg:col-span-4">
            <button className="min-h-11 cursor-pointer rounded-md bg-cta px-5 text-sm font-semibold text-white transition-colors hover:bg-cta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" type="submit">
              Create coupon
            </button>
          </div>
        </form>
      </section>

      {coupons.length === 0 ? (
        <AdminEmptyState title="No coupons yet" description="Create a coupon when you are ready to offer a customer discount." />
      ) : (
        <div className="polished-scrollbar overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Coupon</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Rules</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((coupon) => (
                <tr className="align-top hover:bg-surface-muted/60" key={coupon.id}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-text">{coupon.code}</p>
                    <p className="mt-1 text-xs text-text-muted">{coupon.name}</p>
                  </td>
                  <td className="px-4 py-4 text-text-muted">
                    {coupon.type === "PERCENT" ? `${coupon.value.toString()}%` : `$${coupon.value.toString()}`}
                  </td>
                  <td className="px-4 py-4 text-text-muted">
                    Min {coupon.minimumSubtotal ? `$${coupon.minimumSubtotal.toString()}` : "none"} / Limit {coupon.usageLimit ?? "none"}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-semibold text-text">
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-text-muted">{coupon.usedCount}</td>
                  <td className="px-4 py-4">
                    <details className="rounded-md border border-border bg-surface-muted p-3">
                      <summary className="cursor-pointer font-semibold text-primary">Edit</summary>
                      <form action={updateCouponAction} className="mt-3 grid gap-3">
                        <input name="id" type="hidden" value={coupon.id} />
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="code" defaultValue={coupon.code} required />
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="name" defaultValue={coupon.name} required />
                        <select className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="type" defaultValue={coupon.type}>
                          <option value="PERCENT">Percent</option>
                          <option value="FIXED_AMOUNT">Fixed amount</option>
                        </select>
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" min="0" name="value" defaultValue={coupon.value.toString()} required step="0.01" type="number" />
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" min="0" name="minimumSubtotal" defaultValue={coupon.minimumSubtotal?.toString() ?? ""} placeholder="Minimum subtotal" step="0.01" type="number" />
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" min="0" name="maxDiscount" defaultValue={coupon.maxDiscount?.toString() ?? ""} placeholder="Max discount" step="0.01" type="number" />
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" min="1" name="usageLimit" defaultValue={coupon.usageLimit ?? ""} placeholder="Usage limit" step="1" type="number" />
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="startsAt" defaultValue={dateValue(coupon.startsAt)} type="date" />
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="expiresAt" defaultValue={dateValue(coupon.expiresAt)} type="date" />
                        <label className="flex items-center gap-2 text-sm font-semibold text-text">
                          <input defaultChecked={coupon.isActive} name="isActive" type="checkbox" />
                          Active
                        </label>
                        <button className="min-h-10 cursor-pointer rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-muted" type="submit">
                          Save coupon
                        </button>
                      </form>
                      <div className="mt-4 border-t border-border pt-3">
                        <DeleteConfirmation
                          action={deleteCouponAction}
                          hiddenFields={{ id: coupon.id }}
                          itemName={coupon.code}
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
