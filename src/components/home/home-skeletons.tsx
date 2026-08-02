type HomeProductGridSkeletonProps = {
  variant: "fresh" | "featured" | "best-sellers";
};

function CategorySkeletonCard({ index }: { index: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
      key={index}
    >
      <div className="skeleton-shimmer aspect-[5/4] w-full" />
      <div className="flex min-h-[5.5rem] flex-1 flex-col p-3 sm:min-h-[5.75rem] sm:p-4">
        <div className="skeleton-shimmer h-5 w-4/5 rounded" />
        <div className="skeleton-shimmer mt-auto h-4 w-20 rounded" />
      </div>
    </div>
  );
}

export function HomeCategoryCardsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <CategorySkeletonCard index={index} key={index} />
      ))}
    </>
  );
}

function WeeklyOfferSkeletonCard({ index }: { index: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-full basis-[clamp(16.875rem,75vw,20rem)] shrink-0 flex-col overflow-hidden rounded-2xl border border-cta/20 bg-surface shadow-sm sm:basis-[calc((100%_-_1rem)/2)] lg:basis-auto"
      key={index}
    >
      <div className="skeleton-shimmer h-[clamp(11.25rem,50vw,13rem)] sm:h-auto sm:aspect-[7/5] lg:aspect-[5/4]" />
      <div className="flex min-h-[13.25rem] flex-1 flex-col p-2.5 sm:p-3 lg:min-h-[18.375rem] lg:p-4">
        <div className="skeleton-shimmer h-6 w-28 rounded-full lg:h-7" />
        <div className="skeleton-shimmer mt-2.5 hidden h-4 w-24 rounded lg:block" />
        <div className="mt-2 min-h-10 lg:mt-1 lg:min-h-12">
          <div className="skeleton-shimmer h-5 w-4/5 rounded lg:h-6" />
          <div className="skeleton-shimmer mt-1 h-5 w-3/5 rounded lg:h-6" />
        </div>
        <div className="skeleton-shimmer mt-2.5 h-4 w-2/3 rounded" />
        <div className="mt-auto pt-2 lg:pt-3">
          <div className="skeleton-shimmer h-7 w-32 rounded lg:h-8" />
          <div className="skeleton-shimmer mt-1.5 hidden h-5 w-36 rounded xl:block" />
        </div>
        <div className="skeleton-shimmer mt-3 h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function HomeWeeklyOffersSkeleton() {
  return (
    <section aria-hidden="true" className="border-y border-cta/15 bg-cta-soft">
      <div className="mx-auto max-w-7xl px-4 pb-9 pt-7 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="mb-4 flex items-end justify-between gap-4 sm:mb-7">
          <div className="min-w-0 flex-1">
            <div className="skeleton-shimmer h-4 w-28 rounded" />
            <div className="skeleton-shimmer mt-3 h-8 w-full max-w-md rounded sm:h-10" />
            <div className="skeleton-shimmer mt-3 hidden h-5 w-full max-w-2xl rounded sm:block" />
          </div>
          <div className="skeleton-shimmer hidden h-11 w-24 shrink-0 rounded-full md:block" />
        </div>
        <div className="-mx-4 flex min-w-0 gap-3 overflow-hidden px-4 pb-1 pt-3 sm:-mx-6 sm:gap-4 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:px-0 xl:gap-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <WeeklyOfferSkeletonCard index={index} key={index} />
          ))}
        </div>
        <div className="mt-4 flex justify-center sm:mt-5 lg:hidden">
          <div className="skeleton-shimmer h-11 w-32 rounded-full" />
        </div>
      </div>
    </section>
  );
}

