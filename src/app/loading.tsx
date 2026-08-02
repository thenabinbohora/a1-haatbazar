export default function StorefrontLoading() {
  return (
    <div
      aria-busy="true"
      className="min-h-[calc(100dvh-var(--site-header-offset))] bg-background"
      data-route-loading-shell
      role="status"
    >
      <span className="sr-only">Loading the next page…</span>
      <div className="route-loading-bar" />
      <section aria-hidden="true" className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="skeleton-shimmer h-4 w-28 rounded" />
          <div className="skeleton-shimmer mt-4 h-10 w-full max-w-xl rounded" />
          <div className="skeleton-shimmer mt-3 h-5 w-full max-w-2xl rounded" />
        </div>
      </section>
      <section aria-hidden="true" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-5 lg:hidden">
          <div className="grid grid-cols-2 gap-2 max-[430px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div className="skeleton-shimmer h-11 rounded-lg" />
            <div className="skeleton-shimmer h-11 rounded-lg" />
          </div>
          <div className="skeleton-shimmer ml-1 mt-2 h-3 w-24 rounded" />
        </div>
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)] xl:gap-8">
          <div className="hidden rounded-2xl border border-border bg-surface p-5 shadow-sm lg:block">
            <div className="skeleton-shimmer h-5 w-28 rounded" />
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
            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm" key={index}>
                  <div className="skeleton-shimmer aspect-[4/3]" />
                  <div className="p-3 sm:p-4">
                    <div className="skeleton-shimmer h-5 w-24 rounded-full" />
                    <div className="skeleton-shimmer mt-3 h-5 w-4/5 rounded" />
                    <div className="skeleton-shimmer mt-2 h-4 w-2/3 rounded" />
                    <div className="skeleton-shimmer mt-4 h-7 w-28 rounded" />
                    <div className="skeleton-shimmer mt-3 h-11 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
