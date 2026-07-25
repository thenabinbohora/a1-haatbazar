import Image from "next/image";
import Link from "next/link";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import type { StorefrontCategory } from "@/lib/storefront";

type CategoryCardProps = {
  category: StorefrontCategory;
  headingLevel?: "h2" | "h3";
  imageSizes: string;
  priority?: boolean;
};

export function CategoryCard({
  category,
  headingLevel = "h3",
  imageSizes,
  priority = false,
}: CategoryCardProps) {
  const Heading = headingLevel;
  const productLabel = category.productCount === 1 ? "1 product" : `${category.productCount} products`;

  return (
    <Link
      className="group flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_30px_rgba(18,60,46,0.12)] active:scale-[0.995] active:bg-hero focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transform-none motion-reduce:transition-none"
      href={`/category/${category.slug}`}
      prefetch={false}
    >
      <div className="relative aspect-[5/4] w-full overflow-hidden bg-surface-muted">
        {category.imageUrl ? (
          <Image
            alt={`${category.name} groceries`}
            className="object-cover"
            fill
            priority={priority}
            sizes={imageSizes}
            src={category.imageUrl}
          />
        ) : (
          <ProductImagePlaceholder category="A1 Haat Bazar" name={category.name} />
        )}
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="flex min-w-0 items-start gap-2">
          <Heading className="min-w-0 flex-1 text-[0.9rem] font-extrabold leading-5 text-primary sm:text-base sm:leading-6">
            {category.name}
          </Heading>
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cta-soft text-cta-hover transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </span>
        </div>
        <p className="mt-auto pt-2 text-xs font-bold text-text-muted sm:text-sm">{productLabel}</p>
      </div>
    </Link>
  );
}
