"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { StorefrontProductDetail } from "@/lib/storefront";
import { ProductImagePlaceholder } from "@/components/brand/product-image-placeholder";
import { formatCurrency } from "@/components/product/price";
import { ToastMessage } from "@/components/ui/toast-message";
import { useCart } from "@/store/cart-store";
import { useCartDrawer } from "@/store/cart-drawer-store";

type ProductDetailViewProps = {
  initialVariant?: string;
  product: StorefrontProductDetail;
};

type GalleryItem = {
  key: string;
  url: string;
  altText: string;
  label: string;
  variantId?: string | null;
};

function effectivePrice(variant: StorefrontProductDetail["variants"][number]) {
  return variant.salePrice && variant.salePrice < variant.price ? variant.salePrice : variant.price;
}

function isOfferVariant(product: StorefrontProductDetail, variant: StorefrontProductDetail["variants"][number]) {
  return variant.salePrice !== null && variant.salePrice !== undefined && variant.salePrice < variant.price;
}

function saveAmount(variant: StorefrontProductDetail["variants"][number]) {
  return Math.max(0, variant.price - effectivePrice(variant));
}

function discountPercent(variant: StorefrontProductDetail["variants"][number]) {
  return variant.price > 0 ? Math.round((saveAmount(variant) / variant.price) * 100) : 0;
}

function stockLabel(stock: number) {
  if (stock <= 0) {
    return "Out of stock";
  }

  if (stock <= 5) {
    return `Low stock: ${stock} left`;
  }

  return "In stock today";
}

function stockBadgeClass(stock: number) {
  if (stock <= 0) {
    return "border-border bg-surface-muted text-text-muted";
  }

  if (stock <= 5) {
    return "border-warning bg-cta-soft text-warning";
  }

  return "border-fresh bg-fresh-soft text-fresh";
}

