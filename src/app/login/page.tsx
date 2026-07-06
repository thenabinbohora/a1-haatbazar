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

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
      <path d="m5 12 4.2 4.2L19 6.8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
    </svg>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const notice = message(params?.error, params?.success);
  const next = params?.next?.startsWith("/") && !params.next.startsWith("//") && !params.next.startsWith("/admin") ? params.next : "/account";
  const initialMode = params?.mode === "register" ? "register" : params?.mode === "forgot" ? "forgot" : "login";
  const trustItems = ["Fresh stock updated regularly", "Local delivery and store pickup", "Cash on delivery or pay at pickup"];

  return (
    <div className="overflow-x-clip bg-[linear-gradient(135deg,#FAF8F1_0%,#FFFFFF_58%,#EEF7EF_100%)]">
      <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-5 sm:gap-6 sm:px-6 sm:pb-24 sm:pt-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:px-8 lg:pb-28">
        <aside className="relative overflow-hidden rounded-lg border border-primary/15 bg-[linear-gradient(145deg,#174A27_0%,#12391F_58%,#0F2E1A_100%)] p-5 text-white shadow-[0_18px_45px_rgba(15,46,26,0.18)] sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-cta/25 bg-cta/10" />
          <div className="pointer-events-none absolute -bottom-20 left-8 h-44 w-44 rounded-full bg-white/5" />
          <div className="relative">
            <BrandLogo variant="dark" />
            <p className="mt-5 w-fit rounded-full border border-cta/35 bg-cta/15 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-cta-soft sm:mt-7">
              Secure customer access
            </p>
            <h1 className="mt-3 max-w-md text-2xl font-black leading-tight tracking-tight sm:mt-4 sm:text-4xl">
              Sign in for faster grocery shopping.
            </h1>
            <p className="mt-3 hidden max-w-md text-sm leading-6 text-emerald-50/85 sm:mt-4 sm:block sm:text-base">
              Track orders, save addresses, manage your wishlist, and checkout faster with A1 Haat Bazar.
            </p>
            <div className="mt-7 hidden gap-3 sm:grid">
              {trustItems.map((item) => (
                <div className="flex items-center gap-3 text-sm font-bold text-emerald-50" key={item}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-cta/25 bg-white/10 text-cta-soft">
                    <CheckIcon />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Link
              className="mt-5 hidden min-h-11 items-center rounded-full border border-cta-soft bg-[#FFF7E6] px-5 text-sm font-bold !text-primary shadow-sm transition-colors hover:border-white hover:bg-white hover:!text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta sm:mt-8 sm:inline-flex"
              href="/products"
            >
              Browse groceries
            </Link>
          </div>
        </aside>

        <div className="mx-auto w-full max-w-[calc(100vw-2rem)] min-w-0 lg:max-w-none">
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
