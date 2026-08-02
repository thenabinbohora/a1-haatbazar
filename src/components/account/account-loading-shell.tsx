export function AccountLoadingShell() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading your account"
      className="min-h-[48rem] bg-background"
      data-route-loading-shell
      role="status"
    >
      <section className="mx-auto w-full max-w-[87.5rem] animate-pulse px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8 motion-reduce:animate-none">
        <div className="h-40 rounded-2xl border border-border bg-surface sm:h-36">
          <div className="p-5 sm:p-6">
            <div className="h-3 w-24 rounded bg-surface-muted" />
            <div className="mt-4 h-8 w-64 max-w-[70%] rounded bg-surface-muted" />
            <div className="mt-3 h-4 w-80 max-w-[85%] rounded bg-surface-muted" />
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[15.75rem_minmax(0,1fr)] xl:gap-8">
          <div className="hidden h-[28rem] rounded-2xl border border-border bg-surface lg:block" />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.85fr)]">
            <div className="h-[26rem] rounded-2xl border border-border bg-surface" />
            <div className="grid gap-5">
              <div className="h-52 rounded-2xl border border-border bg-surface" />
              <div className="h-44 rounded-2xl border border-border bg-surface" />
            </div>
          </div>
        </div>
        <span className="sr-only">Loading your account details…</span>
      </section>
    </div>
  );
}
