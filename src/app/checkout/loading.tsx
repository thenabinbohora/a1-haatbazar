export default function CheckoutLoading() {
  return (
    <div
      aria-busy="true"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      role="status"
    >
      <span className="sr-only">Loading checkout…</span>
      <div className="skeleton-shimmer h-12 max-w-md rounded-md" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="grid gap-6">
          <div className="skeleton-shimmer h-64 rounded-lg border border-border" />
          <div className="skeleton-shimmer h-80 rounded-lg border border-border" />
          <div className="skeleton-shimmer h-48 rounded-lg border border-border" />
        </div>
        <div className="skeleton-shimmer h-96 rounded-lg border border-border" />
      </div>
    </div>
  );
}
