import { ProductGridSkeleton } from "@/components/product/product-grid";

export default function ProductsLoading() {
  return (
    <div className="bg-background">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="skeleton-shimmer h-4 w-28 rounded" />
          <div className="skeleton-shimmer mt-4 h-10 w-full max-w-xl rounded" />
          <div className="skeleton-shimmer mt-3 h-5 w-full max-w-2xl rounded" />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductGridSkeleton />
      </section>
    </div>
  );
}
