import Image from "next/image";
import Link from "next/link";
import { APP_NAME, BRAND_ICON_SRC, BRAND_LOGO_SRC } from "@/lib/constants";

type BrandLogoProps = {
  href?: string;
  variant?: "light" | "dark";
  compact?: boolean;
  display?: "lockup" | "full" | "mark";
};

export function BrandLogo({ href = "/", variant = "light", compact = false, display = "lockup" }: BrandLogoProps) {
  const logoDisplay = compact ? "mark" : display;

  const mark = (
    <span className="block shrink-0 overflow-hidden rounded-full shadow-sm ring-1 ring-cta/45">
      <Image
        alt={APP_NAME}
        className="h-10 w-10 object-contain sm:h-11 sm:w-11"
        height={512}
        priority={false}
        src={BRAND_ICON_SRC}
        width={512}
      />
    </span>
  );

  const fullLogoShellClass =
    variant === "dark"
      ? "rounded-lg border border-white/30 bg-white/95 px-2.5 py-1.5 shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
      : "";

  const fullLogo = (
    <span className={`block overflow-hidden ${fullLogoShellClass}`}>
      <Image
        alt={APP_NAME}
        className={
          variant === "dark"
            ? "h-10 w-[220px] object-contain sm:h-11 sm:w-[244px]"
            : "h-[30px] w-[166px] object-contain sm:h-9 sm:w-[200px] xl:h-10 xl:w-[222px]"
        }
        height={414}
        loading={variant === "dark" ? "lazy" : "eager"}
        sizes={
          variant === "dark"
            ? "(min-width: 640px) 244px, 220px"
            : "(min-width: 1280px) 222px, (min-width: 640px) 200px, 166px"
        }
        src={BRAND_LOGO_SRC}
        width={2294}
      />
    </span>
  );

  return (
    <Link
      aria-label={`${APP_NAME} home`}
      className="group flex min-h-11 w-fit shrink-0 items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta"
      href={href}
      prefetch={false}
    >
      {logoDisplay === "full" ? fullLogo : null}
      {logoDisplay === "mark" ? mark : null}
      {logoDisplay === "lockup" ? fullLogo : null}
    </Link>
  );
}
