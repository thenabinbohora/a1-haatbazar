import type { Metadata } from "next";
import { createAddressAction, deleteAddressAction, updateAddressAction } from "@/app/account/actions";
import { AccountNav } from "@/components/account/account-nav";
import { AddressSubmitButton, DeleteAddressForm } from "@/components/account/address-action-buttons";
import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "My addresses",
  description: "Manage your saved delivery addresses.",
  robots: { index: false },
};

type AddressesPageProps = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

const messages = {
  errors: {
    validation: "Check the address details.",
    "not-found": "That address could not be found.",
  },
};

const addressFields = [
  { name: "fullName", label: "Full name", required: true, colSpan: false, autoComplete: "name" },
  { name: "phone", label: "Phone", required: true, colSpan: false, autoComplete: "tel", type: "tel", inputMode: "tel" },
  { name: "line1", label: "Address line 1", required: true, colSpan: true, autoComplete: "address-line1" },
  { name: "line2", label: "Address line 2", required: false, colSpan: true, autoComplete: "address-line2" },
  { name: "suburb", label: "Suburb or city", required: true, colSpan: false, autoComplete: "address-level2" },
  { name: "state", label: "State", required: true, colSpan: false, autoComplete: "address-level1" },
  { name: "postalCode", label: "Postcode", required: true, colSpan: false, autoComplete: "postal-code", inputMode: "numeric" },
  { name: "country", label: "Country", required: true, colSpan: false, autoComplete: "country-name" },
] as const;

const inputClass = "mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-text outline-none transition-[border-color,box-shadow,background-color] focus:border-cta focus:bg-surface focus:ring-2 focus:ring-cta/20 read-only:cursor-not-allowed read-only:bg-surface-muted sm:text-sm";

