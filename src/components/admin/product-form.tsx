"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { ProductFormState, ProductFormValues } from "@/app/admin/(protected)/products/actions";

export type ProductFormCategory = {
  id: string;
  name: string;
};

export type ProductFormBrand = {
  id: string;
  name: string;
};

export type ProductFormVariant = {
  id?: string;
  sku: string;
  name: string;
  price: string;
  salePrice?: string;
  stock: string | number;
  barcode?: string;
  imageUrl?: string;
  isAvailable: boolean;
};

export type ProductFormInitialData = {
  name: string;
  slug: string;
  categoryId: string;
  brandId?: string;
  description: string;
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
  weeklyOffer: boolean;
  tags: string;
  seoTitle?: string;
  seoDescription?: string;
  variants: ProductFormVariant[];
};

type ProductFormProps = {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: ProductFormCategory[];
  brands: ProductFormBrand[];
  initialData?: ProductFormInitialData;
  submitLabel: string;
};

const blankVariant: ProductFormVariant = {
  sku: "",
  name: "",
  price: "",
  salePrice: "",
  stock: 0,
  barcode: "",
  imageUrl: "",
  isAvailable: true,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function Input({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
  min,
  step,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
  step?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-text">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      <input
        aria-invalid={Boolean(error)}
        aria-required={required}
        className={[
          "mt-2 min-h-11 w-full rounded-md border bg-surface px-3 text-sm text-text transition-colors placeholder:text-text-muted focus:border-cta",
          error ? "border-danger bg-danger-soft/40 focus:border-danger" : "border-border",
        ].join(" ")}
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
        min={min}
        step={step}
        type={type}
      />
      {error ? <span className="mt-1 block text-xs font-semibold text-danger">{error}</span> : null}
    </label>
  );
}

function DismissibleFormError({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="rounded-lg border border-danger bg-danger-soft p-4 text-sm font-semibold text-danger" role="alert">
      {message}
    </div>
  );
}

function defaultData(): ProductFormValues {
  return {
    name: "",
    slug: "",
    categoryId: "",
    brandId: "",
    description: "",
    active: true,
    featured: false,
    bestSeller: false,
    weeklyOffer: false,
    tags: "",
    seoTitle: "",
    seoDescription: "",
    variants: [{ ...blankVariant, stock: String(blankVariant.stock) }],
  };
}

function toProductFormValues(data?: ProductFormInitialData): ProductFormValues {
  if (!data) {
    return defaultData();
  }

  return {
    ...data,
    brandId: data.brandId ?? "",
    seoTitle: data.seoTitle ?? "",
    seoDescription: data.seoDescription ?? "",
    variants: data.variants.length
      ? data.variants.map((variant) => ({
          ...variant,
          salePrice: variant.salePrice ?? "",
          stock: String(variant.stock),
          barcode: variant.barcode ?? "",
          imageUrl: variant.imageUrl ?? "",
        }))
      : defaultData().variants,
  };
}

export function ProductForm({
  action,
  categories,
  brands,
  initialData,
  submitLabel,
}: ProductFormProps) {
  const initialValues = toProductFormValues(initialData);
  const [state, formAction, isPending] = useActionState(action, { values: initialValues });
  const currentData = state.values ?? initialValues;
  const [variantRows, setVariantRows] = useState<ProductFormVariant[]>(
    currentData.variants.length ? currentData.variants : [blankVariant],
  );
  const [variantRowsTouched, setVariantRowsTouched] = useState(false);
  const [slug, setSlug] = useState(currentData.slug ?? "");
  const visibleVariants = variantRowsTouched ? variantRows : currentData.variants;

  const canSubmit = categories.length > 0;
  const categoryOptions = useMemo(
    () => categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>),
    [categories],
  );

  function addVariant() {
    setVariantRowsTouched(true);
    setVariantRows([...visibleVariants, { ...blankVariant }]);
  }

  function removeVariant(index: number) {
    setVariantRowsTouched(true);
    setVariantRows((visibleVariants.length === 1 ? visibleVariants : visibleVariants.filter((_, itemIndex) => itemIndex !== index)));
  }

  return (
    <form
      action={formAction}
      className="space-y-6"
      noValidate
      onSubmit={() => setVariantRowsTouched(false)}
    >
      {!canSubmit ? (
        <div className="rounded-lg border border-warning bg-surface p-4 text-sm text-text">
          Add or seed at least one category before creating products.
        </div>
      ) : null}

      {state.formError ? (
        <DismissibleFormError key={state.messageId ?? state.formError} message={state.formError} />
      ) : null}

      {state.debugError ? (
        <details className="rounded-lg border border-warning bg-surface p-4 text-sm text-text">
          <summary className="cursor-pointer font-semibold text-warning">Developer error details</summary>
          <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs leading-5 text-text-muted">
            {state.debugError}
          </pre>
        </details>
      ) : null}

      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Product details</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-text">Name <span className="text-danger">*</span></span>
            <input
              aria-invalid={Boolean(state.fieldErrors?.name)}
              aria-required
              className={[
                "mt-2 min-h-11 w-full rounded-md border bg-surface px-3 text-sm text-text transition-colors placeholder:text-text-muted focus:border-cta",
                state.fieldErrors?.name ? "border-danger bg-danger-soft/40 focus:border-danger" : "border-border",
              ].join(" ")}
              defaultValue={currentData.name}
              name="name"
              onBlur={(event) => {
                if (!slug) {
                  setSlug(slugify(event.currentTarget.value));
                }
              }}
            />
            {state.fieldErrors?.name ? <span className="mt-1 block text-xs font-semibold text-danger">{state.fieldErrors.name}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-text">Slug <span className="text-danger">*</span></span>
            <input
              aria-invalid={Boolean(state.fieldErrors?.slug)}
              aria-required
              className={[
                "mt-2 min-h-11 w-full rounded-md border bg-surface px-3 text-sm text-text transition-colors placeholder:text-text-muted focus:border-cta",
                state.fieldErrors?.slug ? "border-danger bg-danger-soft/40 focus:border-danger" : "border-border",
              ].join(" ")}
              name="slug"
              onChange={(event) => setSlug(slugify(event.currentTarget.value))}
              value={slug}
            />
            {state.fieldErrors?.slug ? <span className="mt-1 block text-xs font-semibold text-danger">{state.fieldErrors.slug}</span> : null}
            <span className="mt-1 block text-xs text-text-muted">Slug is sanitized again server-side.</span>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-text">Category <span className="text-danger">*</span></span>
            <select
              aria-invalid={Boolean(state.fieldErrors?.categoryId)}
              aria-required
              className={[
                "mt-2 min-h-11 w-full rounded-md border bg-surface px-3 text-sm text-text focus:border-cta",
                state.fieldErrors?.categoryId ? "border-danger bg-danger-soft/40 focus:border-danger" : "border-border",
              ].join(" ")}
              defaultValue={currentData.categoryId ?? ""}
              name="categoryId"
            >
              <option value="" disabled>Select category</option>
              {categoryOptions}
            </select>
            {state.fieldErrors?.categoryId ? <span className="mt-1 block text-xs font-semibold text-danger">{state.fieldErrors.categoryId}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-text">Brand</span>
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta"
              defaultValue={currentData.brandId ?? ""}
              name="brandId"
            >
              <option value="">No brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-text">Description <span className="text-danger">*</span></span>
          <textarea
            aria-invalid={Boolean(state.fieldErrors?.description)}
            aria-required
            className={[
              "mt-2 min-h-32 w-full rounded-md border bg-surface px-3 py-2 text-sm text-text transition-colors placeholder:text-text-muted focus:border-cta",
              state.fieldErrors?.description ? "border-danger bg-danger-soft/40 focus:border-danger" : "border-border",
            ].join(" ")}
            defaultValue={currentData.description}
            name="description"
          />
          {state.fieldErrors?.description ? <span className="mt-1 block text-xs font-semibold text-danger">{state.fieldErrors.description}</span> : null}
        </label>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["active", "Active", currentData.active],
            ["featured", "Featured", currentData.featured],
            ["bestSeller", "Best seller", currentData.bestSeller],
            ["weeklyOffer", "Weekly offer", currentData.weeklyOffer],
          ].map(([name, label, checked]) => (
            <label
              className="flex min-h-11 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm font-semibold text-text"
              key={String(name)}
            >
              <input defaultChecked={Boolean(checked)} name={String(name)} type="checkbox" />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-text">Tags and SEO</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <Input defaultValue={currentData.tags} error={state.fieldErrors?.tags} label="Tags" name="tags" placeholder="rice, pantry, weekly" />
          <Input defaultValue={currentData.seoTitle} error={state.fieldErrors?.seoTitle} label="SEO title" name="seoTitle" />
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-semibold text-text">SEO description</span>
          <textarea
            aria-invalid={Boolean(state.fieldErrors?.seoDescription)}
            className={[
              "mt-2 min-h-24 w-full rounded-md border bg-surface px-3 py-2 text-sm text-text transition-colors placeholder:text-text-muted focus:border-cta",
              state.fieldErrors?.seoDescription ? "border-danger bg-danger-soft/40 focus:border-danger" : "border-border",
            ].join(" ")}
            defaultValue={currentData.seoDescription}
            name="seoDescription"
          />
          {state.fieldErrors?.seoDescription ? <span className="mt-1 block text-xs font-semibold text-danger">{state.fieldErrors.seoDescription}</span> : null}
        </label>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text">Variants and SKUs</h2>
            <p className="text-sm text-text-muted">Add one or more sizes, packs, prices, stock levels, and SKU codes.</p>
          </div>
          <button
            className="min-h-10 cursor-pointer rounded-md border border-border bg-surface px-4 text-sm font-semibold text-text transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            onClick={addVariant}
            type="button"
          >
            Add variant
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {visibleVariants.map((variant, index) => (
            <div
              className={[
                "rounded-lg border bg-surface-muted p-4",
                state.variantErrors?.[index] ? "border-danger" : "border-border",
              ].join(" ")}
              key={`${variant.id ?? "new"}-${index}`}
            >
              <input name="variantId" type="hidden" value={variant.id ?? ""} />
              <div className="grid gap-4 lg:grid-cols-4">
                <Input defaultValue={variant.sku} error={state.variantErrors?.[index]?.sku} label="SKU code" name="variantSku" required />
                <Input defaultValue={variant.name} error={state.variantErrors?.[index]?.name} label="Size/pack label" name="variantName" placeholder="1kg, 5 pack" required />
                <Input defaultValue={variant.price} error={state.variantErrors?.[index]?.price} label="Price" min="0" name="variantPrice" required step="0.01" type="number" />
                <Input defaultValue={variant.salePrice} error={state.variantErrors?.[index]?.salePrice} label="Sale price" min="0" name="variantSalePrice" step="0.01" type="number" />
                <Input defaultValue={variant.stock} error={state.variantErrors?.[index]?.stock} label="Stock" min="0" name="variantStock" required step="1" type="number" />
                <Input defaultValue={variant.barcode} error={state.variantErrors?.[index]?.barcode} label="Barcode" name="variantBarcode" />
                <Input
                  defaultValue={variant.imageUrl}
                  error={state.variantErrors?.[index]?.imageUrl}
                  label="Variant image URL"
                  name="variantImageUrl"
                  placeholder="Optional fallback or imported image URL"
                  type="url"
                />
                <label className="flex min-h-11 items-center gap-3 rounded-md border border-border bg-surface px-3 text-sm font-semibold text-text">
                  <input
                    defaultChecked={variant.isAvailable}
                    name="variantAvailableIndex"
                    type="checkbox"
                    value={index}
                  />
                  Available
                </label>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  className="min-h-10 cursor-pointer rounded-md border border-danger bg-surface px-4 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
                  disabled={visibleVariants.length === 1}
                  onClick={() => removeVariant(index)}
                  type="button"
                >
                  Remove variant
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          className="min-h-12 cursor-pointer rounded-md bg-cta px-6 text-sm font-semibold text-white transition-colors hover:bg-cta-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canSubmit || isPending}
          type="submit"
        >
          {isPending ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
