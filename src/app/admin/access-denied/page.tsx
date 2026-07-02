import Link from "next/link";
import { logoutAction } from "@/app/admin/login/actions";

export default function AdminAccessDeniedPage() {
  return (
    <main className="a1-admin-shell min-h-[calc(100vh-140px)]">
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="a1-glass-card border-danger/40 p-6 sm:p-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-danger">
            Access denied
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-primary">Admin permission required</h1>
          <p className="mt-4 text-base leading-7 text-text-muted">
            Your account is signed in, but it does not have the ADMIN role required for this area.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <form action={logoutAction}>
              <button
                className="a1-primary-button cursor-pointer px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                type="submit"
              >
                Sign out
              </button>
            </form>
            <Link
              className="a1-secondary-button px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              href="/"
            >
              Go to storefront
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
