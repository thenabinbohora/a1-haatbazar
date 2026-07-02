"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type AdminActionMessageProps = {
  error?: string;
  success?: string;
  messages?: {
    errors?: Record<string, string>;
    successes?: Record<string, string>;
  };
};

const defaultErrorMessages: Record<string, string> = {
  validation: "Check the submitted fields and try again.",
  unique: "A record with that unique value already exists.",
  linked: "This record is linked to other data and cannot be deleted.",
  failed: "The action could not be completed.",
};

const defaultSuccessMessages: Record<string, string> = {
  created: "Created successfully.",
  updated: "Updated successfully.",
  deleted: "Deleted successfully.",
};

export function AdminActionMessage({ error, success, messages }: AdminActionMessageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const errorMessage = error
    ? messages?.errors?.[error] ?? defaultErrorMessages[error] ?? defaultErrorMessages.failed
    : null;
  const successMessage = success
    ? messages?.successes?.[success] ?? defaultSuccessMessages[success] ?? "Saved successfully."
    : null;

  useEffect(() => {
    if (!errorMessage && !successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("error");
      nextParams.delete("success");
      const nextQuery = nextParams.toString();

      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [errorMessage, pathname, router, searchParams, successMessage]);

  if (!errorMessage && !successMessage) {
    return null;
  }

  return (
    <div
      className={[
        "mb-5 rounded-lg border p-4 text-sm font-semibold",
        errorMessage
          ? "border-danger bg-danger-soft text-danger"
          : "border-fresh bg-fresh-soft text-fresh",
      ].join(" ")}
      role={errorMessage ? "alert" : "status"}
    >
      {errorMessage ?? successMessage}
    </div>
  );
}
