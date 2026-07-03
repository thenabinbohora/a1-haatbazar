import Link from "next/link";
import { loginAdminAction } from "@/app/admin/login/actions";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

function getErrorMessage(error?: string) {
  if (error === "forbidden") {
    return "This account is not allowed to access the admin dashboard.";
  }

  if (error === "invalid") {
    return "Invalid email or password.";
  }

  if (error === "rate-limited") {
    return "Too many attempts. Please wait a minute and try again.";
  }

  return null;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const errorMessage = getErrorMessage(params?.error);

  return (
    <main className="a1-admin-shell min-h-[calc(100vh-140px)]">
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
        <div className="flex flex-col justify-center">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-[linear-gradient(135deg,#1F5A2E,#0F2E1A)] text-base font-black text-white shadow-[0_14px_32px_rgba(15,46,26,0.22)]">
            <span>
              A<span className="text-cta">1</span>
            </span>
          </div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-fresh">
            Admin access
          </p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-primary sm:text-5xl">
            Sign in to manage A1 Haat Bazar.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-text-muted">
            Manage products, orders, stock, banners, coupons, and operational settings from one protected console.
          </p>
          <div className="mt-6 grid max-w-xl gap-3 sm:grid-cols-3">
            {["Server protected", "Stock aware", "Order focused"].map((item) => (
              <span className="rounded-full border border-border bg-white/80 px-3 py-2 text-center text-xs font-bold text-primary shadow-sm" key={item}>
                {item}
              </span>
            ))}
          </div>
          <Link
            className="a1-secondary-button mt-7 w-fit px-5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta"
            href="/"
          >
            Return to storefront
          </Link>
        </div>

        <div className="a1-glass-card p-6 sm:p-7">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-fresh">Secure workspace</p>
          <h2 className="mt-2 text-2xl font-extrabold text-text">Admin login</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">
            Use the admin account created with the safe seed command.
          </p>

          {errorMessage ? (
            <div
              className="mt-5 rounded-lg border border-danger bg-danger-soft p-4 text-sm font-medium text-danger"
              role="alert"
            >
              {errorMessage}
            </div>
          ) : null}

          <form action={loginAdminAction} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-text" htmlFor="email">
                Email
              </label>
              <input
                autoComplete="email"
                className="mt-2 min-h-12 w-full rounded-md border border-border bg-surface px-4 text-base text-text transition-colors placeholder:text-text-muted focus:border-cta"
                id="email"
                name="email"
                required
                type="email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text" htmlFor="password">
                Password
              </label>
              <input
                autoComplete="current-password"
                className="mt-2 min-h-12 w-full rounded-md border border-border bg-surface px-4 text-base text-text transition-colors placeholder:text-text-muted focus:border-cta"
                id="password"
                name="password"
                required
                type="password"
              />
            </div>

            <button
              className="a1-primary-button w-full cursor-pointer px-6 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
              type="submit"
            >
              Sign in
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
