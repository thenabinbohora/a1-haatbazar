import type { Metadata } from "next";
import Link from "next/link";
import { customerLoginAction, customerRegisterAction } from "@/app/login/actions";
import { BrandLogo } from "@/components/brand/brand-logo";
import { CustomerAuthCard, type LoginNotice } from "@/components/account/customer-auth-card";

export const metadata: Metadata = {
  title: "Sign in or create account",
  description: "Sign in to your A1 Haat Bazar account to track orders, save addresses, and keep a wishlist.",
  robots: { index: false },
};

type LoginPageProps = {
  searchParams?: Promise<{ error?: string; success?: string; mode?: string; next?: string }>;
};

function message(error?: string, success?: string): LoginNotice | null {
  if (success === "logout") return { tone: "success", text: "You have signed out." };
  if (success === "password-updated") return { tone: "success", text: "Your password has been updated. Please sign in with your new password." };
  if (error === "exists") return { tone: "error", text: "An account with that email already exists." };
  if (error === "validation") return { tone: "error", text: "Check the submitted details and try again." };
  if (error === "forbidden") return { tone: "error", text: "This account cannot access that page." };
  if (error === "invalid") return { tone: "error", text: "Invalid email or password." };
  if (error === "failed") return { tone: "error", text: "The account could not be created." };
  if (error === "reset_link_invalid") return { tone: "error", text: "This reset link is invalid or expired. Please request a new link." };
  if (error === "rate-limited") return { tone: "error", text: "Too many attempts. Please wait a minute and try again." };
  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const notice = message(params?.error, params?.success);
  const next = params?.next?.startsWith("/") && !params.next.startsWith("//") && !params.next.startsWith("/admin") ? params.next : "/account";
  const initialMode = params?.mode === "register" ? "register" : params?.mode === "forgot" ? "forgot" : "login";

  return (
    <div className="min-h-dvh overflow-x-clip bg-background">
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch lg:gap-7 lg:px-8 lg:py-14">
        <aside className="relative hidden overflow-hidden rounded-2xl border border-primary-muted bg-primary p-5 text-white shadow-xl sm:p-8 lg:flex lg:min-h-[620px] lg:items-center lg:p-10">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full border border-cta/25 bg-cta/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-8 h-48 w-48 rounded-full bg-white/5" />
          <div className="relative">
            <BrandLogo variant="dark" />
            <p className="mt-6 w-fit rounded-full border border-cta/35 bg-cta/15 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-cta-soft sm:mt-8">
              Secure customer access
            </p>
            <h1 className="mt-4 max-w-md text-3xl font-black leading-[1.12] tracking-tight sm:text-4xl lg:text-[2.75rem]">
              Sign in for faster grocery shopping.
            </h1>
            <p className="mt-4 hidden max-w-md text-sm leading-7 text-white/80 sm:block sm:text-base">
              Track orders, save addresses, manage your wishlist, and checkout faster with A1 Haat Bazar.
            </p>
            <Link
              className="mt-8 hidden min-h-12 items-center rounded-xl border border-cta/40 bg-cta-soft px-5 text-sm font-extrabold text-primary shadow-sm transition-colors hover:border-white hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta sm:inline-flex"
              href="/products"
            >
              Browse groceries
            </Link>
          </div>
        </aside>

        <div className="mx-auto flex w-full max-w-[calc(100vw-2rem)] min-w-0 items-center lg:max-w-none">
          <CustomerAuthCard
            initialMode={initialMode}
            loginAction={customerLoginAction}
            next={next}
            notice={notice}
            registerAction={customerRegisterAction}
          />
        </div>

      </section>
    </div>
  );
}
