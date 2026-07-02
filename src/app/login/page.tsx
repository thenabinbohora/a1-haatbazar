import Link from "next/link";
import { customerLoginAction, customerRegisterAction } from "@/app/login/actions";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PasswordInput } from "@/components/account/password-input";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string; success?: string; mode?: string; next?: string }>;
};

function message(error?: string, success?: string) {
  if (success === "logout") return { tone: "success", text: "You have signed out." };
  if (error === "exists") return { tone: "error", text: "An account with that email already exists." };
  if (error === "validation") return { tone: "error", text: "Check the submitted details and try again." };
  if (error === "forbidden") return { tone: "error", text: "This account cannot access that page." };
  if (error === "invalid") return { tone: "error", text: "Invalid email or password." };
  if (error === "failed") return { tone: "error", text: "The account could not be created." };
  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const notice = message(params?.error, params?.success);
  const next = params?.next?.startsWith("/") ? params.next : "/account";

  return (
    <div className="bg-[linear-gradient(135deg,#FAF8F1_0%,#FFFFFF_60%,#EEF7EF_100%)]">
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <aside className="rounded-lg border border-primary/20 bg-primary p-6 text-white shadow-sm lg:sticky lg:top-28 lg:self-start">
          <BrandLogo variant="dark" />
          <h1 className="mt-6 text-3xl font-extrabold leading-tight">Sign in for faster grocery shopping.</h1>
          <p className="mt-3 text-sm leading-6 text-emerald-50/85">
            Track orders, save addresses, manage your wishlist, and check out faster with A1 Haat Bazar.
          </p>
          <div className="mt-6 grid gap-3 text-sm font-semibold text-emerald-50/90">
            <p>Fresh stock updated regularly</p>
            <p>Local delivery and store pickup</p>
            <p>Cash on delivery or pay at pickup</p>
          </div>
          <Link
            className="mt-6 inline-flex min-h-11 items-center rounded-md bg-white px-5 text-sm font-bold text-primary transition-colors hover:bg-cta-soft"
            href="/products"
          >
            Continue shopping
          </Link>
        </aside>

        <div className="grid gap-6">
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-fresh">Customer login</p>
          <h2 className="mt-2 text-3xl font-bold text-text">Sign in to your account</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">View orders, manage addresses, and save wishlist items.</p>
          {notice ? (
            <div
              className={[
                "mt-5 rounded-md border p-3 text-sm font-semibold",
                notice.tone === "error" ? "border-danger bg-danger-soft text-danger" : "border-fresh bg-fresh-soft text-fresh",
              ].join(" ")}
              role={notice.tone === "error" ? "alert" : "status"}
            >
              {notice.text}
            </div>
          ) : null}
          <form action={customerLoginAction} className="mt-6 grid gap-4">
            <input name="next" type="hidden" value={next} />
            <label className="block">
              <span className="text-sm font-semibold text-text">Email</span>
              <input autoComplete="email" className="mt-2 min-h-12 w-full rounded-md border border-border bg-surface px-4 text-text focus:border-cta" name="email" required type="email" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-text">Password</span>
              <PasswordInput autoComplete="current-password" name="password" required />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 font-semibold text-text-muted">
                <input name="remember" type="checkbox" />
                Remember me
              </label>
              <span className="font-semibold text-text-muted">Forgot password? Coming soon</span>
            </div>
            <button className="min-h-12 cursor-pointer rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" type="submit">
              Sign in
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-fresh">New customer</p>
          <h2 className="mt-2 text-3xl font-bold text-text">Create an account</h2>
          <p className="mt-2 text-sm leading-6 text-text-muted">Use at least 8 characters for the password.</p>
          <form action={customerRegisterAction} className="mt-6 grid gap-4">
            <input name="next" type="hidden" value={next} />
            <label className="block">
              <span className="text-sm font-semibold text-text">Full name</span>
              <input autoComplete="name" className="mt-2 min-h-12 w-full rounded-md border border-border bg-surface px-4 text-text focus:border-cta" name="name" required />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-text">Email</span>
              <input autoComplete="email" className="mt-2 min-h-12 w-full rounded-md border border-border bg-surface px-4 text-text focus:border-cta" name="email" required type="email" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-text">Phone</span>
              <input autoComplete="tel" className="mt-2 min-h-12 w-full rounded-md border border-border bg-surface px-4 text-text focus:border-cta" name="phone" type="tel" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-text">Password</span>
              <PasswordInput autoComplete="new-password" name="password" required />
            </label>
            <button className="min-h-12 cursor-pointer rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta" type="submit">
              Create account
            </button>
          </form>
        </div>
        </div>
      </section>
    </div>
  );
}
