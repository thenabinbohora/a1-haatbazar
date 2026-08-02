"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent } from "react";
import { AuthSubmitButton } from "@/components/account/auth-submit-button";
import { PasswordInput } from "@/components/account/password-input";
import {
  INITIAL_CUSTOMER_AUTH_STATE,
  type CustomerAuthActionState,
} from "@/lib/customer-auth-state";

export type AuthMode = "login" | "register" | "forgot";

export type LoginNotice = {
  tone: "error" | "success";
  text: string;
};

type CustomerAuthAction = (
  previousState: CustomerAuthActionState,
  formData: FormData,
) => Promise<CustomerAuthActionState>;

type CustomerAuthCardProps = {
  initialMode: AuthMode;
  loginAction: CustomerAuthAction;
  next: string;
  notice: LoginNotice | null;
  registerAction: CustomerAuthAction;
  resetAction: CustomerAuthAction;
};

function inputClass(hasError = false) {
  return [
    "mt-2 min-h-[3.125rem] w-full max-w-full min-w-0 rounded-xl border bg-surface px-4 text-base text-text outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-cta/20 motion-reduce:transition-none",
    hasError
      ? "border-danger"
      : "border-border hover:border-primary/55",
  ].join(" ");
}

function noticeClass(tone: LoginNotice["tone"]) {
  return [
    "rounded-xl border px-4 py-3 text-sm font-semibold leading-6",
    tone === "error"
      ? "border-danger/30 bg-danger-soft text-danger"
      : "border-fresh/25 bg-fresh-soft text-primary",
  ].join(" ");
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p className="mt-2 text-sm font-semibold leading-5 text-danger" id={id}>
      <span aria-hidden="true">• </span>
      {message}
    </p>
  ) : null;
}

function ActionMessage({ state }: { state: CustomerAuthActionState }) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  const tone = state.status === "success" ? "success" : "error";

  return (
    <div
      aria-live={tone === "error" ? "assertive" : "polite"}
      className={noticeClass(tone)}
      role={tone === "error" ? "alert" : "status"}
    >
      {state.message}
    </div>
  );
}

function focusAfterFormStateUpdate(
  getTarget: () => HTMLElement | null,
) {
  let finalFrameId: number | null = null;
  const initialFrameId = window.requestAnimationFrame(() => {
    finalFrameId = window.requestAnimationFrame(() => {
      getTarget()?.focus({ preventScroll: true });
    });
  });

  return () => {
    window.cancelAnimationFrame(initialFrameId);

    if (finalFrameId !== null) {
      window.cancelAnimationFrame(finalFrameId);
    }
  };
}

