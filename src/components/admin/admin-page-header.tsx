type AdminPageHeaderProps = {
  actions?: React.ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
};

export function AdminPageHeader({
  actions,
  eyebrow,
  title,
  description,
}: AdminPageHeaderProps) {
  return (
    <div className="a1-admin-page-header mb-5 flex flex-col gap-4 px-1 py-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.15em] text-fresh">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-extrabold leading-tight text-primary sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-text-muted">
          {description}
        </p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