function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" | "fresh" }) {
  const className =
    tone === "gold"
      ? "border-cta/40 bg-cta-soft text-cta-hover"
      : tone === "fresh"
        ? "border-fresh bg-fresh-soft text-fresh"
        : "border-border bg-surface-muted text-text-muted";

  return <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${className}`}>{children}</span>;
}

function CompactTrustItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold leading-5 text-text">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fresh-soft text-fresh" aria-hidden="true">
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" viewBox="0 0 24 24">
          <path d="m5 12 4 4L19 6" />
        </svg>
      </span>
      <span>{children}</span>
    </div>
  );
}

function DetailSection({
  id,
  title,
  children,
  isOpen,
  onToggle,
}: {
  id: string;
  title: string;
  children: ReactNode;
  isOpen: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <article className="rounded-lg border border-border bg-surface shadow-sm">
      <button
        aria-controls={`${id}-panel`}
        aria-expanded={isOpen}
        className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 px-4 text-left text-base font-extrabold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
        onClick={() => onToggle(id)}
        type="button"
      >
        <span>{title}</span>
        <span className={["flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-muted text-primary transition-transform", isOpen ? "rotate-180" : ""].join(" ")} aria-hidden="true">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>
      {isOpen ? (
        <div className="border-t border-border px-4 py-3 text-[0.95rem] leading-6 text-text-muted" id={`${id}-panel`}>
          {children}
        </div>
      ) : null}
    </article>
  );
}

export function ProductDetailView({ initialVariant, product }: ProductDetailViewProps) {
  const { addItem } = useCart();
  const { open: openCartDrawer } = useCartDrawer();
  const firstSaleVariant =
    product.variants.find((variant) => variant.stock > 0 && isOfferVariant(product, variant)) ??
    product.variants.find((variant) => isOfferVariant(product, variant));
  const initialSelectedVariant =
    product.variants.find(
      (variant) =>
        variant.stock > 0 &&
        initialVariant &&
        (variant.id === initialVariant || variant.sku.toLowerCase() === initialVariant.toLowerCase()),
    ) ??
    firstSaleVariant ??
    product.variants.find((variant) => variant.stock > 0) ??
    product.variants[0];
  const [selectedVariantId, setSelectedVariantId] = useState(initialSelectedVariant?.id ?? "");
  const [selectedGalleryKey, setSelectedGalleryKey] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notice, setNotice] = useState<string | null>(null);
  const [hasAddedToCart, setHasAddedToCart] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(["details"]));
  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];
  const price = effectivePrice(selectedVariant);
  const hasSale = selectedVariant.salePrice !== null && selectedVariant.salePrice !== undefined && selectedVariant.salePrice < selectedVariant.price;
  const selectedVariantIsOffer = isOfferVariant(product, selectedVariant);
  const selectedVariantOfferLabel = product.isWeeklyOffer ? "Weekly offer" : "Sale price";
  const canAddToCart = selectedVariant.stock > 0;
  const selectedQuantity = Math.min(Math.max(quantity, 1), Math.max(selectedVariant.stock, 1));
  const isFreshVegetable = product.category.slug === "vegetables" || /fresh|vegetable/i.test(product.category.name);

  const gallery = useMemo<GalleryItem[]>(() => {
    const items: GalleryItem[] = [];
    const seen = new Set<string>();

    for (const image of product.images) {
      if (!seen.has(image.url)) {
        items.push({
          key: image.id,
          url: image.url,
          altText: image.altText,
          label: image.isPrimary ? "Main image" : "Gallery image",
          variantId: image.variantId,
        });
        seen.add(image.url);
      }
    }

    for (const variant of product.variants) {
      if (variant.imageUrl && !seen.has(variant.imageUrl)) {
        items.push({
          key: `${variant.id}-image`,
          url: variant.imageUrl,
          altText: `${product.name} ${variant.name}`,
          label: variant.name,
          variantId: variant.id,
        });
        seen.add(variant.imageUrl);
      }
    }

    return items.slice(0, 8);
  }, [product.images, product.name, product.variants]);

  const selectedVariantImage = selectedVariant.imageUrl ? gallery.find((image) => image.url === selectedVariant.imageUrl) : null;
  const activeImage = gallery.find((image) => image.key === selectedGalleryKey) ?? selectedVariantImage ?? gallery[0] ?? null;
  const showThumbnails = gallery.length > 1;

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function selectVariant(variantId: string) {
    const variant = product.variants.find((item) => item.id === variantId);
    const variantImage = variant?.imageUrl ? gallery.find((image) => image.url === variant.imageUrl) : null;
    setSelectedVariantId(variantId);
    setSelectedGalleryKey(variantImage?.key ?? null);
    setQuantity(1);
    setNotice(null);
    setHasAddedToCart(false);
  }

  function updateRequestedQuantity(nextQuantity: number) {
    setQuantity(Math.min(Math.max(Math.trunc(nextQuantity), 1), Math.max(selectedVariant.stock, 1)));
    setNotice(null);
  }

  function toggleSection(sectionId: string) {
    setOpenSections((current) => {
      const next = new Set(current);

      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }

      return next;
    });
  }

  function addSelectedVariantToCart() {
    if (!canAddToCart) {
      setNotice("This selected size or pack is out of stock.");
      return;
    }

    const result = addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      quantity: selectedQuantity,
      maxStock: selectedVariant.stock,
    });

    setHasAddedToCart(true);
    setNotice(
      result.wasAdjusted
        ? `Only ${result.quantity} total can be added because that is the current stock for ${selectedVariant.name}.`
        : `${selectedQuantity} x ${selectedVariant.name} added to cart.`,
    );
  }

  const productInfo = (
    <section className="grid gap-3" aria-label="Product information">
      <DetailSection id="details" isOpen={openSections.has("details")} onToggle={toggleSection} title="Product details">
        <p>{product.description || "Information is not available yet."}</p>
        {product.tags.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.slice(0, 12).map((tag) => (
              <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs font-bold text-text-muted" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </DetailSection>

      {isFreshVegetable ? (
        <DetailSection id="freshness-storage" isOpen={openSections.has("freshness-storage")} onToggle={toggleSection} title="Freshness & storage">
          <p>{product.storage ?? "Keep fresh produce refrigerated where appropriate and use soon after pickup or delivery for the best quality."}</p>
        </DetailSection>
      ) : (
        <>
          <DetailSection id="ingredients" isOpen={openSections.has("ingredients")} onToggle={toggleSection} title="Ingredients">
            <p>{product.ingredients ?? "Information is not available yet."}</p>
            {product.allergens ? <p className="mt-3 font-semibold text-text">Allergens: {product.allergens}</p> : null}
          </DetailSection>
          <DetailSection id="storage" isOpen={openSections.has("storage")} onToggle={toggleSection} title="Storage information">
            <p>{product.storage ?? "Information is not available yet."}</p>
          </DetailSection>
        </>
      )}

      <DetailSection id="delivery" isOpen={openSections.has("delivery")} onToggle={toggleSection} title="Delivery & pickup">
        <p>Available for local delivery or store pickup. Stock and final availability are checked before order confirmation.</p>
        <p className="mt-2">Cash on delivery and pay-at-pickup options are available for supported orders.</p>
      </DetailSection>
      <DetailSection id="brand-origin" isOpen={openSections.has("brand-origin")} onToggle={toggleSection} title="Brand / origin">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface-muted p-3">
            <p className="text-xs font-bold uppercase text-text-muted">Brand</p>
            <p className="mt-1 font-extrabold text-text">{product.brand?.name ?? "A1 Haat Bazar"}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-muted p-3">
            <p className="text-xs font-bold uppercase text-text-muted">Origin</p>
            <p className="mt-1 font-extrabold text-text">{product.origin ?? product.brand?.country ?? "Not specified"}</p>
          </div>
        </div>
      </DetailSection>
    </section>
  );

  async function toggleWishlist() {
    const response = await fetch("/api/wishlist/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });

    if (response.status === 401) {
      setNotice("Sign in to save this product to your wishlist.");
      return;
    }

    if (!response.ok) {
      setNotice("Wishlist could not be updated. Please try again.");
      return;
    }

    const result = (await response.json()) as { saved: boolean };
    setNotice(result.saved ? "Saved to wishlist." : "Removed from wishlist.");
  }

  return (
    <div className="pb-24 lg:pb-0">
      <div className="grid gap-x-8 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)] lg:items-start">
        <section aria-label="Product image gallery" className="lg:col-start-1 lg:row-start-1">
          <div className={showThumbnails ? "grid gap-4 sm:grid-cols-[5.5rem_1fr]" : "grid gap-4"}>
            {showThumbnails ? (
              <div className="order-2 flex gap-3 overflow-x-auto pb-1 sm:order-1 sm:flex-col sm:overflow-visible sm:pb-0">
                {gallery.map((image) => {
                  const isSelected = image.key === activeImage?.key;

                  return (
                    <button
                      aria-label={`Show ${image.label}`}
                      aria-pressed={isSelected}
                      className={[
                        "relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border bg-surface shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta",
                        isSelected ? "border-cta ring-2 ring-cta/20" : "border-border hover:border-cta",
                      ].join(" ")}
                      key={image.key}
                      onClick={() => setSelectedGalleryKey(image.key)}
                      type="button"
                    >
                      <Image alt="" className="h-full w-full object-contain p-1.5" fill sizes="96px" src={image.url} unoptimized />
                    </button>
                  );
                })}
              </div>
            ) : null}

            <div className="order-1 mx-auto w-full max-w-[600px] overflow-hidden rounded-xl border border-border bg-[linear-gradient(135deg,#FFFFFF_0%,#FAF8F1_62%,#EEF7EF_100%)] p-3 shadow-[0_18px_56px_rgba(15,46,26,0.1)] sm:order-2">
              <div className="relative aspect-[4/3] max-h-[520px] overflow-hidden rounded-lg bg-white">
                {activeImage ? (
                  <Image
                    alt={activeImage.altText}
                    className="h-full w-full object-contain p-3 sm:p-5"
                    fill
                    priority
                    sizes="(min-width: 1024px) 52vw, 100vw"
                    src={activeImage.url}
                    unoptimized
                  />
                ) : (
                  <ProductImagePlaceholder category={product.category.name} name={product.name} />
                )}
              </div>
            </div>
          </div>
        </section>

        <aside className="rounded-xl border border-border bg-surface p-3 shadow-[0_18px_50px_rgba(6,61,22,0.09)] lg:sticky lg:top-16 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="flex flex-wrap gap-2">
            {product.isWeeklyOffer ? <Pill tone="gold">Weekly offer</Pill> : null}
            {product.isBestSeller ? <Pill>Best seller</Pill> : null}
            {product.isFeatured ? <Pill>Featured</Pill> : null}
            {hasSale ? <Pill tone="gold">Sale price</Pill> : null}
          </div>

          <div className="mt-2">
            <Link className="text-sm font-extrabold text-fresh transition-colors hover:text-cta-hover" href={`/category/${product.category.slug}`} scroll>
              {product.category.name}
            </Link>
            <h1 className="mt-1 text-[1.45rem] font-extrabold leading-tight text-text sm:text-[1.7rem]">{product.name}</h1>
            <p className="mt-1 text-xs font-semibold leading-5 text-text-muted">
              Brand: <span className="font-bold text-text">{product.brand?.name ?? "A1 Haat Bazar"}</span>
              {product.brand?.country ? ` / ${product.brand.country}` : ""}
            </p>
          </div>

          <div className="mt-2 rounded-xl border border-cta/25 bg-cta-soft/70 p-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-bold text-text-muted">Selected pack</p>
              {selectedVariantIsOffer ? <Pill tone="gold">{selectedVariantOfferLabel}</Pill> : null}
            </div>
            <div className="mt-1 grid gap-1 sm:grid-cols-2">
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-text">{selectedVariant.name}</p>
                <p className="mt-0.5 text-[0.7rem] font-bold text-text-muted">SKU {selectedVariant.sku}</p>
              </div>
              <div>
                {selectedVariantIsOffer ? (
                  <div>
                    <p className="text-xs font-bold text-text-muted">
                      Was{" "}
                      <span className="line-through">
                        {formatCurrency(selectedVariant.price, selectedVariant.currency)}
                      </span>
                    </p>
                    <p className="mt-0.5 text-xl font-black leading-none text-cta-hover">
                      <span className="mr-1 text-sm font-extrabold text-primary">Now</span>
                      {" "}
                      {formatCurrency(price, selectedVariant.currency)}
                    </p>
                    <p className="mt-1 text-[0.7rem] font-extrabold text-primary">
                      Save {formatCurrency(saveAmount(selectedVariant), selectedVariant.currency)} / {discountPercent(selectedVariant)}% off
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-[1.75rem] font-black leading-none text-text">{formatCurrency(price, selectedVariant.currency)}</span>
                    {hasSale ? (
                      <span className="text-sm font-bold text-text-muted line-through">
                        {formatCurrency(selectedVariant.price, selectedVariant.currency)}
                      </span>
                    ) : null}
                  </div>
                )}
                <span className={`mt-1 inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[0.7rem] font-extrabold ${stockBadgeClass(selectedVariant.stock)}`}>
                  {stockLabel(selectedVariant.stock)}
                </span>
              </div>
            </div>
          </div>

          <fieldset className="mt-2">
            <legend className="text-xs font-extrabold text-text">Choose size or pack</legend>
            <div className="mt-1.5 grid gap-1.5">
              {product.variants.map((variant) => {
                const isSelected = variant.id === selectedVariant.id;
                const variantPrice = effectivePrice(variant);
                const variantHasOffer = isOfferVariant(product, variant);
                const variantOfferLabel = product.isWeeklyOffer ? "Weekly offer" : "Sale price";

                return (
                  <button
                    aria-pressed={isSelected}
                    className={[
                      "cursor-pointer rounded-lg border px-2 py-1.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta",
                      isSelected ? "border-cta bg-cta-soft" : "border-border bg-surface hover:border-cta hover:bg-surface-muted",
                    ].join(" ")}
                    key={variant.id}
                    onClick={() => selectVariant(variant.id)}
                    type="button"
                  >
                    <span className="grid gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-3">
                      <span className="min-w-0">
                        <span className="block text-sm font-extrabold text-text">{variant.name}</span>
                        {variantHasOffer ? (
                          <span className="mt-0.5 block text-[0.7rem] font-extrabold text-cta-hover">
                            {variantOfferLabel} / Save {formatCurrency(saveAmount(variant), variant.currency)}
                          </span>
                        ) : null}
                      </span>
                      <span className="shrink-0 sm:text-right">
                        {variantHasOffer ? (
                          <span className="block text-sm font-extrabold text-cta-hover sm:text-right">
                            Now {formatCurrency(variantPrice, variant.currency)}
                          </span>
                        ) : (
                          <span className="block text-sm font-extrabold text-text">{formatCurrency(variantPrice, variant.currency)}</span>
                        )}
                        <span className={`mt-0.5 block text-[0.7rem] font-bold ${variant.stock > 0 ? "text-fresh" : "text-text-muted"}`}>
                          {stockLabel(variant.stock)}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs font-extrabold text-text" htmlFor="product-quantity">
                Quantity
              </label>
              {canAddToCart ? <p className="text-[0.7rem] font-semibold text-text-muted">Max {selectedVariant.stock}</p> : null}
            </div>
            <div className="mt-1 grid grid-cols-[40px_1fr_40px] overflow-hidden rounded-lg border border-border bg-surface">
              <button
                aria-label="Decrease quantity"
                className="min-h-9 cursor-pointer border-r border-border text-lg font-black text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:text-text-muted"
                disabled={!canAddToCart || selectedQuantity <= 1}
                onClick={() => updateRequestedQuantity(selectedQuantity - 1)}
                type="button"
              >
                -
              </button>
              <input
                className="min-h-9 border-0 bg-surface px-3 text-center text-sm font-black text-text"
                disabled={!canAddToCart}
                id="product-quantity"
                inputMode="numeric"
                max={Math.max(selectedVariant.stock, 1)}
                min={1}
                onChange={(event) => updateRequestedQuantity(Number(event.target.value))}
                type="number"
                value={selectedQuantity}
              />
              <button
                aria-label="Increase quantity"
                className="min-h-9 cursor-pointer border-l border-border text-lg font-black text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:text-text-muted"
                disabled={!canAddToCart || selectedQuantity >= selectedVariant.stock}
                onClick={() => updateRequestedQuantity(selectedQuantity + 1)}
                type="button"
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-2 grid gap-1.5">
            <button
              className="a1-primary-button !min-h-10 cursor-pointer px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted"
              disabled={!canAddToCart}
              onClick={addSelectedVariantToCart}
              type="button"
            >
              {canAddToCart ? "Add to cart" : "Out of stock"}
            </button>
            {hasAddedToCart ? (
              <button
                className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface px-5 text-center text-sm font-extrabold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                onClick={openCartDrawer}
                type="button"
              >
                View cart
              </button>
            ) : null}
          </div>

          <button
            className="mt-2 min-h-9 w-full cursor-pointer rounded-lg border border-border bg-surface px-5 text-sm font-extrabold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            onClick={toggleWishlist}
            type="button"
          >
            Save to wishlist
          </button>

          <div className="mt-2 grid gap-1 rounded-lg border border-cta/20 bg-cta-soft/60 p-2">
            <CompactTrustItem>Delivery or store pickup</CompactTrustItem>
            <CompactTrustItem>Pay on delivery / pay at pickup</CompactTrustItem>
            <CompactTrustItem>Stock checked before confirmation</CompactTrustItem>
          </div>
        </aside>

        <div className="lg:col-start-1 lg:row-start-2">{productInfo}</div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface/96 p-3 shadow-[0_-12px_30px_rgba(6,61,22,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-text-muted">{selectedVariant.name}</p>
            <p className="text-lg font-black text-text">{formatCurrency(price, selectedVariant.currency)}</p>
          </div>
          {hasAddedToCart ? (
            <button
              className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface px-4 text-sm font-extrabold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              onClick={openCartDrawer}
              type="button"
            >
              View cart
            </button>
          ) : null}
          <button
            className="a1-primary-button min-h-11 shrink-0 cursor-pointer px-5 text-sm disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-text-muted"
            disabled={!canAddToCart}
            onClick={addSelectedVariantToCart}
            type="button"
          >
            {canAddToCart ? "Add to cart" : "Out of stock"}
          </button>
        </div>
      </div>

      <ToastMessage
        message={notice}
        tone={notice?.includes("out of stock") || notice?.includes("could not") ? "error" : "success"}
      />
    </div>
  );
}