function ProductSkeletonCard({ index }: { index: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
      key={index}
    >
      <div className="skeleton-shimmer aspect-[4/3] w-full" />
      <div className="flex min-h-[16.5rem] flex-1 flex-col p-3 sm:min-h-64 sm:p-4">
        <div className="skeleton-shimmer h-6 w-24 rounded-full" />
        <div className="skeleton-shimmer mt-3 h-3 w-20 rounded" />
        <div className="mt-1 min-h-10 sm:min-h-12">
          <div className="skeleton-shimmer h-5 w-4/5 rounded sm:h-6" />
          <div className="skeleton-shimmer mt-1 h-5 w-3/5 rounded sm:h-6" />
        </div>
        <div className="skeleton-shimmer mt-1 h-4 w-2/3 rounded sm:mt-1.5" />
        <div className="mt-auto pt-4">
          <div className="min-h-11 border-t border-border/70 pt-2.5">
            <div className="skeleton-shimmer h-7 w-28 rounded" />
          </div>
          <div className="skeleton-shimmer mt-3 h-11 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function HomeProductGridSkeleton({ variant }: HomeProductGridSkeletonProps) {
  const gridClass =
    variant === "fresh"
      ? "grid w-full max-w-full min-w-0 auto-rows-fr grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-6 md:auto-rows-auto md:grid-cols-3 md:gap-y-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
      : "grid w-full max-w-full min-w-0 auto-rows-fr grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4";

  return (
    <div className={gridClass}>
      {Array.from({ length: 4 }).map((_, index) => (
        <ProductSkeletonCard index={index} key={index} />
      ))}
    </div>
  );
}

export function HomePageLoadingSkeleton() {
  return (
    <div aria-hidden="true" className="min-h-[calc(100dvh-var(--site-header-offset))] overflow-x-clip bg-background">
      <section className="relative overflow-hidden border-b border-border bg-hero">
        <div className="relative mx-auto grid min-w-0 max-w-7xl gap-4 px-4 py-4 sm:px-6 sm:py-10 md:gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-10 lg:px-8 lg:py-14">
          <div className="min-w-0 self-center">
            <div className="skeleton-shimmer h-4 w-52 max-w-full rounded" />
            <div className="skeleton-shimmer mt-3 h-9 w-full max-w-xl rounded sm:h-12" />
            <div className="skeleton-shimmer mt-2 h-9 w-4/5 max-w-lg rounded sm:h-12" />
            <div className="skeleton-shimmer mt-5 hidden h-5 w-full max-w-2xl rounded md:block" />
            <div className="skeleton-shimmer mt-7 hidden h-14 w-full max-w-2xl rounded-full md:block" />
            <div className="mt-5 grid grid-cols-2 gap-2.5 sm:flex sm:gap-3">
              <div className="skeleton-shimmer h-12 rounded-xl sm:w-40" />
              <div className="skeleton-shimmer h-12 rounded-xl sm:w-40" />
            </div>
          </div>
          <div className="skeleton-shimmer relative hidden h-[360px] rounded-2xl border border-primary/10 md:block lg:h-full lg:min-h-[560px]" />
        </div>
      </section>

      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 lg:py-5">
          <div className="grid auto-rows-fr grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div className="flex min-h-14 items-center gap-2 rounded-xl border border-border bg-surface p-2" key={index}>
                <div className="skeleton-shimmer h-9 w-9 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="skeleton-shimmer h-4 w-full max-w-28 rounded" />
                  <div className="skeleton-shimmer mt-2 hidden h-4 w-full rounded lg:block" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 pt-5 sm:px-6 sm:pb-10 sm:pt-14 lg:px-8 lg:py-16">
        <div className="mb-6">
          <div className="skeleton-shimmer h-4 w-32 rounded" />
          <div className="skeleton-shimmer mt-3 h-8 w-full max-w-lg rounded sm:h-10" />
          <div className="skeleton-shimmer mt-3 h-5 w-full max-w-2xl rounded" />
        </div>
        <div className="grid min-w-0 auto-rows-fr grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <HomeCategoryCardsSkeleton />
        </div>
      </section>
    </div>
  );
}
