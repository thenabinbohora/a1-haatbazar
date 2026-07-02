type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
};

export function AdminPageHeader({ eyebrow, title, description }: AdminPageHeaderProps) {
  return (
    <div className="a1-admin-page-header mb-6 p-5 sm:p-6">
      {eyebrow ? (
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-fresh">{eyebrow}</p>
      ) : null}
      <h1 className="mt-2 text-3xl font-extrabold leading-tight text-primary sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-text-muted">{description}</p>
    </div>
  );
}
