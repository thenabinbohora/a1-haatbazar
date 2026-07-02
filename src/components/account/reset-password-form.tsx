"use client";

import { useState, type FormEvent } from "react";
import { AuthSubmitButton } from "@/components/account/auth-submit-button";
import { PasswordInput } from "@/components/account/password-input";

type ResetPasswordFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function ResetPasswordForm({ action }: ResetPasswordFormProps) {
  const [clientError, setClientError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 8) {
      event.preventDefault();
      setClientError("Use at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      event.preventDefault();
      setClientError("Passwords do not match.");
      return;
    }

    setClientError(null);
  };

  return (
    <form action={action} className="mt-6 grid gap-4" onSubmit={handleSubmit}>
      {clientError ? (
        <div className="rounded-md border border-danger/30 bg-danger-soft p-3 text-sm font-semibold text-danger" role="alert">
          {clientError}
        </div>
      ) : null}
      <div>
        <label className="block" htmlFor="reset-password">
          <span className="text-sm font-bold text-text">New password</span>
        </label>
        <PasswordInput autoComplete="new-password" id="reset-password" name="password" required />
        <p className="mt-2 text-xs font-semibold text-text-muted">Use at least 8 characters.</p>
      </div>
      <label className="block" htmlFor="reset-confirm-password">
        <span className="text-sm font-bold text-text">Confirm password</span>
      </label>
      <PasswordInput autoComplete="new-password" id="reset-confirm-password" name="confirmPassword" required />
      <AuthSubmitButton idleLabel="Update password" pendingLabel="Updating password..." />
    </form>
  );
}
