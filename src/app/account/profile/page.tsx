import type { Metadata } from "next";
import Link from "next/link";
import { updateCustomerProfileAction } from "@/app/account/actions";
import { AccountActionMessage } from "@/components/account/account-action-message";
import { AccountIcon } from "@/components/account/account-icons";
import { CustomerAccountShell } from "@/components/account/customer-account-shell";
import { requireCustomer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "My profile",
  description: "Manage your A1 Haat Bazar customer profile.",
  robots: { index: false },
};

type ProfilePageProps = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 text-base text-text outline-none transition-[border-color,box-shadow,background-color] focus:border-cta focus:bg-surface focus:ring-2 focus:ring-cta/20 read-only:cursor-not-allowed read-only:bg-surface-muted sm:text-sm";

export default async function AccountProfilePage({
  searchParams,
}: ProfilePageProps) {
  const user = await requireCustomer("/account/profile");
  const params = await searchParams;
  const profile = await prisma.user.findFirst({
    select: { email: true, name: true, phone: true },
    where: { id: user.id, role: "CUSTOMER", status: "ACTIVE" },
  });

  if (!profile) {
    return null;
  }

  return (
    <CustomerAccountShell
      description="Keep the personal details used for checkout and order contact up to date."
      title="Profile"
      user={user}
    >
      <AccountActionMessage
        error={params?.error}
        messages={{
          errors: {
            failed: "We could not update your profile. Please try again.",
            validation: "Check your name and phone number, then try again.",
          },
          successes: {
            updated: "Your profile details have been updated.",
          },
        }}
        success={params?.success}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.65fr)]">
        <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fresh-soft text-primary">
              <AccountIcon className="h-5 w-5" name="profile" />
            </span>
            <div>
              <h2 className="text-xl font-black text-text">
                Personal details
              </h2>
              <p className="mt-1 text-sm leading-6 text-text-muted">
                We only collect details used to identify your account and
                fulfil orders.
              </p>
            </div>
          </div>

          <form action={updateCustomerProfileAction} className="mt-6 grid gap-5">
            <label className="block min-w-0">
              <span className="text-sm font-bold text-text">Full name *</span>
              <input
                autoComplete="name"
                className={inputClass}
                defaultValue={profile.name ?? ""}
                maxLength={120}
                minLength={2}
                name="name"
                required
              />
              <span className="mt-2 block text-xs leading-5 text-text-muted">
                Used on your account and at checkout.
              </span>
            </label>
            <label className="block min-w-0">
              <span className="text-sm font-bold text-text">Email address</span>
              <input
                aria-describedby="profile-email-help"
                autoComplete="email"
                className={inputClass}
                readOnly
                type="email"
                value={profile.email}
              />
              <span
                className="mt-2 block text-xs leading-5 text-text-muted"
                id="profile-email-help"
              >
                Email changes require a verified support process and are not
                available from this screen.
              </span>
            </label>
            <label className="block min-w-0">
              <span className="text-sm font-bold text-text">
                Phone number <span className="font-medium">(optional)</span>
              </span>
              <input
                autoComplete="tel"
                className={inputClass}
                defaultValue={profile.phone ?? ""}
                inputMode="tel"
                maxLength={40}
                name="phone"
                type="tel"
              />
              <span className="mt-2 block text-xs leading-5 text-text-muted">
                A delivery address can use a different operational contact
                number.
              </span>
            </label>
            <button
              className="min-h-12 w-full cursor-pointer rounded-xl bg-primary px-5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta sm:w-fit"
              type="submit"
            >
              Save changes
            </button>
          </form>
        </section>

        <aside className="grid content-start gap-5">
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_3px_rgba(18,60,46,0.05)] sm:p-5">
            <AccountIcon className="h-6 w-6 text-fresh" name="lock" />
            <h2 className="mt-3 text-lg font-black text-text">
              Account security
            </h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Password changes and sign-out controls are kept in a dedicated
              secure section.
            </p>
            <Link
              className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-extrabold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href="/account/security"
            >
              Review security
              <AccountIcon className="h-4 w-4" name="arrow-right" />
            </Link>
          </section>

          <section className="rounded-2xl border border-border bg-fresh-soft/70 p-4 sm:p-5">
            <h2 className="text-base font-black text-text">Privacy note</h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Your profile is visible only inside your signed-in customer
              account and to authorised store operations.
            </p>
          </section>
        </aside>
      </div>
    </CustomerAccountShell>
  );
}
