"use client";

type ToastMessageProps = {
  message: string | null;
  tone?: "success" | "info" | "warning" | "error";
};

const toneClasses = {
  success: "border-fresh bg-fresh-soft text-fresh",
  info: "border-info bg-surface text-info",
  warning: "border-warning bg-cta-soft text-warning",
  error: "border-danger bg-danger-soft text-danger",
};

export function ToastMessage({ message, tone = "success" }: ToastMessageProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border px-4 py-3 text-sm font-semibold shadow-lg sm:left-auto sm:right-6 ${toneClasses[tone]}`}
      role={tone === "error" ? "alert" : "status"}
    >
      {message}
    </div>
  );
}
