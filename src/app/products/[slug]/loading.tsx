import { ProductGridSkeleton } from "@/components/product/product-grid";

export default function ProductDetailLoading() {
  return (
    <div aria-busy="true" className="bg-background" role="status">
      <span className="sr-only">Loading product details…</span>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="skeleton-shimmer h-5 w-72 max-w-full rounded" />
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div>
          <div className="skeleton-shimmer aspect-square rounded-lg border border-border" />
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="skeleton-shimmer aspect-square rounded-md" key={index} />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
          <div className="skeleton-shimmer h-4 w-28 rounded" />
          <div className="skeleton-shimmer mt-4 h-10 w-full rounded" />
          <div className="skeleton-shimmer mt-3 h-5 w-3/4 rounded" />
          <div className="skeleton-shimmer mt-6 h-28 rounded-lg" />
          <div className="mt-5 space-y-2">
            <div className="skeleton-shimmer h-16 rounded-md" />
            <div className="skeleton-shimmer h-16 rounded-md" />
            <div className="skeleton-shimmer h-16 rounded-md" />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <ProductGridSkeleton />
      </section>
    </div>
  );
}