export function CustomerAuthCard({
  initialMode,
  loginAction,
  next,
  notice,
  registerAction,
  resetAction,
}: CustomerAuthCardProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [hiddenServerNoticeKey, setHiddenServerNoticeKey] = useState<string | null>(null);
  const [loginState, loginFormAction] = useActionState(
    loginAction,
    INITIAL_CUSTOMER_AUTH_STATE,
  );
  const [registerState, registerFormAction] = useActionState(
    registerAction,
    INITIAL_CUSTOMER_AUTH_STATE,
  );
  const [resetState, resetFormAction] = useActionState(
    resetAction,
    INITIAL_CUSTOMER_AUTH_STATE,
  );
  const loginTabRef = useRef<HTMLButtonElement | null>(null);
  const registerTabRef = useRef<HTMLButtonElement | null>(null);
  const loginEmailRef = useRef<HTMLInputElement | null>(null);
  const loginPasswordRef = useRef<HTMLInputElement | null>(null);
  const forgotEmailRef = useRef<HTMLInputElement | null>(null);
  const registerNameRef = useRef<HTMLInputElement | null>(null);
  const registerEmailRef = useRef<HTMLInputElement | null>(null);
  const registerPasswordRef = useRef<HTMLInputElement | null>(null);
  const pendingModeFocusRef = useRef<"field" | "tab" | null>(null);
  const isRegisterMode = mode === "register";
  const isForgotMode = mode === "forgot";
  const serverNoticeKey = notice ? `${notice.tone}:${notice.text}` : null;
  const serverNotice =
    notice?.tone === "success" && hiddenServerNoticeKey === serverNoticeKey
      ? null
      : notice;

  useEffect(() => {
    if (notice?.tone !== "success") {
      return;
    }

    const noticeKey = `${notice.tone}:${notice.text}`;
    const timeoutId = window.setTimeout(() => {
      setHiddenServerNoticeKey(noticeKey);
    }, 3000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notice]);

  useEffect(() => {
    if (mode !== "login" || loginState.status !== "error") {
      return;
    }

    return focusAfterFormStateUpdate(() => {
      if (loginState.fieldErrors?.password && !loginState.fieldErrors.email) {
        return loginPasswordRef.current;
      }

      return loginEmailRef.current;
    });
  }, [loginState, mode]);

  useEffect(() => {
    if (mode !== "register" || registerState.status !== "error") {
      return;
    }

    return focusAfterFormStateUpdate(() => {
      if (registerState.fieldErrors?.name) {
        return registerNameRef.current;
      }

      if (registerState.fieldErrors?.email) {
        return registerEmailRef.current;
      }

      if (registerState.fieldErrors?.password) {
        return registerPasswordRef.current;
      }

      return registerNameRef.current;
    });
  }, [mode, registerState]);

  useEffect(() => {
    if (mode !== "forgot" || resetState.status !== "error") {
      return;
    }

    return focusAfterFormStateUpdate(() => forgotEmailRef.current);
  }, [mode, resetState]);

  useEffect(() => {
    const focusTarget = pendingModeFocusRef.current;

    if (!focusTarget) {
      return;
    }

    pendingModeFocusRef.current = null;

    return focusAfterFormStateUpdate(() => {
      if (focusTarget === "field") {
        return mode === "forgot" ? forgotEmailRef.current : null;
      }

      return mode === "register"
        ? registerTabRef.current
        : loginTabRef.current;
    });
  }, [mode]);

  const switchMode = (
    nextMode: AuthMode,
    focusTarget: "field" | "tab" | null = null,
  ) => {
    pendingModeFocusRef.current = focusTarget;
    setMode(nextMode);
  };

  const segmentClass = (isSelected: boolean) =>
    [
      "min-h-12 min-w-0 cursor-pointer rounded-xl px-2 text-sm font-extrabold transition-[background-color,color,box-shadow] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none sm:px-3",
      isSelected
        ? "bg-surface text-primary shadow-sm"
        : "text-text-muted hover:bg-surface/70 hover:text-primary",
    ].join(" ");

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentMode: "login" | "register",
  ) => {
    const nextMode =
      event.key === "ArrowLeft" || event.key === "Home"
        ? "login"
        : event.key === "ArrowRight" || event.key === "End"
          ? "register"
          : null;

    if (!nextMode || nextMode === currentMode) {
      return;
    }

    event.preventDefault();
    switchMode(nextMode);
    (nextMode === "login" ? loginTabRef : registerTabRef).current?.focus();
  };

  const activeTabId = isRegisterMode ? "auth-tab-register" : "auth-tab-login";

  return (
    <section
      aria-labelledby="auth-title"
      className="w-full min-w-0 rounded-3xl border border-border bg-surface p-5 shadow-[0_18px_48px_rgba(18,60,46,0.11)] min-[360px]:p-6 sm:p-8 lg:p-9"
      data-auth-form-card
    >
      {!isForgotMode ? (
        <div
          aria-label="Choose sign in or create account"
          className="mb-7 grid w-full min-w-0 grid-cols-2 gap-1.5 rounded-2xl border border-border bg-surface-muted p-1.5"
          role="tablist"
        >
          <button
            aria-controls="customer-auth-panel"
            aria-selected={!isRegisterMode}
            className={segmentClass(!isRegisterMode)}
            id="auth-tab-login"
            onClick={() => switchMode("login")}
            onKeyDown={(event) => handleTabKeyDown(event, "login")}
            ref={loginTabRef}
            role="tab"
            tabIndex={!isRegisterMode ? 0 : -1}
            type="button"
          >
            Sign in
          </button>
          <button
            aria-controls="customer-auth-panel"
            aria-selected={isRegisterMode}
            className={segmentClass(isRegisterMode)}
            id="auth-tab-register"
            onClick={() => switchMode("register")}
            onKeyDown={(event) => handleTabKeyDown(event, "register")}
            ref={registerTabRef}
            role="tab"
            tabIndex={isRegisterMode ? 0 : -1}
            type="button"
          >
            Create account
          </button>
        </div>
      ) : null}

      <div
        aria-labelledby={isForgotMode ? "auth-title" : activeTabId}
        className="min-w-0"
        id="customer-auth-panel"
        role={isForgotMode ? undefined : "tabpanel"}
      >
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-fresh">
          {isForgotMode
            ? "Password reset"
            : isRegisterMode
              ? "New customer"
              : "Customer login"}
        </p>
        <h1
          className="mt-2 text-2xl font-black leading-tight tracking-tight text-text sm:text-3xl"
          id="auth-title"
        >
          {isForgotMode
            ? "Reset your password"
            : isRegisterMode
              ? "Create your account"
              : "Sign in to your account"}
        </h1>
        <p className="mt-3 max-w-[32rem] text-sm leading-6 text-text-muted">
          {isForgotMode
            ? "Enter your account email and we’ll send password-reset instructions if an account is eligible."
            : isRegisterMode
              ? "Create an account to save addresses, manage your wishlist and check out faster."
              : "View orders, manage addresses and keep your wishlist in one place."}
        </p>

        {serverNotice ? (
          <div
            aria-live={serverNotice.tone === "error" ? "assertive" : "polite"}
            className="mt-5"
          >
            <div
              className={noticeClass(serverNotice.tone)}
              role={serverNotice.tone === "error" ? "alert" : "status"}
            >
              {serverNotice.text}
            </div>
          </div>
        ) : null}

        {isForgotMode ? (
          <form
            action={resetFormAction}
            className="mt-7 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-5"
            noValidate
          >
            <ActionMessage state={resetState} />
            <div className="min-w-0">
              <label className="block text-sm font-bold text-text" htmlFor="forgot-email">
                Email
              </label>
              <input
                aria-describedby={
                  resetState.fieldErrors?.email
                    ? "forgot-email-error"
                    : undefined
                }
                aria-invalid={Boolean(resetState.fieldErrors?.email)}
                autoCapitalize="none"
                autoComplete="email"
                className={inputClass(Boolean(resetState.fieldErrors?.email))}
                defaultValue={resetState.values?.email}
                id="forgot-email"
                inputMode="email"
                name="email"
                ref={forgotEmailRef}
                required
                spellCheck={false}
                type="email"
              />
              <FieldError
                id="forgot-email-error"
                message={resetState.fieldErrors?.email}
              />
            </div>
            <AuthSubmitButton
              idleLabel="Send reset instructions"
              onSettled={() => {
                if (resetState.status === "error") {
                  focusAfterFormStateUpdate(() => forgotEmailRef.current);
                }
              }}
              pendingLabel="Sending instructions…"
            />
          </form>
        ) : isRegisterMode ? (
          <form
            action={registerFormAction}
            className="mt-7 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-5"
            noValidate
          >
            <input name="next" type="hidden" value={next} />
            <ActionMessage state={registerState} />
            <div className="min-w-0">
              <label className="block text-sm font-bold text-text" htmlFor="register-name">
                Full name
              </label>
              <input
                aria-describedby={
                  registerState.fieldErrors?.name
                    ? "register-name-error"
                    : undefined
                }
                aria-invalid={Boolean(registerState.fieldErrors?.name)}
                autoComplete="name"
                className={inputClass(Boolean(registerState.fieldErrors?.name))}
                defaultValue={registerState.values?.name}
                id="register-name"
                name="name"
                ref={registerNameRef}
                required
              />
              <FieldError
                id="register-name-error"
                message={registerState.fieldErrors?.name}
              />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-bold text-text" htmlFor="register-email">
                Email
              </label>
              <input
                aria-describedby={
                  registerState.fieldErrors?.email
                    ? "register-email-error"
                    : undefined
                }
                aria-invalid={Boolean(registerState.fieldErrors?.email)}
                autoCapitalize="none"
                autoComplete="email"
                className={inputClass(Boolean(registerState.fieldErrors?.email))}
                defaultValue={registerState.values?.email}
                id="register-email"
                inputMode="email"
                name="email"
                ref={registerEmailRef}
                required
                spellCheck={false}
                type="email"
              />
              <FieldError
                id="register-email-error"
                message={registerState.fieldErrors?.email}
              />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-bold text-text" htmlFor="register-password">
                Password
              </label>
              <PasswordInput
                ariaDescribedBy={
                  registerState.fieldErrors?.password
                    ? "register-password-hint register-password-error"
                    : "register-password-hint"
                }
                ariaInvalid={Boolean(registerState.fieldErrors?.password)}
                autoComplete="new-password"
                id="register-password"
                inputRef={registerPasswordRef}
                name="password"
                required
              />
              <p className="mt-2 text-sm text-text-muted" id="register-password-hint">
                Use at least 8 characters.
              </p>
              <FieldError
                id="register-password-error"
                message={registerState.fieldErrors?.password}
              />
            </div>
            <p className="text-xs leading-5 text-text-muted">
              By creating an account, you agree to our{" "}
              <Link
                className="font-semibold text-primary underline underline-offset-2"
                href="/terms"
                prefetch={false}
              >
                Terms and Conditions
              </Link>{" "}
              and acknowledge our{" "}
              <Link
                className="font-semibold text-primary underline underline-offset-2"
                href="/privacy"
                prefetch={false}
              >
                Privacy Policy
              </Link>
              .
            </p>
            <AuthSubmitButton
              idleLabel="Create account"
              onSettled={() => {
                if (registerState.status !== "error") {
                  return;
                }

                focusAfterFormStateUpdate(() => {
                  if (registerState.fieldErrors?.name) {
                    return registerNameRef.current;
                  }

                  if (registerState.fieldErrors?.email) {
                    return registerEmailRef.current;
                  }

                  if (registerState.fieldErrors?.password) {
                    return registerPasswordRef.current;
                  }

                  return registerNameRef.current;
                });
              }}
              pendingLabel="Creating account…"
            />
          </form>
        ) : (
          <form
            action={loginFormAction}
            className="mt-7 grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-5"
            noValidate
          >
            <input name="next" type="hidden" value={next} />
            <ActionMessage state={loginState} />
            <div className="min-w-0">
              <label className="block text-sm font-bold text-text" htmlFor="login-email">
                Email
              </label>
              <input
                aria-describedby={
                  loginState.fieldErrors?.email
                    ? "login-email-error"
                    : undefined
                }
                aria-invalid={Boolean(loginState.fieldErrors?.email)}
                autoCapitalize="none"
                autoComplete="email"
                className={inputClass(Boolean(loginState.fieldErrors?.email))}
                defaultValue={loginState.values?.email}
                id="login-email"
                inputMode="email"
                name="email"
                ref={loginEmailRef}
                required
                spellCheck={false}
                type="email"
              />
              <FieldError
                id="login-email-error"
                message={loginState.fieldErrors?.email}
              />
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-bold text-text" htmlFor="login-password">
                Password
              </label>
              <PasswordInput
                ariaDescribedBy={
                  loginState.fieldErrors?.password
                    ? "login-password-error"
                    : undefined
                }
                ariaInvalid={Boolean(loginState.fieldErrors?.password)}
                autoComplete="current-password"
                id="login-password"
                inputRef={loginPasswordRef}
                name="password"
                required
              />
              <FieldError
                id="login-password-error"
                message={loginState.fieldErrors?.password}
              />
              <div className="mt-2 flex justify-end">
                <button
                  className="inline-flex min-h-11 cursor-pointer items-center rounded-lg px-1 text-sm font-semibold text-primary underline-offset-4 transition-colors duration-200 hover:text-primary-muted hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
                  onClick={() => switchMode("forgot", "field")}
                  type="button"
                >
                  Forgot password?
                </button>
              </div>
            </div>
            <AuthSubmitButton
              idleLabel="Sign in"
              onSettled={() => {
                if (loginState.status !== "error") {
                  return;
                }

                focusAfterFormStateUpdate(() =>
                  loginState.fieldErrors?.password
                  && !loginState.fieldErrors.email
                    ? loginPasswordRef.current
                    : loginEmailRef.current,
                );
              }}
              pendingLabel="Signing in…"
            />
          </form>
        )}
      </div>

      <div className="mt-7 flex flex-col items-center border-t border-border pt-5 text-center text-sm text-text-muted sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-4 sm:text-left">
        <div>
          {isForgotMode ? (
            <>
              Remembered your password?{" "}
              <button
                className="inline-flex min-h-11 cursor-pointer items-center rounded-lg px-1 font-semibold text-primary underline-offset-4 transition-colors duration-200 hover:text-primary-muted hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
                onClick={() => switchMode("login", "tab")}
                type="button"
              >
                Back to sign in
              </button>
            </>
          ) : isRegisterMode ? (
            <>
              Already have an account?{" "}
              <button
                className="inline-flex min-h-11 cursor-pointer items-center rounded-lg px-1 font-semibold text-primary underline-offset-4 transition-colors duration-200 hover:text-primary-muted hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
                onClick={() => switchMode("login", "tab")}
                type="button"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New to A1 Haat Bazar?{" "}
              <button
                className="inline-flex min-h-11 cursor-pointer items-center rounded-lg px-1 font-semibold text-primary underline-offset-4 transition-colors duration-200 hover:text-primary-muted hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
                onClick={() => switchMode("register", "tab")}
                type="button"
              >
                Create an account
              </button>
            </>
          )}
        </div>
        <Link
          className="inline-flex min-h-11 items-center rounded-lg px-2 font-semibold text-text-muted underline-offset-4 transition-colors duration-200 hover:text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta motion-reduce:transition-none"
          href="/products"
          prefetch={false}
        >
          Continue shopping
        </Link>
      </div>
    </section>
  );
}
