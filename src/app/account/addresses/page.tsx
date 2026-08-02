import type { Metadata } from "next";
import {
  createAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
  updateAddressAction,
} from "@/app/account/actions";
import { AccountActionMessage } from "@/components/account/account-action-message";
import { AccountIcon } from "@/components/account/account-icons";
import {
  AddressSubmitButton,
  DeleteAddressForm,
} from "@/components/account/address-action-buttons";
import { CustomerAccountShell } from "@/components/account/customer-account-shell";
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
    failed: "We could not update your addresses. Please try again.",
    validation: "Check the address details and try again.",
    "not-found": "That address could not be found.",
  },
  successes: {
    created: "Your delivery address has been added.",
    default: "Your default delivery address has been updated.",
    deleted: "The delivery address has been removed.",
    updated: "Your delivery address has been updated.",
  },
};

const addressFields = [
  {
    autoComplete: "name",
    colSpan: false,
    label: "Full name",
    name: "fullName",
    required: true,
  },
  {
    autoComplete: "tel",
    colSpan: false,
    inputMode: "tel",
    label: "Phone",
    name: "phone",
    required: true,
    type: "tel",
  },
  {
    autoComplete: "address-line1",
    colSpan: true,
    label: "Address line 1",
    name: "line1",
    required: true,
  },
  {
    autoComplete: "address-line2",
    colSpan: true,
    label: "Address line 2",
    name: "line2",
    required: false,
  },
  {
    autoComplete: "address-level2",
    colSpan: false,
    label: "Suburb or city",
    name: "suburb",
    required: true,
  },
  {
    autoComplete: "address-level1",
    colSpan: false,
    label: "State",
    name: "state",
    required: true,
  },
  {
    autoComplete: "postal-code",
    colSpan: false,
    inputMode: "numeric",
    label: "Postcode",
    name: "postalCode",
    required: true,
  },
  {
    autoComplete: "country-name",
    colSpan: false,
    label: "Country",
    name: "country",
    required: true,
  },
] as const;

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-text outline-none transition-[border-color,box-shadow,background-color] focus:border-cta focus:bg-surface focus:ring-2 focus:ring-cta/20 read-only:cursor-not-allowed read-only:bg-surface-muted sm:text-sm";

