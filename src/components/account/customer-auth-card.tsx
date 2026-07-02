"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { AuthSubmitButton } from "@/components/account/auth-submit-button";
import { PasswordInput } from "@/components/account/password-input";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export type AuthMode = "login" | "register" | "forgot";

export type LoginNotice = {
  tone: "error" | "success";
  text: string;
};

type CustomerAuthCardProps = {
  initialMode: AuthMode;
  loginAction: (formData: FormData) => void | Promise<void>;
  next: string;
  notice: LoginNotice | null;
  registerAction: (formData: FormData) => void | Promise<void>;
};

function inputClass() {
  return "-mt-2 min-h-12 w-full rounded-md border border-border bg-surface px-4 text-text outline-none transition-colors focus:border-cta focus:ring-2 focus:ring-cta/20";
}

function noticeClass(tone: LoginNotice["tone"]) {
  return [
    "rounded-md border font-semibold",
    tone === "error"
      ? "border-danger/30 bg-danger-soft p-3 text-sm text-danger"
      : "border-fresh/20 bg-fresh-soft/65 px-3 py-2 text-xs text-primary/80",
  ].join(" ");
}

export function CustomerAuthCard({ initialMode, loginAction, next, notice, registerAction }: CustomerAuthCardProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [hiddenServerNoticeKey, setHiddenServerNoticeKey] = useState<string | null>(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNotice, setForgotNotice] = useState<LoginNotice | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const loginEmailRef = useRef<HTMLInputElement | null>(null);
  const forgotEmailRef = useRef<HTMLInputElement | null>(null);
  const registerNameRef = useRef<HTMLInputElement | null>(null);
  const hasMountedRef = useRef(false);
  const isRegisterMode = mode === "register";
  const isForgotMode = mode === "forgot";
  const serverNoticeKey = notice ? `${notice.tone}:${notice.text}` : null;
  const serverNotice = notice?.tone === "success" && hiddenServerNoticeKey === serverNoticeKey ? null : notice;
  const displayNotice = forgotNotice ?? serverNotice;

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
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    window.requestAnimationFrame(() => {
      if (mode === "register") {
        registerNameRef.current?.focus();
      } else if (mode === "forgot") {
        forgotEmailRef.current?.focus();
      } else {
        loginEmailRef.current?.focus();
      }
    });
  }, [mode]);

  const switchMode = (nextMode: AuthMode) => {
    setForgotNotice(null);
    setMode(nextMode);
  };

  const handleForgotSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = forgotEmail.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setForgotNotice({ tone: "error", text: "Enter a valid email address." });
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setForgotNotice({ tone: "error", text: "Password reset is not configured yet. Please contact the store team." });
      return;
    }

    setIsSendingReset(true);
    setForgotNotice(null);

    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    setIsSendingReset(false);

    if (error) {
      setForgotNotice({ tone: "error", text: "We could not send a reset link right now. Please try again shortly." });
      return;
    }

    setForgotNotice({ tone: "success", text: "If an account exists for this email, a reset link has been sent." });
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-6 shadow-[0_16px_42px_rgba(17,17,17,0.07)] sm:p-8">
      <div className="a1-auth-mode-panel flex flex-1 flex-col" key={mode}>
        <p className="text-sm font-bold uppercase tracking-[0.06em] text-fresh">
          {isForgotMode ? "Password reset" : isRegisterMode ? "New customer" : "Customer login"}
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-text">
          {isForgotMode ? "Reset your password" : isRegisterMode ? "Create your account" : "Sign in to your account"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          {isForgotMode
            ? "Enter your account email and we'll send you a secure password reset link."
            : isRegisterMode
              ? "Save addresses, manage wishlist items, and checkout faster."
              : "View orders, manage addresses, and save wishlist items."}
        </p>

        <div className="mt-5 min-h-10" aria-live={displayNotice?.tone === "error" ? "assertive" : "polite"}>
          {displayNotice ? (
            <div className={noticeClass(displayNotice.tone)} role={displayNotice.tone === "error" ? "alert" : "status"}>
              {displayNotice.text}
            </div>
          ) : null}
        </div>

        {isForgotMode ? (
          <form className="mt-6 grid gap-4" onSubmit={handleForgotSubmit}>
            <label className="block" htmlFor="forgot-email">
              <span className="text-sm font-bold text-text">Email</span>
            </label>
            <input
              autoComplete="email"
              className={inputClass()}
              id="forgot-email"
              name="email"
              onChange={(event) => setForgotEmail(event.target.value)}
              ref={forgotEmailRef}
              required
              type="email"
              value={forgotEmail}
            />
            <button
              className="min-h-12 cursor-pointer rounded-md bg-primary px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-75"
              disabled={isSendingReset}
              type="submit"
            >
              {isSendingReset ? "Sending reset link..." : "Send reset link"}
            </button>
          </form>
        ) : isRegisterMode ? (
          <form action={registerAction} className="mt-6 grid gap-4">
            <input name="next" type="hidden" value={next} />
            <label className="block" htmlFor="register-name">
              <span className="text-sm font-bold text-text">Full name</span>
            </label>
            <input
              autoComplete="name"
              className={inputClass()}
              id="register-name"
              name="name"
              ref={registerNameRef}
              required
            />
            <label className="block" htmlFor="register-email">
              <span className="text-sm font-bold text-text">Email</span>
            </label>
            <input
              autoComplete="email"
              className={inputClass()}
              id="register-email"
              name="email"
              required
              type="email"
            />
            <label className="block" htmlFor="register-phone">
              <span className="text-sm font-bold text-text">Phone</span>
              <span className="ml-2 text-xs font-semibold text-text-muted">Optional</span>
            </label>
            <input
              autoComplete="tel"
              className={inputClass()}
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
        ) : (
          <form action={loginAction} className="mt-6 grid gap-4">
            <input name="next" type="hidden" value={next} />
            <label className="block" htmlFor="login-email">
              <span className="text-sm font-bold text-text">Email</span>
            </label>
            <input
              autoComplete="email"
              className={inputClass()}
              id="login-email"
              name="email"
              ref={loginEmailRef}
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
              <button
                className="w-fit cursor-pointer font-medium text-text-muted underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta"
                onClick={() => switchMode("forgot")}
                type="button"
              >
                Forgot password?
              </button>
            </div>
            <AuthSubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
          </form>
        )}
      </div>

      <div className="mt-6 border-t border-border pt-5 text-center text-sm text-text-muted">
        {isForgotMode ? "Remembered your password?" : isRegisterMode ? "Already have an account?" : "New to A1 Haat Bazar?"}{" "}
        <button
          className="cursor-pointer font-semibold text-primary underline-offset-4 transition-colors hover:text-primary-muted hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta"
          onClick={() => switchMode(isForgotMode || isRegisterMode ? "login" : "register")}
          type="button"
        >
          {isForgotMode || isRegisterMode ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  );
}
