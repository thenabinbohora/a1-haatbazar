"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type AccountActionMessageProps = {
  error?: string;
  success?: string;
  messages?: {
    errors?: Record<string, string>;
    successes?: Record<string, string>;
  };
};

const defaultErrors: Record<string, string> = {
  failed: "We could not complete that change. Please try again.",
  validation: "Check the highlighted details and try again.",
};

const defaultSuccesses: Record<string, string> = {
  created: "Saved successfully.",
  deleted: "Removed successfully.",
  updated: "Your changes have been saved.",
};

export function AccountActionMessage({
  error,
  messages,
  success,
}: AccountActionMessageProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = error
    ? messages?.errors?.[error] ?? defaultErrors[error] ?? defaultErrors.failed
    : null;
  const successMessage = success
    ? messages?.successes?.[success] ??
      defaultSuccesses[success] ??
      "Saved successfully."
    : null;

  useEffect(() => {
    if (!errorMessage && !successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("error");
      nextParams.delete("success");
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [errorMessage, pathname, router, searchParams, successMessage]);

  if (!errorMessage && !successMessage) {
    return null;
  }

  return (
    <div
      aria-live={errorMessage ? "assertive" : "polite"}
      className={[
        "mb-5 rounded-xl border px-4 py-3 text-sm font-semibold leading-6",
        errorMessage
          ? "border-danger/30 bg-danger-soft text-danger"
          : "border-fresh/25 bg-fresh-soft text-fresh",
      ].join(" ")}
      role={errorMessage ? "alert" : "status"}
    >
      {errorMessage ?? successMessage}
    </div>
  );
}
