import type { Metadata } from "next";
import Link from "next/link";
import { AuthPageShell } from "@/components/account/auth-page-shell";
import { ResetPasswordForm } from "@/components/account/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new password for your A1 Haat Bazar account.",
  robots: { index: false },
};
import { resetCustomerPasswordAction } from "@/app/reset-password/actions";
import { getSupabaseRecoveryUser } from "@/lib/supabase-auth-server";

type ResetPasswordPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

function errorMessage(error?: string) {
  if (error === "short") return "Use at least 8 characters.";
  if (error === "mismatch") return "Passwords do not match.";
  if (error === "failed") return "The password could not be updated. Please try again.";
  if (error === "invalid") return "This reset link is invalid or expired.";
  return null;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const error = errorMessage(params?.error);
  const recoveryUser = await getSupabaseRecoveryUser();
  const isValidRecoverySession = Boolean(recoveryUser?.email);

  return (
    <AuthPageShell
      promoDescription="Use a secure recovery link to choose a new password and return to your account."
      promoEyebrow="Protected account recovery"
      promoTitle="Keep your grocery account secure."
    >
      <section
        aria-labelledby="auth-title"
        className="w-full min-w-0 rounded-3xl border border-border bg-surface p-5 shadow-[0_18px_48px_rgba(18,60,46,0.11)] min-[360px]:p-6 sm:p-8 lg:p-9"
        data-auth-form-card
      >
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-fresh">
          Secure password reset
        </p>
        <h1
          className="mt-2 text-2xl font-black leading-tight tracking-tight text-text sm:text-3xl"
          id="auth-title"
        >
          Create a new password
        </h1>
        <p className="mt-3 max-w-[32rem] text-sm leading-6 text-text-muted">
          Choose a new password for your A1 Haat Bazar account.
        </p>

        {error && isValidRecoverySession ? (
          <div
            aria-live="assertive"
            className="mt-5 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-semibold leading-6 text-danger"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {isValidRecoverySession ? (
          <ResetPasswordForm action={resetCustomerPasswordAction} />
        ) : (
          <div
            className="mt-7 rounded-2xl border border-border bg-surface-muted p-5"
            role="status"
          >
            <p className="text-sm font-extrabold text-text">
              This reset link is invalid or expired.
            </p>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Request new password-reset instructions and try again.
            </p>
            <Link
              className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-primary px-5 text-sm font-extrabold text-white shadow-sm transition-colors duration-200 hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
              href="/login?mode=forgot"
              prefetch={false}
            >
              Request new instructions
            </Link>
          </div>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-x-5 border-t border-border pt-5 text-sm">
          <Link
            className="inline-flex min-h-11 items-center rounded-lg px-1 font-semibold text-primary underline-offset-4 transition-colors duration-200 hover:text-primary-muted hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
            href="/login"
            prefetch={false}
          >
            Back to sign in
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-lg px-1 font-semibold text-text-muted underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
            href="/products"
            prefetch={false}
          >
            Continue shopping
          </Link>
        </div>
      </section>
    </AuthPageShell>
  );
}