export default async function AccountAddressesPage({ searchParams }: AddressesPageProps) {
  const user = await requireCustomer("/account/addresses");
  const params = await searchParams;
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="min-h-dvh bg-background">
      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-9 lg:px-8 lg:py-10">
        <header className="mb-5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-fresh">Your account</p>
          <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight text-text sm:text-4xl">Delivery addresses</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-muted">
            Keep trusted delivery details ready for a faster checkout.
          </p>
        </header>
        <AccountNav />
        <AdminActionMessage error={params?.error} messages={messages} success={params?.success} />

        <div className="mb-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">Saved destinations</p>
          <h2 className="mt-1 text-2xl font-black text-text">Your addresses</h2>
        </div>
        {addresses.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {addresses.map((address) => {
              const addressLabel = address.label ?? "Delivery address";

              return (
                <details className="group min-w-0 rounded-2xl border border-border bg-surface p-5 shadow-sm open:border-primary/25 sm:p-6" key={address.id}>
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta">
                    <span className="flex min-w-0 flex-wrap items-center gap-2 text-lg font-black text-text">
                      <span className="break-words [overflow-wrap:anywhere]">{addressLabel}</span>
                      {address.isDefault ? <span className="rounded-full border border-fresh/25 bg-fresh-soft px-2 py-0.5 text-xs font-bold text-fresh">Default</span> : null}
                    </span>
                    <span className="shrink-0 text-sm font-bold text-primary group-open:hidden">Edit</span>
                    <span className="hidden shrink-0 text-sm font-bold text-primary group-open:inline">Close</span>
                  </summary>
                  <p className="mt-4 break-words rounded-xl border border-border bg-background p-4 text-sm leading-6 text-text-muted [overflow-wrap:anywhere]">
                    {address.fullName}<br />
                    {address.line1}<br />
                    {address.line2 ? <>{address.line2}<br /></> : null}
                    {address.suburb}, {address.state} {address.postalCode}<br />
                    {address.country}
                  </p>
                  <form action={updateAddressAction} className="mt-5 grid gap-4 sm:grid-cols-2">
                    <input name="id" type="hidden" value={address.id} />
                    <label className="block min-w-0">
                      <span className="text-sm font-bold text-text">Label</span>
                      <input className={inputClass} name="label" defaultValue={address.label ?? ""} placeholder="Home, work, or other" />
                    </label>
                    <label className="block min-w-0">
                      <span className="text-sm font-bold text-text">Full name *</span>
                      <input autoComplete="name" className={inputClass} name="fullName" defaultValue={address.fullName} required />
                    </label>
                    <label className="block min-w-0">
                      <span className="text-sm font-bold text-text">Phone *</span>
                      <input autoComplete="tel" className={inputClass} inputMode="tel" name="phone" defaultValue={address.phone} required type="tel" />
                    </label>
                    <label className="block min-w-0 sm:col-span-2">
                      <span className="text-sm font-bold text-text">Address line 1 *</span>
                      <input autoComplete="address-line1" className={inputClass} name="line1" defaultValue={address.line1} required />
                    </label>
                    <label className="block min-w-0 sm:col-span-2">
                      <span className="text-sm font-bold text-text">Address line 2</span>
                      <input autoComplete="address-line2" className={inputClass} name="line2" defaultValue={address.line2 ?? ""} />
                    </label>
                    <label className="block min-w-0">
                      <span className="text-sm font-bold text-text">Suburb or city *</span>
                      <input autoComplete="address-level2" className={inputClass} name="suburb" defaultValue={address.suburb} required />
                    </label>
                    <label className="block min-w-0">
                      <span className="text-sm font-bold text-text">State *</span>
                      <input autoComplete="address-level1" className={inputClass} name="state" defaultValue={address.state} required />
                    </label>
                    <label className="block min-w-0">
                      <span className="text-sm font-bold text-text">Postcode *</span>
                      <input autoComplete="postal-code" className={inputClass} inputMode="numeric" name="postalCode" defaultValue={address.postalCode} required />
                    </label>
                    <label className="block min-w-0">
                      <span className="text-sm font-bold text-text">Country *</span>
                      <input autoComplete="country-name" className={inputClass} name="country" defaultValue={address.country} required />
                    </label>
                    <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-3 text-sm font-bold text-text sm:col-span-2">
                      <input className="h-5 w-5 rounded border-border text-primary focus:ring-cta" defaultChecked={address.isDefault} name="isDefault" type="checkbox" />
                      Use as default delivery address
                    </label>
                    <div className="sm:col-span-2">
                      <AddressSubmitButton idleLabel="Update address" pendingLabel="Updating address..." />
                    </div>
                  </form>
                  <DeleteAddressForm action={deleteAddressAction} addressId={address.id} addressLabel={addressLabel} />
                </details>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-7 text-center shadow-sm sm:p-10">
            <h3 className="text-xl font-black text-text">No saved addresses</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-muted">Add your first address below to speed up delivery checkout.</p>
          </div>
        )}

        <details className="group mt-6 rounded-2xl border border-border bg-surface shadow-sm open:border-primary/25" open={addresses.length === 0 || params?.error === "validation"}>
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:px-6">
            <span>
              <span className="block text-xs font-extrabold uppercase tracking-[0.14em] text-fresh">New destination</span>
              <span className="mt-0.5 block text-lg font-black text-text">Add a delivery address</span>
            </span>
            <span className="shrink-0 text-sm font-bold text-primary group-open:hidden">Add</span>
            <span className="hidden shrink-0 text-sm font-bold text-primary group-open:inline">Close</span>
          </summary>
          <div className="border-t border-border p-5 sm:p-6">
            <p className="text-sm leading-6 text-text-muted">Required fields are marked with an asterisk. Country defaults to Australia.</p>
            <form action={createAddressAction} className="mt-5 grid gap-5 md:grid-cols-2">
              <fieldset className="md:col-span-2">
                <legend className="text-sm font-bold text-text">Address type</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Home", "Work", "Other"].map((label, index) => (
                    <label className="flex min-h-11 cursor-pointer items-center rounded-xl border border-border bg-background px-4 text-sm font-bold text-text transition-colors has-[:checked]:border-primary has-[:checked]:bg-fresh-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cta" key={label}>
                      <input className="sr-only" defaultChecked={index === 0} name="label" type="radio" value={label} />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              {addressFields.map((field) => (
                <label className={field.colSpan ? "block min-w-0 md:col-span-2" : "block min-w-0"} key={field.name}>
                  <span className="text-sm font-bold text-text">{field.label}{field.required ? " *" : ""}</span>
                  <input
                    autoComplete={field.autoComplete}
                    className={inputClass}
                    defaultValue={field.name === "country" ? "Australia" : ""}
                    inputMode={"inputMode" in field ? field.inputMode : undefined}
                    name={field.name}
                    readOnly={field.name === "country"}
                    required={field.required}
                    type={"type" in field ? field.type : undefined}
                  />
                  {field.name === "country" ? <span className="mt-2 block text-xs leading-5 text-text-muted">Currently available for Australian delivery and pickup customers.</span> : null}
                </label>
              ))}
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 text-sm font-bold text-text transition-colors hover:bg-surface-muted md:col-span-2">
                <input className="h-5 w-5 rounded border-border text-primary focus:ring-cta" name="isDefault" type="checkbox" />
                Use as my default delivery address
              </label>
              <div className="md:col-span-2">
                <AddressSubmitButton idleLabel="Save address" pendingLabel="Saving address..." />
              </div>
            </form>
          </div>
        </details>
      </section>
    </div>
  );
}
