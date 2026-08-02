type AdminEmptyStateProps = {
  title: string;
  description: string;
};

export function AdminEmptyState({ title, description }: AdminEmptyStateProps) {
  return (
    <div className="a1-admin-card border-dashed px-5 py-7 text-center">
      <p className="text-base font-extrabold text-text">{title}</p>
      <p className="mx-auto mt-1 max-w-xl text-sm leading-6 text-text-muted">{description}</p>
    </div>
  );
}

export function AdminLoadingState() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading admin dashboard">
      <span className="sr-only" role="status">Loading admin dashboard</span>
      <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="skeleton-shimmer h-3 w-36 rounded" />
          <div className="skeleton-shimmer mt-3 h-9 w-52 rounded-lg" />
          <div className="skeleton-shimmer mt-2 h-4 w-80 max-w-full rounded" />
        </div>
        <div className="skeleton-shimmer h-11 w-80 max-w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="a1-admin-card min-h-40 p-4" key={index}>
            <div className="skeleton-shimmer h-4 w-24 rounded" />
            <div className="skeleton-shimmer mt-4 h-8 w-20 rounded" />
            <div className="skeleton-shimmer mt-4 h-3 w-full rounded" />
            <div className="skeleton-shimmer mt-2 h-3 w-3/4 rounded" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-12">
        <div className="a1-admin-card h-[360px] p-5 xl:col-span-8">
          <div className="skeleton-shimmer h-5 w-40 rounded" />
          <div className="skeleton-shimmer mt-7 h-[250px] w-full rounded-xl" />
        </div>
        <div className="a1-admin-card h-[360px] p-5 xl:col-span-4">
          <div className="skeleton-shimmer h-5 w-40 rounded" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="skeleton-shimmer h-24 rounded-xl" key={index} />
            ))}
          </div>
        </div>
        <div className="a1-admin-card h-72 p-5 xl:col-span-8">
          <div className="skeleton-shimmer h-5 w-36 rounded" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="skeleton-shimmer h-11 rounded-lg" key={index} />
            ))}
          </div>
        </div>
        <div className="a1-admin-card h-72 p-5 xl:col-span-4">
          <div className="skeleton-shimmer h-5 w-36 rounded" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="skeleton-shimmer h-14 rounded-lg" key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type AdminErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function AdminErrorState({
  title = "Admin content could not load",
  description = "Refresh the page or try again in a moment.",
  onRetry,
}: AdminErrorStateProps) {
  return (
    <div className="rounded-lg border border-danger bg-danger-soft p-6 shadow-sm">
      <p className="text-base font-semibold text-danger">{title}</p>
      <p className="mt-2 text-sm leading-6 text-danger">{description}</p>
      {onRetry ? (
        <button
          className="mt-4 min-h-10 cursor-pointer rounded-md bg-danger px-4 text-sm font-semibold text-white transition-colors hover:bg-red-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
          onClick={onRetry}
          type="button"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
