import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ResetPasswordForm } from "@/components/account/reset-password-form";
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
    <div className="bg-[linear-gradient(135deg,#FAF8F1_0%,#FFFFFF_58%,#EEF7EF_100%)]">
      <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full rounded-lg border border-border bg-surface p-6 shadow-[0_16px_42px_rgba(17,17,17,0.07)] sm:p-8">
          <BrandLogo />
          <p className="mt-7 text-sm font-bold uppercase tracking-[0.06em] text-fresh">Secure password reset</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-text">Create a new password</h1>
          <p className="mt-2 text-sm leading-6 text-text-muted">Choose a new password for your A1 Haat Bazar account.</p>

          {error ? (
            <div
              className={[
                "mt-5 rounded-md border p-3 text-sm font-semibold",
                isValidRecoverySession ? "border-danger/30 bg-danger-soft text-danger" : "border-danger/30 bg-danger-soft text-danger",
              ].join(" ")}
              role="alert"
            >
              {error}
            </div>
          ) : null}

          {isValidRecoverySession ? (
            <ResetPasswordForm action={resetCustomerPasswordAction} />
          ) : (
            <div className="mt-6 rounded-md border border-border bg-surface-muted p-4">
              <p className="text-sm font-semibold text-text">This reset link is invalid or expired.</p>
              <p className="mt-2 text-sm leading-6 text-text-muted">Request a new password reset link from the login page.</p>
              <Link
                className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                href="/login?mode=forgot"
              >
                Request a new reset link
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
