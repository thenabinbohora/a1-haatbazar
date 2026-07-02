import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { AdminEmptyState } from "@/components/admin/admin-states";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { prisma } from "@/lib/prisma";
import { adjustInventoryAction } from "./actions";

type InventoryPageProps = {
  searchParams?: Promise<{
    q?: string;
    stock?: string;
    error?: string;
    success?: string;
  }>;
};

const messages = {
  errors: {
    validation: "Check the selected variant, adjustment quantity, reason, and note.",
    "negative-stock": "That adjustment would make stock negative.",
  },
  successes: {
    updated: "Inventory adjusted and logged.",
  },
};

export default async function AdminInventoryPage({ searchParams }: InventoryPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? "";
  const stock = params?.stock ?? "";

  const [inventoryMetricsSource, rawVariants] = await Promise.all([
    prisma.productVariant.findMany({
      select: {
        stock: true,
        lowStockThreshold: true,
      },
    }),
    prisma.productVariant.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { sku: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
              { product: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
        : {}),
    },
    include: {
      product: { select: { name: true, status: true } },
      inventoryLogs: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true, quantityChange: true, reason: true },
      },
    },
    orderBy: [{ stock: "asc" }, { updatedAt: "desc" }],
    take: 100,
    }),
  ]);
  const variants = rawVariants.filter((variant) => {
    if (stock === "low") {
      return variant.stock > 0 && variant.stock <= variant.lowStockThreshold;
    }

    if (stock === "out") {
      return variant.stock === 0;
    }

    return true;
  });
  const totalSkuCount = inventoryMetricsSource.length;
  const outOfStockCount = inventoryMetricsSource.filter((variant) => variant.stock === 0).length;
  const lowStockCount = inventoryMetricsSource.filter(
    (variant) => variant.stock > 0 && variant.stock <= variant.lowStockThreshold,
  ).length;
  const availableSkuCount = inventoryMetricsSource.filter((variant) => variant.stock > 0).length;

  return (
    <div>
      <AdminPageHeader
        eyebrow="Stock control"
        title="Inventory"
        description="Review stock levels and make audited stock adjustments for product variants."
      />

      <AdminActionMessage error={params?.error} messages={messages} success={params?.success} />

      <div className="mb-5 grid gap-3 md:grid-cols-4">
        {[
          ["Total SKUs", totalSkuCount, "text-text"],
          ["Available", availableSkuCount, "text-fresh"],
          ["Low stock", lowStockCount, "text-warning"],
          ["Out of stock", outOfStockCount, "text-danger"],
        ].map(([label, value, tone]) => (
          <div className="rounded-lg border border-border bg-surface p-4 shadow-sm" key={label}>
            <p className="text-xs font-semibold uppercase text-text-muted">{label}</p>
            <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      <form className="mb-5 grid gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm lg:grid-cols-[1fr_220px_auto]">
        <label className="block">
          <span className="text-sm font-semibold text-text">Search</span>
          <input className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" defaultValue={query} name="q" placeholder="Product, variant, or SKU" type="search" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold text-text">Stock</span>
          <select className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta" defaultValue={stock} name="stock">
            <option value="">Any stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>
        </label>
        <button className="mt-7 min-h-11 cursor-pointer rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" type="submit">
          Filter
        </button>
      </form>

      {variants.length === 0 ? (
        <AdminEmptyState title="No variants found" description="Create product variants before adjusting inventory." />
      ) : (
        <div className="polished-scrollbar overflow-x-auto rounded-lg border border-border bg-surface shadow-sm">
          <table className="min-w-[1100px] w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase text-text-muted">
              <tr>
                <th className="px-4 py-3">Variant</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Product status</th>
                <th className="px-4 py-3">Last change</th>
                <th className="px-4 py-3">Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {variants.map((variant) => {
                const lastLog = variant.inventoryLogs[0];
                const stockTone = variant.stock === 0 ? "text-danger" : variant.stock <= variant.lowStockThreshold ? "text-warning" : "text-text";

                return (
                  <tr className="align-top hover:bg-surface-muted/60" key={variant.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-text">{variant.product.name}</p>
                      <p className="mt-1 text-xs text-text-muted">{variant.name}</p>
                    </td>
                    <td className="px-4 py-4 text-text-muted">{variant.sku}</td>
                    <td className={`px-4 py-4 font-semibold ${stockTone}`}>
                      <p>{variant.stock}</p>
                      <p className="mt-1 text-xs font-semibold text-text-muted">Low at {variant.lowStockThreshold}</p>
                    </td>
                    <td className="px-4 py-4 text-text-muted">
                      <p>{variant.product.status}</p>
                      <p className="mt-1 text-xs">{variant.status}</p>
                    </td>
                    <td className="px-4 py-4 text-text-muted">
                      {lastLog ? `${lastLog.quantityChange > 0 ? "+" : ""}${lastLog.quantityChange} ${lastLog.reason}` : "No log"}
                    </td>
                    <td className="px-4 py-4">
                      <form action={adjustInventoryAction} className="grid gap-2 lg:grid-cols-[120px_170px_1fr_auto]">
                        <input name="variantId" type="hidden" value={variant.id} />
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="quantityChange" placeholder="+10 / -2" step="1" type="number" />
                        <select className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="reason" defaultValue="MANUAL_ADMIN">
                          <option value="MANUAL_ADMIN">Manual admin</option>
                          <option value="SUPPLIER_RESTOCK">Supplier restock</option>
                          <option value="DAMAGE">Damage</option>
                          <option value="CORRECTION">Correction</option>
                        </select>
                        <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text focus:border-cta" name="note" placeholder="Note" />
                        <button className="min-h-10 cursor-pointer rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" type="submit">
                          Adjust
                        </button>
                      </form>
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
