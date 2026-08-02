import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  customerLoginAction,
  customerRegisterAction,
  requestCustomerPasswordResetAction,
} from "@/app/login/actions";
import { AuthPageShell } from "@/components/account/auth-page-shell";
import { CustomerAuthCard, type LoginNotice } from "@/components/account/customer-auth-card";
import { getCurrentUser } from "@/lib/auth";
import { safeInternalReturnPath } from "@/lib/safe-return-path";

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
  if (error === "exists") return { tone: "error", text: "We could not create your account. Try signing in or resetting your password." };
  if (error === "validation") return { tone: "error", text: "Check the submitted details and try again." };
  if (error === "forbidden") return { tone: "error", text: "This account cannot access that page." };
  if (error === "invalid") return { tone: "error", text: "The email or password was not recognised." };
  if (error === "failed") return { tone: "error", text: "We could not create your account right now. Please try again shortly." };
  if (error === "reset_link_invalid") return { tone: "error", text: "This reset link is invalid or expired. Please request a new link." };
  if (error === "rate-limited") return { tone: "error", text: "Too many attempts. Please wait a minute and try again." };
  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [params, user] = await Promise.all([searchParams, getCurrentUser()]);
  const notice = message(params?.error, params?.success);
  const next = safeInternalReturnPath(params?.next);
  const initialMode = params?.mode === "register" ? "register" : params?.mode === "forgot" ? "forgot" : "login";

  if (user?.role === "CUSTOMER" || user?.role === "ADMIN") {
    redirect(next);
  }

  return (
    <AuthPageShell>
      <CustomerAuthCard
        initialMode={initialMode}
        loginAction={customerLoginAction}
        next={next}
        notice={notice}
        registerAction={customerRegisterAction}
        resetAction={requestCustomerPasswordResetAction}
      />
    </AuthPageShell>
  );
}
