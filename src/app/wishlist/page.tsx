import Image from "next/image";
import Link from "next/link";
import { removeWishlistItemAction } from "@/app/account/actions";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { AccountNav } from "@/components/account/account-nav";
import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { customerImageUrl } from "@/lib/customer-images";
import { customerImageAlt, customerProductName } from "@/lib/display";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type WishlistPageProps = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

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

  return (
    <div className="bg-background">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-fresh">Account</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-text sm:text-4xl">Wishlist</h1>
        <AccountNav />
        <AdminActionMessage error={params?.error} success={params?.success} />

        {items.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-text">No saved products yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">Save your favourite groceries and find them quickly next time.</p>
            <Link className="a1-primary-button mt-5 px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" href="/products">
              Shop groceries
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const image = item.product.images.find((productImage) => customerImageUrl(productImage.url));
              const variant = item.product.variants[0];
              const productName = customerProductName(item.product.name);

              return (
                <article className="rounded-lg border border-border bg-surface p-4 shadow-sm transition-colors hover:border-cta" key={item.id}>
                  <Link className="relative block aspect-square overflow-hidden rounded-md bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" href={`/products/${item.product.slug}`} scroll>
                    {image ? (
                      <Image alt={customerImageAlt(image.altText, item.product.name)} className="object-cover" fill sizes="(min-width: 1280px) 33vw, 50vw" src={customerImageUrl(image.url) ?? ""} unoptimized />
                    ) : (
                      <ProductImagePlaceholder category={item.product.category.name} name={productName} />
                    )}
                  </Link>
                  <p className="mt-4 text-xs font-semibold uppercase text-fresh">{item.product.category.name}</p>
                  <Link className="mt-1 block rounded-sm text-lg font-bold text-text hover:text-cta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" href={`/products/${item.product.slug}`} scroll>
                    {productName}
                  </Link>
                  <p className="mt-1 text-sm text-text-muted">{variant ? `From ${variant.name}` : "No active variants"}</p>
                  <form action={removeWishlistItemAction} className="mt-4">
                    <input name="productId" type="hidden" value={item.productId} />
                    <button className="min-h-10 cursor-pointer rounded-md border border-danger px-4 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger" type="submit">
                      Remove
                    </button>
                  </form>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
