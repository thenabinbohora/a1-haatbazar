import type { Metadata } from "next";
import Link from "next/link";
import { AccountActionMessage } from "@/components/account/account-action-message";
import { AccountIcon } from "@/components/account/account-icons";
import { CustomerAccountShell } from "@/components/account/customer-account-shell";
import { WishlistItems, type WishlistItemView } from "@/components/account/wishlist-items";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved A1 Haat Bazar grocery products.",
  robots: { index: false },
};
import { customerImageUrl } from "@/lib/customer-images";
import { customerImageAlt, customerProductName } from "@/lib/display";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type WishlistPageProps = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

function moneyNumber(value: unknown) {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value.toString());
}

export default async function WishlistPage({ searchParams }: WishlistPageProps) {
  const user = await requireCustomer("/wishlist");
  const params = await searchParams;
  const items = await prisma.wishlist.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          category: { select: { name: true, slug: true } },
          images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
          variants: { where: { status: "ACTIVE" }, orderBy: { price: "asc" }, take: 1 },
          _count: { select: { variants: { where: { status: "ACTIVE" } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const wishlistItems: WishlistItemView[] = items.map((item) => {
    const image = item.product.images.find((productImage) => customerImageUrl(productImage.url));
    const variant = item.product.variants[0];

    return {
      categoryName: item.product.category.name,
      id: item.id,
      imageAlt: customerImageAlt(image?.altText, item.product.name),
      imageUrl: customerImageUrl(image?.url) ?? null,
      productId: item.productId,
      productName: customerProductName(item.product.name),
      productSlug: item.product.slug,
      variantCount: item.product._count.variants,
      variant: variant
        ? {
            currency: variant.currency,
            id: variant.id,
            name: variant.name,
            price: moneyNumber(variant.price),
            salePrice: variant.salePrice ? moneyNumber(variant.salePrice) : null,
            stock: variant.stock,
          }
        : null,
    };
  });

  return (
    <CustomerAccountShell
      description="Keep favourite groceries ready for your next shop."
      title="Wishlist"
      user={user}
    >
        <AccountActionMessage
          error={params?.error}
          messages={{
            successes: { removed: "The item has been removed from your wishlist." },
          }}
          success={params?.success}
        />

        {wishlistItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-10">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-fresh-soft text-primary">
              <AccountIcon className="h-6 w-6" name="heart" />
            </span>
            <h2 className="mt-4 text-xl font-black text-text">Nothing saved yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
              Tap the heart on products to save them here for your next shop.
            </p>
            <Link
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href="/products"
            >
              <AccountIcon className="h-4.5 w-4.5" name="bag" />
              Browse groceries
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-text">Saved groceries</h2>
                <p className="mt-1 text-sm text-text-muted">
                  {wishlistItems.length} {wishlistItems.length === 1 ? "item" : "items"} saved
                </p>
              </div>
              <Link
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-extrabold text-text transition-colors hover:border-primary/25 hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                href="/products"
              >
                <AccountIcon className="h-4.5 w-4.5" name="bag" />
                Keep shopping
              </Link>
            </div>
            <WishlistItems items={wishlistItems} />
          </>
        )}
    </CustomerAccountShell>
  );
}
