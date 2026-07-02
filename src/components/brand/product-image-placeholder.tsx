import { customerProductName } from "@/lib/display";

type ProductImagePlaceholderProps = {
  name: string;
  category?: string;
  compact?: boolean;
};

function initials(value: string) {
  return customerProductName(value)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ProductImagePlaceholder({ name, category, compact = false }: ProductImagePlaceholderProps) {
  return (
    <div className="relative flex h-full min-h-full w-full overflow-hidden bg-[linear-gradient(135deg,#FFFFFF_0%,#FAF8F1_62%,#EEF7EF_100%)]">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[14px] border-primary/15" />
      <div className="absolute -bottom-10 left-5 h-24 w-44 rounded-[100%] bg-primary/15" />
      <div className="absolute bottom-5 right-5 h-12 w-24 rounded-[100%] bg-cta/25" />
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center p-5 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-white/85 text-xl font-extrabold text-primary shadow-sm">
          {initials(name) || "A1"}
        </span>
        {compact ? null : (
          <>
            <span className="mt-3 line-clamp-2 text-sm font-bold leading-5 text-primary">{customerProductName(name)}</span>
            {category ? <span className="mt-1 text-xs font-semibold uppercase text-text-muted">{category}</span> : null}
          </>
        )}
      </div>
    </div>
  );
}
