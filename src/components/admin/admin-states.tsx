type AdminEmptyStateProps = {
  title: string;
  description: string;
};

export function AdminEmptyState({ title, description }: AdminEmptyStateProps) {
  return (
    <div className="a1-admin-card border-dashed p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-fresh-soft text-sm font-black text-primary">
        A1
      </div>
      <p className="mt-4 text-base font-bold text-text">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-text-muted">{description}</p>
    </div>
  );
}

export function AdminLoadingState() {
  return (
    <div className="space-y-4" aria-label="Loading admin content">
      <div className="skeleton-shimmer h-8 w-56 rounded-md" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="a1-admin-card p-5" key={index}>
            <div className="skeleton-shimmer h-4 w-24 rounded" />
            <div className="skeleton-shimmer mt-4 h-8 w-20 rounded" />
            <div className="skeleton-shimmer mt-3 h-3 w-32 rounded" />
          </div>
        ))}
      </div>
      <div className="skeleton-shimmer h-48 rounded-lg border border-border" />
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
