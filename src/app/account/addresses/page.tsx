import { createAddressAction, deleteAddressAction, updateAddressAction } from "@/app/account/actions";
import { AccountNav } from "@/components/account/account-nav";
import { AdminActionMessage } from "@/components/admin/admin-action-message";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  { name: "phone", label: "Phone", required: true, colSpan: false, autoComplete: "tel" },
  { name: "line1", label: "Address line 1", required: true, colSpan: true, autoComplete: "address-line1" },
  { name: "line2", label: "Address line 2", required: false, colSpan: true, autoComplete: "address-line2" },
  { name: "suburb", label: "Suburb or city", required: true, colSpan: false, autoComplete: "address-level2" },
  { name: "state", label: "State", required: true, colSpan: false, autoComplete: "address-level1" },
  { name: "postalCode", label: "Postcode", required: true, colSpan: false, autoComplete: "postal-code" },
  { name: "country", label: "Country", required: true, colSpan: false, autoComplete: "country-name" },
] as const;

export default async function AccountAddressesPage({ searchParams }: AddressesPageProps) {
  const user = await requireCustomer();
  const params = await searchParams;
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="bg-background">
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-fresh">Account</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-text sm:text-4xl">Addresses</h1>
        <AccountNav />
        <AdminActionMessage error={params?.error} messages={messages} success={params?.success} />

        <section className="mb-6 rounded-lg border border-border bg-surface p-5 shadow-sm">
          <h2 className="text-xl font-bold text-text">Add address</h2>
          <p className="mt-2 text-sm text-text-muted">Required fields are marked with an asterisk. Country defaults to Australia.</p>
          <form action={createAddressAction} className="mt-5 grid gap-4 md:grid-cols-2">
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-semibold text-text">Address type</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Home", "Work", "Other"].map((label, index) => (
                  <label className="cursor-pointer rounded-full border border-border bg-surface-muted px-4 py-2 text-sm font-semibold text-text has-[:checked]:border-primary has-[:checked]:bg-fresh-soft" key={label}>
                    <input className="sr-only" defaultChecked={index === 0} name="label" type="radio" value={label} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            {addressFields.map((field) => (
              <label className={field.colSpan ? "block md:col-span-2" : "block"} key={field.name}>
                <span className="text-sm font-semibold text-text">{field.label}{field.required ? " *" : ""}</span>
                <input
                  autoComplete={field.autoComplete}
                  className="mt-2 min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-text focus:border-cta"
                  defaultValue={field.name === "country" ? "Australia" : ""}
                  readOnly={field.name === "country"}
                  name={field.name}
                  required={field.required}
                />
                {field.name === "country" ? <span className="mt-1 block text-xs text-text-muted">Currently available for Australian delivery and pickup customers.</span> : null}
              </label>
            ))}
            <label className="flex min-h-11 items-center gap-3 rounded-md border border-border bg-surface-muted px-3 text-sm font-semibold text-text">
              <input name="isDefault" type="checkbox" />
              Default delivery address
            </label>
            <div className="md:col-span-2">
              <button className="min-h-11 cursor-pointer rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" type="submit">Save address</button>
            </div>
          </form>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <details className="rounded-lg border border-border bg-surface p-5 shadow-sm" key={address.id}>
              <summary className="cursor-pointer text-lg font-bold text-text">
                {address.label ?? "Delivery address"} {address.isDefault ? "(Default)" : ""}
              </summary>
              <p className="mt-3 text-sm leading-6 text-text-muted">
                {address.fullName}<br />
                {address.line1}<br />
                {address.line2 ? <>{address.line2}<br /></> : null}
                {address.suburb}, {address.state} {address.postalCode}<br />
                {address.country}
              </p>
              <form action={updateAddressAction} className="mt-4 grid gap-3">
                <input name="id" type="hidden" value={address.id} />
                <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text" name="label" defaultValue={address.label ?? ""} placeholder="Label" />
                <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text" name="fullName" defaultValue={address.fullName} required />
                <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text" name="phone" defaultValue={address.phone} required />
                <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text" name="line1" defaultValue={address.line1} required />
                <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text" name="line2" defaultValue={address.line2 ?? ""} />
                <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text" name="suburb" defaultValue={address.suburb} required />
                <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text" name="state" defaultValue={address.state} required />
                <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text" name="postalCode" defaultValue={address.postalCode} required />
                <input className="min-h-10 rounded-md border border-border bg-surface px-3 text-text" name="country" defaultValue={address.country} required />
                <label className="flex items-center gap-2 text-sm font-semibold text-text"><input defaultChecked={address.isDefault} name="isDefault" type="checkbox" /> Default</label>
                <button className="min-h-10 cursor-pointer rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" type="submit">Update address</button>
              </form>
              <form action={deleteAddressAction} className="mt-3">
                <input name="id" type="hidden" value={address.id} />
                <button className="min-h-10 cursor-pointer rounded-md border border-danger px-4 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger" type="submit">Delete address</button>
              </form>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
