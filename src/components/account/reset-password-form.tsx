"use client";

import { useRef, useState, type FormEvent } from "react";
import { AuthSubmitButton } from "@/components/account/auth-submit-button";
import { PasswordInput } from "@/components/account/password-input";

type ResetPasswordFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function ResetPasswordForm({ action }: ResetPasswordFormProps) {
  const [clientError, setClientError] = useState<{
    field: "confirmPassword" | "password";
    message: string;
  } | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 8) {
      event.preventDefault();
      setClientError({
        field: "password",
        message: "Use at least 8 characters.",
      });
      window.requestAnimationFrame(() => passwordRef.current?.focus());
      return;
    }

    if (password !== confirmPassword) {
      event.preventDefault();
      setClientError({
        field: "confirmPassword",
        message: "Passwords do not match.",
      });
      window.requestAnimationFrame(() => confirmPasswordRef.current?.focus());
      return;
    }

    setClientError(null);
  };

  return (
    <form
      action={action}
      className="mt-7 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-5"
      noValidate
      onSubmit={handleSubmit}
    >
      {clientError ? (
        <div
          aria-live="assertive"
          className="rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm font-semibold leading-6 text-danger"
          id="reset-password-error"
          role="alert"
        >
          {clientError.message}
        </div>
      ) : null}
      <div className="min-w-0">
        <label className="block" htmlFor="reset-password">
          <span className="text-sm font-bold text-text">New password</span>
        </label>
        <PasswordInput
          ariaDescribedBy={
            clientError?.field === "password"
              ? "reset-password-hint reset-password-error"
              : "reset-password-hint"
          }
          ariaInvalid={clientError?.field === "password"}
          autoComplete="new-password"
          id="reset-password"
          inputRef={passwordRef}
          name="password"
          required
        />
        <p className="mt-2 text-sm leading-5 text-text-muted" id="reset-password-hint">
          Use at least 8 characters and avoid reusing a password from another account.
        </p>
      </div>
      <div className="min-w-0">
        <label className="block" htmlFor="reset-confirm-password">
          <span className="text-sm font-bold text-text">Confirm password</span>
        </label>
        <PasswordInput
          ariaDescribedBy={
            clientError?.field === "confirmPassword"
              ? "reset-password-error"
              : undefined
          }
          ariaInvalid={clientError?.field === "confirmPassword"}
          autoComplete="new-password"
          id="reset-confirm-password"
          inputRef={confirmPasswordRef}
          name="confirmPassword"
          required
        />
      </div>
      <AuthSubmitButton
        idleLabel="Update password"
        pendingLabel="Updating password…"
      />
    </form>
  );
}
