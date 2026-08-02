"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { loginAdminAction } from "@/app/admin/login/actions";
import { PasswordInput } from "@/components/account/password-input";
import { INITIAL_ADMIN_AUTH_STATE } from "@/lib/admin-auth-state";

type AdminLoginFormProps = {
  next: string;
  notice?: string;
};

function AlertIcon() {
  return (
    <svg
      aria-hidden="true"
      className="mt-0.5 h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5m0 3h.01" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
    >
      <rect height="10" rx="2" width="14" x="5" y="10" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      aria-disabled={pending}
      aria-live="polite"
      className="mt-1 flex min-h-[3.125rem] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#123c2e] bg-[#123c2e] px-5 text-base font-extrabold text-white shadow-[0_8px_20px_rgba(18,60,46,0.16)] transition-[background-color,box-shadow] duration-200 hover:bg-[#0b2b20] hover:shadow-[0_10px_24px_rgba(18,60,46,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c38a25] disabled:cursor-wait disabled:opacity-80 motion-reduce:transition-none"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <svg
          aria-hidden="true"
          className="h-4 w-4 animate-spin motion-reduce:animate-none"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-30"
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="3"
          />
        </svg>
      ) : (
        <LockIcon />
      )}
      {pending ? "Signing in\u2026" : "Sign in securely"}
    </button>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p className="mt-2 text-sm font-semibold leading-5 text-[#a3261e]" id={id}>
      {message}
    </p>
  ) : null;
}

function focusAfterUpdate(target: HTMLElement | null) {
  let finalFrameId: number | null = null;
  const initialFrameId = window.requestAnimationFrame(() => {
    finalFrameId = window.requestAnimationFrame(() => {
      target?.focus({ preventScroll: true });
    });
  });

  return () => {
    window.cancelAnimationFrame(initialFrameId);

    if (finalFrameId !== null) {
      window.cancelAnimationFrame(finalFrameId);
    }
  };
}

export function AdminLoginForm({ next, notice }: AdminLoginFormProps) {
  const [state, formAction] = useActionState(
    loginAdminAction,
    INITIAL_ADMIN_AUTH_STATE,
  );
  const [dismissedAttempt, setDismissedAttempt] = useState<number | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const visibleActionMessage =
    state.status === "error"
    && state.message
    && dismissedAttempt !== state.attempt
      ? state.message
      : null;

  useEffect(() => {
    if (state.status !== "error") {
      return;
    }

    return focusAfterUpdate(
      state.fieldErrors?.password && !state.fieldErrors.email
        ? passwordRef.current
        : emailRef.current,
    );
  }, [state]);

  const dismissActionMessage = () => {
    if (state.status === "error") {
      setDismissedAttempt(state.attempt);
    }
  };

  return (
    <section
      aria-labelledby="admin-login-title"
      className="w-full min-w-0 rounded-[1.5rem] border border-[#dfe3dc] bg-white p-5 shadow-[0_20px_55px_rgba(18,60,46,0.12)] min-[360px]:p-6 sm:p-8 lg:p-9"
      data-admin-login-card
    >
      <div className="flex items-center gap-2 text-[#2f6d4a]">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#edf5ef]">
          <LockIcon />
        </span>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em]">
          Secure admin workspace
        </p>
      </div>
      <h1
        className="mt-4 text-[1.75rem] font-black leading-tight tracking-[-0.025em] text-[#172019] sm:text-[2rem]"
        id="admin-login-title"
      >
        Admin sign in
      </h1>
      <p className="mt-2 max-w-[34rem] text-sm leading-6 text-[#59645d] sm:text-[15px]">
        Use your authorised administrator account to access store operations.
      </p>

      {notice ? (
        <div
          className="mt-5 flex gap-3 rounded-xl border border-[#d8b96f] bg-[#fff8e6] px-4 py-3 text-sm font-semibold leading-6 text-[#694b0c]"
          role="status"
        >
          <AlertIcon />
          <span>{notice}</span>
        </div>
      ) : null}

      {visibleActionMessage ? (
        <div
          aria-live="assertive"
          className="mt-5 flex gap-3 rounded-xl border border-[#e0a19d] bg-[#fcedeb] px-4 py-3 text-sm font-semibold leading-6 text-[#94261f]"
          role="alert"
        >
          <AlertIcon />
          <span>{visibleActionMessage}</span>
        </div>
      ) : null}

      <form
        action={formAction}
        className="mt-6 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-5"
        data-admin-login-form
        noValidate
      >
        <input name="next" type="hidden" value={next} />
        <div className="min-w-0">
          <label
            className="block text-sm font-bold text-[#202a23]"
            htmlFor="admin-email"
          >
            Email
          </label>
          <input
            aria-describedby={
              state.fieldErrors?.email ? "admin-email-error" : undefined
            }
            aria-invalid={Boolean(state.fieldErrors?.email)}
            autoCapitalize="none"
            autoComplete="username"
            className={[
              "mt-2 min-h-[3.125rem] w-full min-w-0 rounded-xl border bg-[#fffefa] px-4 text-base text-[#172019] outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-[#7a857e] focus:border-[#2f6d4a] focus:bg-white focus:ring-2 focus:ring-[#c38a25]/25 motion-reduce:transition-none",
              state.fieldErrors?.email
                ? "border-[#b42318]"
                : "border-[#9ba49e] hover:border-[#597164]",
            ].join(" ")}
            defaultValue={state.values?.email}
            id="admin-email"
            inputMode="email"
            name="email"
            onInput={dismissActionMessage}
            placeholder="name@a1haatbazar.com.au"
            ref={emailRef}
            required
            spellCheck={false}
            type="email"
          />
          <FieldError
            id="admin-email-error"
            message={state.fieldErrors?.email}
          />
        </div>

        <div className="min-w-0">
          <label
            className="block text-sm font-bold text-[#202a23]"
            htmlFor="admin-password"
          >
            Password
          </label>
          <div onInput={dismissActionMessage}>
            <PasswordInput
              ariaDescribedBy={
                state.fieldErrors?.password
                  ? "admin-password-error"
                  : undefined
              }
              ariaInvalid={Boolean(state.fieldErrors?.password)}
              autoComplete="current-password"
              id="admin-password"
              inputRef={passwordRef}
              name="password"
              required
            />
          </div>
          <FieldError
            id="admin-password-error"
            message={state.fieldErrors?.password}
          />
        </div>

        <SubmitButton />
      </form>

      <div className="mt-6 flex gap-3 border-t border-[#e5e8e3] pt-5 text-sm leading-6 text-[#59645d]">
        <span className="mt-1 text-[#2f6d4a]">
          <LockIcon />
        </span>
        <p>
          Access is restricted to authorised A1 Haat Bazar administrators.
          Do not sign in on a shared device.
        </p>
      </div>
    </section>
  );
}
