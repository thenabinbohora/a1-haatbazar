import Link from "next/link";
import { customerLoginAction, customerRegisterAction } from "@/app/login/actions";
import { AuthSubmitButton } from "@/components/account/auth-submit-button";
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

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="m5 12 4.2 4.2L19 6.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 3.5 19 6v5.4c0 4.1-2.8 7.8-7 9.1-4.2-1.3-7-5-7-9.1V6l7-2.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path d="m9.2 12 1.8 1.8 3.8-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const notice = message(params?.error, params?.success);
  const next = params?.next?.startsWith("/") ? params.next : "/account";
  const registerOpen = params?.mode === "register";
  const trustItems = ["Fresh stock updated regularly", "Local delivery and store pickup", "Cash on delivery or pay at pickup"];

  return (
    <div className="bg-[linear-gradient(135deg,#FAF8F1_0%,#FFFFFF_58%,#EEF7EF_100%)]">
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <aside className="relative overflow-hidden rounded-lg border border-primary/15 bg-[linear-gradient(145deg,#174A27_0%,#12391F_58%,#0F2E1A_100%)] p-6 text-white shadow-[0_18px_45px_rgba(15,46,26,0.18)] sm:p-8 lg:sticky lg:top-28 lg:self-start">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-cta/25 bg-cta/10" />
          <div className="pointer-events-none absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-white/5" />
          <div className="relative">
            <BrandLogo variant="dark" />
            <p className="mt-7 w-fit rounded-full border border-cta/35 bg-cta/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-cta-soft">
              Secure customer access
            </p>
            <h1 className="mt-4 max-w-md text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              Sign in for faster grocery shopping.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-emerald-50/85 sm:text-base">
              Track orders, save addresses, manage your wishlist, and checkout faster with A1 Haat Bazar.
            </p>
            <div className="mt-7 grid gap-3">
              {trustItems.map((item) => (
                <div className="flex items-center gap-3 text-sm font-bold text-emerald-50" key={item}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-cta/25 bg-white/10 text-cta-soft">
                    <CheckIcon />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-lg border border-white/12 bg-white/8 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cta-soft text-primary">
                  <ShieldIcon />
                </span>
                <div>
                  <p className="text-sm font-black text-white">Your grocery details stay private.</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-50/75">
                    Account information is used only for orders, saved addresses, wishlist, and checkout features.
                  </p>
                </div>
              </div>
            </div>
            <Link
              className="mt-6 inline-flex min-h-10 items-center rounded-full border border-white/20 px-4 text-sm font-bold text-emerald-50 transition-colors hover:border-cta/50 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta"
              href="/products"
            >
              Browse groceries
            </Link>
          </div>
        </aside>

        <div className="grid gap-6">
          <div className="rounded-lg border border-border bg-surface p-6 shadow-[0_16px_42px_rgba(17,17,17,0.07)] sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.06em] text-fresh">Customer login</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-text">Sign in to your account</h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              View orders, manage addresses, and save wishlist items.
            </p>
            {notice ? (
              <div
                className={[
                  "mt-5 rounded-md border p-3 text-sm font-semibold",
                  notice.tone === "error"
                    ? "border-danger/30 bg-danger-soft text-danger"
                    : "border-fresh/25 bg-fresh-soft text-fresh",
                ].join(" ")}
                role={notice.tone === "error" ? "alert" : "status"}
              >
                {notice.text}
              </div>
            ) : null}
            <form action={customerLoginAction} className="mt-6 grid gap-4">
              <input name="next" type="hidden" value={next} />
              <label className="block" htmlFor="login-email">
                <span className="text-sm font-bold text-text">Email</span>
              </label>
              <input
                autoComplete="email"
                className="-mt-2 min-h-12 w-full rounded-md border border-border bg-surface px-4 text-text outline-none transition-colors focus:border-cta focus:ring-2 focus:ring-cta/20"
                id="login-email"
                name="email"
                required
                type="email"
              />
              <label className="block" htmlFor="login-password">
                <span className="text-sm font-bold text-text">Password</span>
              </label>
              <PasswordInput autoComplete="current-password" id="login-password" name="password" required />
              <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <label className="flex w-fit cursor-pointer items-center gap-2 font-semibold text-text-muted">
                  <input className="h-4 w-4 rounded border-border text-primary focus:ring-cta" name="remember" type="checkbox" />
                  Remember me
                </label>
                <span className="font-semibold text-primary/80">
                  Forgot password? <span className="text-text-muted">Coming soon</span>
                </span>
              </div>
              <AuthSubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
              <div className="rounded-md border border-fresh/20 bg-fresh-soft/70 p-3 text-xs leading-5 text-text-muted">
                <p className="font-black text-primary">Secure customer login</p>
                <p>Your details are used only for orders and account features.</p>
              </div>
            </form>
          </div>

          <details
            className="group rounded-lg border border-border bg-surface p-6 shadow-sm transition-shadow open:shadow-[0_16px_42px_rgba(17,17,17,0.06)] sm:p-7"
            open={registerOpen}
          >
            <summary className="grid cursor-pointer list-none gap-4 marker:hidden sm:grid-cols-[1fr_auto] sm:items-center [&::-webkit-details-marker]:hidden">
              <span>
                <span className="text-sm font-bold uppercase tracking-[0.06em] text-fresh">New customer</span>
                <span className="mt-2 block text-2xl font-black tracking-tight text-text">New to A1 Haat Bazar?</span>
                <span className="mt-2 block text-sm leading-6 text-text-muted">
                  Create an account to save addresses, manage wishlist items, and checkout faster.
                </span>
              </span>
              <span className="inline-flex min-h-11 w-fit items-center justify-center rounded-md border border-primary px-5 text-sm font-bold text-primary transition-colors group-open:border-border group-open:bg-fresh-soft group-open:text-primary hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta">
                Create account
              </span>
            </summary>
            <form action={customerRegisterAction} className="mt-6 grid gap-4 border-t border-border pt-6">
              <input name="next" type="hidden" value={next} />
              <label className="block" htmlFor="register-name">
                <span className="text-sm font-bold text-text">Full name</span>
              </label>
              <input
                autoComplete="name"
                className="-mt-2 min-h-12 w-full rounded-md border border-border bg-surface px-4 text-text outline-none transition-colors focus:border-cta focus:ring-2 focus:ring-cta/20"
                id="register-name"
                name="name"
                required
              />
              <label className="block" htmlFor="register-email">
                <span className="text-sm font-bold text-text">Email</span>
              </label>
              <input
                autoComplete="email"
                className="-mt-2 min-h-12 w-full rounded-md border border-border bg-surface px-4 text-text outline-none transition-colors focus:border-cta focus:ring-2 focus:ring-cta/20"
                id="register-email"
                name="email"
                required
                type="email"
              />
              <label className="block" htmlFor="register-phone">
                <span className="text-sm font-bold text-text">Phone</span>
              </label>
              <input
                autoComplete="tel"
                className="-mt-2 min-h-12 w-full rounded-md border border-border bg-surface px-4 text-text outline-none transition-colors focus:border-cta focus:ring-2 focus:ring-cta/20"
                id="register-phone"
                name="phone"
                type="tel"
              />
              <div>
                <label className="block" htmlFor="register-password">
                  <span className="text-sm font-bold text-text">Password</span>
                </label>
                <PasswordInput autoComplete="new-password" id="register-password" name="password" required />
                <p className="mt-2 text-xs font-semibold text-text-muted">Use at least 8 characters.</p>
              </div>
              <AuthSubmitButton idleLabel="Create account" pendingLabel="Creating account..." />
            </form>
          </details>
        </div>
      </section>
    </div>
  );
}
