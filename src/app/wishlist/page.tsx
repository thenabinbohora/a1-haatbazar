import Link from "next/link";
import { AccountNav } from "@/components/account/account-nav";
import { WishlistItems, type WishlistItemView } from "@/components/account/wishlist-items";
import { AdminActionMessage } from "@/components/admin/admin-action-message";
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
  const user = await requireCustomer();
  const params = await searchParams;
  const items = await prisma.wishlist.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: {
          category: { select: { name: true, slug: true } },
          images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }], take: 1 },
          variants: { where: { status: "ACTIVE" }, orderBy: { price: "asc" }, take: 1 },
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
    <div className="bg-background">
      <section className="mx-auto max-w-7xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:py-8 lg:px-8">
        <p className="text-sm font-semibold uppercase text-fresh">Account</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-text sm:text-4xl">Wishlist</h1>
        <AccountNav />
        <AdminActionMessage error={params?.error} success={params?.success} />

        {wishlistItems.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-text">Your wishlist is empty</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">
              Save your favourite groceries and find them quickly next time.
            </p>
            <Link
              className="a1-primary-button mt-5 px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href="/products"
            >
              Browse groceries
            </Link>
          </div>
        ) : (
          <WishlistItems items={wishlistItems} />
        )}
      </section>
    </div>
  );
}
