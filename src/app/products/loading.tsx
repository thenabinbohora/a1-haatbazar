import { ProductGridSkeleton } from "@/components/product/product-grid";

export default function ProductsLoading({ showSearch = false }: { showSearch?: boolean }) {
  return (
    <div aria-busy="true" className="bg-background" role="status">
      <span className="sr-only">Loading products…</span>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="skeleton-shimmer h-4 w-28 rounded" />
          <div className="skeleton-shimmer mt-4 h-10 w-full max-w-xl rounded" />
          <div className="skeleton-shimmer mt-3 h-5 w-full max-w-2xl rounded" />
          {showSearch ? <div className="skeleton-shimmer mt-5 h-14 w-full max-w-xl rounded-2xl" /> : null}
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl min-w-0 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 lg:hidden">
          <div className="grid grid-cols-2 gap-2 max-[430px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="skeleton-shimmer h-11 rounded-lg" />
            <div className="skeleton-shimmer h-11 rounded-lg" />
          </div>
          <div className="skeleton-shimmer ml-1 mt-2 h-3 w-24 rounded" />
        </div>
        <div className="grid w-full max-w-full min-w-0 items-start gap-7 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] xl:gap-8">
          <div className="hidden rounded-2xl border border-border bg-surface p-5 shadow-sm lg:block">
            <div className="skeleton-shimmer h-4 w-24 rounded" />
            <div className="skeleton-shimmer mt-3 h-6 w-20 rounded" />
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                className="flex min-h-12 items-center justify-between gap-3 border-b border-border/80 py-2.5 last:border-b-0"
                key={index}
              >
                <div className="skeleton-shimmer h-4 w-32 rounded" />
                <div className="skeleton-shimmer h-3 w-3 shrink-0 rounded-sm" />
              </div>
            ))}
          </div>
          <div className="min-w-0">
            <div className="mb-5 hidden min-h-11 items-center justify-between gap-4 border-b border-border pb-2 lg:flex">
              <div className="skeleton-shimmer h-4 w-28 rounded" />
              <div className="flex shrink-0 items-center gap-2">
                <div className="skeleton-shimmer h-4 w-12 rounded" />
                <div className="skeleton-shimmer h-11 w-48 rounded-lg" />
              </div>
            </div>
            <ProductGridSkeleton />
          </div>
        </div>
      </section>
    </div>
  );
}
