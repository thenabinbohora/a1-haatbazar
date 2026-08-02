export default function CartLoading() {
  return (
    <div
      aria-busy="true"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
      role="status"
    >
      <span className="sr-only">Loading your cart…</span>
      <div className="skeleton-shimmer h-12 max-w-md rounded-md" />
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4">
          {[1, 2, 3].map((item) => (
            <div className="skeleton-shimmer h-32 rounded-lg border border-border" key={item} />
          ))}
        </div>
        <div className="skeleton-shimmer h-80 rounded-lg border border-border" />
      </div>
    </div>
  );
}