export default async function AccountAddressesPage({
  searchParams,
}: AddressesPageProps) {
  const user = await requireCustomer("/account/addresses");
  const params = await searchParams;
  const addresses = await prisma.address.findMany({
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    where: { type: "SHIPPING", userId: user.id },
  });

  return (
    <CustomerAccountShell
      description="Keep trusted delivery details ready for a faster checkout."
      title="Delivery addresses"
      user={user}
    >
      <AccountActionMessage
        error={params?.error}
        messages={messages}
        success={params?.success}
      />

      <details
        className="group mb-5 overflow-hidden rounded-2xl border border-primary/20 bg-surface shadow-[0_1px_3px_rgba(18,60,46,0.05)] open:border-primary/35"
        id="add-address"
        open={addresses.length === 0 || params?.error === "validation"}
      >
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cta sm:px-5 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
              <AccountIcon className="h-5 w-5" name="address" />
            </span>
            <span>
              <span className="block text-xs font-extrabold uppercase tracking-[0.13em] text-fresh">
                New destination
              </span>
              <span className="block text-base font-black text-text">
                Add a delivery address
              </span>
            </span>
          </span>
          <span className="text-sm font-extrabold text-primary group-open:hidden">
            Add
          </span>
          <span className="hidden text-sm font-extrabold text-primary group-open:block">
            Close
          </span>
        </summary>
        <div className="border-t border-border p-4 sm:p-6">
          <p className="text-sm leading-6 text-text-muted">
            Required fields are marked with an asterisk. Addresses are used only
            for delivery and checkout.
          </p>
          <form
            action={createAddressAction}
            className="mt-5 grid gap-5 md:grid-cols-2"
          >
            <fieldset className="md:col-span-2">
              <legend className="text-sm font-bold text-text">
                Address label
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Home", "Work", "Other"].map((label, index) => (
                  <label
                    className="flex min-h-11 cursor-pointer items-center rounded-xl border border-border bg-background px-4 text-sm font-bold text-text transition-colors has-[:checked]:border-primary has-[:checked]:bg-fresh-soft has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cta"
                    key={label}
                  >
                    <input
                      className="sr-only"
                      defaultChecked={index === 0}
                      name="label"
                      type="radio"
                      value={label}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            {addressFields.map((field) => (
              <label
                className={
                  field.colSpan
                    ? "block min-w-0 md:col-span-2"
                    : "block min-w-0"
                }
                key={field.name}
              >
                <span className="text-sm font-bold text-text">
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
                <input
                  autoComplete={field.autoComplete}
                  className={inputClass}
                  defaultValue={field.name === "country" ? "Australia" : ""}
                  inputMode={
                    "inputMode" in field ? field.inputMode : undefined
                  }
                  name={field.name}
                  readOnly={field.name === "country"}
                  required={field.required}
                  type={"type" in field ? field.type : undefined}
                />
              </label>
            ))}
            <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 text-sm font-bold text-text transition-colors hover:bg-surface-muted md:col-span-2">
              <input
                className="h-5 w-5 rounded border-border text-primary focus:ring-cta"
                name="isDefault"
                type="checkbox"
              />
              Use as my default delivery address
            </label>
            <div className="md:col-span-2">
              <AddressSubmitButton
                idleLabel="Save address"
                pendingLabel="Saving address..."
              />
            </div>
          </form>
        </div>
      </details>

      <section aria-labelledby="saved-addresses-title">
        <div className="mb-4">
          <h2
            className="text-xl font-black text-text"
            id="saved-addresses-title"
          >
            Saved addresses
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            {addresses.length
              ? `${addresses.length} ${
                  addresses.length === 1 ? "address" : "addresses"
                } saved`
              : "No delivery addresses saved yet."}
          </p>
        </div>

        {addresses.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {addresses.map((address) => {
              const addressLabel = address.label || "Delivery address";

              return (
                <article
                  className="min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-5"
                  key={address.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-text">
                          {addressLabel}
                        </h3>
                        {address.isDefault ? (
                          <span className="rounded-full border border-fresh/25 bg-fresh-soft px-2.5 py-1 text-xs font-extrabold text-fresh">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <address className="mt-3 break-words not-italic text-sm leading-6 text-text-muted [overflow-wrap:anywhere]">
                        <span className="font-bold text-text">
                          {address.fullName}
                        </span>
                        <br />
                        {address.line1}
                        <br />
                        {address.line2 ? (
                          <>
                            {address.line2}
                            <br />
                          </>
                        ) : null}
                        {address.suburb} {address.state} {address.postalCode}
                        <br />
                        {address.country}
                      </address>
                      <p className="mt-2 text-sm text-text-muted">
                        {address.phone}
                      </p>
                    </div>
                    <AccountIcon
                      className="h-5 w-5 text-fresh"
                      name="address"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    {!address.isDefault ? (
                      <form action={setDefaultAddressAction}>
                        <input name="id" type="hidden" value={address.id} />
                        <button
                          className="min-h-11 cursor-pointer rounded-xl border border-border bg-background px-3.5 text-sm font-extrabold text-text transition-colors hover:border-primary/25 hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                          type="submit"
                        >
                          Set as default
                        </button>
                      </form>
                    ) : null}
                    <details className="group/edit min-w-0 flex-1">
                      <summary className="flex min-h-11 w-fit cursor-pointer list-none items-center rounded-xl border border-border bg-background px-3.5 text-sm font-extrabold text-text transition-colors hover:border-primary/25 hover:bg-surface-muted hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta [&::-webkit-details-marker]:hidden">
                        <span className="group-open/edit:hidden">Edit address</span>
                        <span className="hidden group-open/edit:inline">
                          Close editor
                        </span>
                      </summary>
                      <form
                        action={updateAddressAction}
                        className="mt-4 grid gap-4 rounded-xl border border-border bg-background p-4 sm:grid-cols-2"
                      >
                        <input name="id" type="hidden" value={address.id} />
                        <label className="block min-w-0">
                          <span className="text-sm font-bold text-text">
                            Label
                          </span>
                          <input
                            className={inputClass}
                            defaultValue={address.label ?? ""}
                            name="label"
                            placeholder="Home, work, or other"
                          />
                        </label>
                        <label className="block min-w-0">
                          <span className="text-sm font-bold text-text">
                            Full name *
                          </span>
                          <input
                            autoComplete="name"
                            className={inputClass}
                            defaultValue={address.fullName}
                            name="fullName"
                            required
                          />
                        </label>
                        <label className="block min-w-0">
                          <span className="text-sm font-bold text-text">
                            Phone *
                          </span>
                          <input
                            autoComplete="tel"
                            className={inputClass}
                            defaultValue={address.phone}
                            inputMode="tel"
                            name="phone"
                            required
                            type="tel"
                          />
                        </label>
                        <label className="block min-w-0 sm:col-span-2">
                          <span className="text-sm font-bold text-text">
                            Address line 1 *
                          </span>
                          <input
                            autoComplete="address-line1"
                            className={inputClass}
                            defaultValue={address.line1}
                            name="line1"
                            required
                          />
                        </label>
                        <label className="block min-w-0 sm:col-span-2">
                          <span className="text-sm font-bold text-text">
                            Address line 2
                          </span>
                          <input
                            autoComplete="address-line2"
                            className={inputClass}
                            defaultValue={address.line2 ?? ""}
                            name="line2"
                          />
                        </label>
                        <label className="block min-w-0">
                          <span className="text-sm font-bold text-text">
                            Suburb or city *
                          </span>
                          <input
                            autoComplete="address-level2"
                            className={inputClass}
                            defaultValue={address.suburb}
                            name="suburb"
                            required
                          />
                        </label>
                        <label className="block min-w-0">
                          <span className="text-sm font-bold text-text">
                            State *
                          </span>
                          <input
                            autoComplete="address-level1"
                            className={inputClass}
                            defaultValue={address.state}
                            name="state"
                            required
                          />
                        </label>
                        <label className="block min-w-0">
                          <span className="text-sm font-bold text-text">
                            Postcode *
                          </span>
                          <input
                            autoComplete="postal-code"
                            className={inputClass}
                            defaultValue={address.postalCode}
                            inputMode="numeric"
                            name="postalCode"
                            required
                          />
                        </label>
                        <label className="block min-w-0">
                          <span className="text-sm font-bold text-text">
                            Country *
                          </span>
                          <input
                            autoComplete="country-name"
                            className={inputClass}
                            defaultValue={address.country}
                            name="country"
                            required
                          />
                        </label>
                        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-3 text-sm font-bold text-text sm:col-span-2">
                          <input
                            className="h-5 w-5 rounded border-border text-primary focus:ring-cta"
                            defaultChecked={address.isDefault}
                            name="isDefault"
                            type="checkbox"
                          />
                          Use as default delivery address
                        </label>
                        <div className="sm:col-span-2">
                          <AddressSubmitButton
                            idleLabel="Update address"
                            pendingLabel="Updating address..."
                          />
                        </div>
                      </form>
                    </details>
                  </div>
                  <DeleteAddressForm
                    action={deleteAddressAction}
                    addressId={address.id}
                    addressLabel={addressLabel}
                  />
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center sm:p-8">
            <AccountIcon
              className="mx-auto h-7 w-7 text-fresh"
              name="address"
            />
            <h3 className="mt-3 text-lg font-black text-text">
              No delivery address saved
            </h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-text-muted">
              Add one above to make delivery checkout faster.
            </p>
          </div>
        )}
      </section>
    </CustomerAccountShell>
  );
}
