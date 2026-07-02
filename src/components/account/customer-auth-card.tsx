"use client";

import { useEffect, useRef, useState } from "react";
import { AuthSubmitButton } from "@/components/account/auth-submit-button";
import { PasswordInput } from "@/components/account/password-input";

export type AuthMode = "login" | "register";

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
    "mt-5 rounded-md border font-semibold",
    tone === "error"
      ? "border-danger/30 bg-danger-soft p-3 text-sm text-danger"
      : "border-fresh/20 bg-fresh-soft/65 px-3 py-2 text-xs text-primary/80",
  ].join(" ");
}

export function CustomerAuthCard({ initialMode, loginAction, next, notice, registerAction }: CustomerAuthCardProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const loginEmailRef = useRef<HTMLInputElement | null>(null);
  const registerNameRef = useRef<HTMLInputElement | null>(null);
  const hasMountedRef = useRef(false);
  const isRegisterMode = mode === "register";

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    window.requestAnimationFrame(() => {
      if (isRegisterMode) {
        registerNameRef.current?.focus();
      } else {
        loginEmailRef.current?.focus();
      }
    });
  }, [isRegisterMode]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-6 shadow-[0_16px_42px_rgba(17,17,17,0.07)] sm:p-8">
      <div className="a1-auth-mode-panel" key={mode}>
        <p className="text-sm font-bold uppercase tracking-[0.06em] text-fresh">
          {isRegisterMode ? "New customer" : "Customer login"}
        </p>
        <h2 className="mt-2 text-3xl font-black tracking-tight text-text">
          {isRegisterMode ? "Create your account" : "Sign in to your account"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          {isRegisterMode
            ? "Save addresses, manage wishlist items, and checkout faster."
            : "View orders, manage addresses, and save wishlist items."}
        </p>

        {notice ? (
          <div className={noticeClass(notice.tone)} role={notice.tone === "error" ? "alert" : "status"}>
            {notice.text}
          </div>
        ) : null}

        {isRegisterMode ? (
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
            <div className="rounded-md border border-fresh/20 bg-fresh-soft/70 p-3 text-xs leading-5 text-text-muted">
              <p className="font-black text-primary">Private account details</p>
              <p>Your details are used only for orders and account features.</p>
            </div>
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
              <span className="font-medium text-text-muted">
                Forgot password? <span className="text-text-muted/80">Coming soon</span>
              </span>
            </div>
            <AuthSubmitButton idleLabel="Sign in" pendingLabel="Signing in..." />
            <div className="rounded-md border border-fresh/20 bg-fresh-soft/70 p-3 text-xs leading-5 text-text-muted">
              <p className="font-black text-primary">Secure customer login</p>
              <p>Your details are used only for orders and account features.</p>
            </div>
          </form>
        )}
      </div>

      <div className="mt-6 border-t border-border pt-5 text-center text-sm text-text-muted">
        {isRegisterMode ? "Already have an account?" : "New to A1 Haat Bazar?"}{" "}
        <button
          className="cursor-pointer font-bold text-primary underline-offset-4 transition-colors hover:text-primary-muted hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cta"
          onClick={() => switchMode(isRegisterMode ? "login" : "register")}
          type="button"
        >
          {isRegisterMode ? "Sign in" : "Create account"}
        </button>
      </div>
    </div>
  );
}
