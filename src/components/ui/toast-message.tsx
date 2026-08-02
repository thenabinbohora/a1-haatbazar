"use client";

type ToastMessageProps = {
  message: string | null;
  tone?: "success" | "info" | "warning" | "error";
  elevatedOnMobile?: boolean;
};

const toneClasses = {
  success: "border-fresh bg-fresh-soft text-fresh",
  info: "border-info bg-surface text-info",
  warning: "border-warning bg-cta-soft text-warning",
  error: "border-danger bg-danger-soft text-danger",
};

export function ToastMessage({ elevatedOnMobile = false, message, tone = "success" }: ToastMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`fixed left-4 right-4 z-[var(--z-layer-alert)] mx-auto max-w-md rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg sm:left-auto sm:right-6 ${elevatedOnMobile ? "bottom-[calc(env(safe-area-inset-bottom)+6rem)] lg:bottom-6" : "bottom-4 sm:bottom-6"} ${toneClasses[tone]}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {message}
    </div>
  );
}
