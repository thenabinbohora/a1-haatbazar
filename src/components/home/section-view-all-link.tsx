"use client";

import Link, { useLinkStatus } from "next/link";

type MobilePlacement = "below-content" | "inline";
type DesktopPlacement = "header" | "below-content";

type SectionViewAllLinkProps = {
  href: string;
  label: string;
  accessibleLabel?: string;
  showArrow?: boolean;
  mobilePlacement?: MobilePlacement;
  desktopPlacement?: DesktopPlacement;
  className?: string;
};

function SectionLinkContent({ label, showArrow }: { label: string; showArrow: boolean }) {
  const { pending } = useLinkStatus();

  return (
    <>
      <span>{label}</span>
      {showArrow ? (
        pending ? (
          <span
            aria-hidden="true"
            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
          />
        ) : (
          <svg
            aria-hidden="true"
            className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
            fill="none"
            focusable="false"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        )
      ) : null}
      {pending ? <span className="sr-only">Loading destination…</span> : null}
    </>
  );
}

export function SectionViewAllLink({
  href,
  label,
  accessibleLabel = label,
  showArrow = true,
  mobilePlacement = "below-content",
  desktopPlacement = "header",
  className = "",
}: SectionViewAllLinkProps) {
  const mobilePlacementClass =
    mobilePlacement === "below-content"
      ? "order-3 mt-4 flex justify-center sm:mt-5"
      : "flex justify-start";
  const desktopPlacementClass =
    desktopPlacement === "header"
      ? "lg:order-none lg:col-start-2 lg:row-start-1 lg:mb-7 lg:mt-0 lg:items-end lg:justify-end"
      : "lg:col-span-2 lg:row-start-3 lg:mt-5 lg:justify-center";

  return (
    <div className={`min-w-0 ${mobilePlacementClass} ${desktopPlacementClass}`}>
      <Link
        aria-label={accessibleLabel}
        className={`group inline-flex min-h-11 w-fit shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-cta/25 bg-surface px-5 text-sm font-bold text-primary shadow-sm transition-[border-color,background-color,color] duration-200 hover:border-cta/45 hover:bg-hero active:border-cta/55 active:bg-cta-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none ${className}`}
        href={href}
        prefetch={false}
        scroll
      >
        <SectionLinkContent label={label} showArrow={showArrow} />
      </Link>
    </div>
  );
}
