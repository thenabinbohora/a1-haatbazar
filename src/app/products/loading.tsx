import { ProductGridSkeleton } from "@/components/product/product-grid";

export default function ProductsLoading({ showSearch = false }: { showSearch?: boolean }) {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="skeleton-shimmer h-4 w-28 rounded" />
          <div className="skeleton-shimmer mt-4 h-10 w-full max-w-xl rounded" />
          <div className="skeleton-shimmer mt-3 h-5 w-full max-w-2xl rounded" />
          {showSearch ? <div className="skeleton-shimmer mt-5 h-14 w-full max-w-xl rounded-2xl" /> : null}
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 grid grid-cols-2 gap-2 lg:hidden">
          <div className="skeleton-shimmer h-12 rounded-xl" />
          <div className="skeleton-shimmer h-12 rounded-xl" />
        </div>
        <ProductGridSkeleton />
      </section>
    </div>
  );
}
