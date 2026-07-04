"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type FloatingFeedbackToastProps = {
  actionHref?: string;
  actionLabel?: string;
  anchorRect?: DOMRect | null;
  duration?: number;
  message: string;
  onClose: () => void;
  tone?: "success" | "error";
};

function InfoIcon({ tone }: { tone: "success" | "error" }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      {tone === "success" ? (
        <path d="m5 12 4 4 10-9" />
      ) : (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </>
      )}
    </svg>
  );
}

export function FloatingFeedbackToast({
  actionHref,
  actionLabel,
  anchorRect,
  duration = 3000,
  message,
  onClose,
  tone = "success",
}: FloatingFeedbackToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showFrame = window.requestAnimationFrame(() => setIsVisible(true));
    const hideTimer = window.setTimeout(() => setIsVisible(false), Math.max(0, duration - 180));
    const closeTimer = window.setTimeout(onClose, duration);

    return () => {
      window.cancelAnimationFrame(showFrame);
      window.clearTimeout(hideTimer);
      window.clearTimeout(closeTimer);
    };
  }, [duration, onClose, message]);

  const positionStyle = useMemo<CSSProperties>(() => {
    if (!anchorRect || typeof window === "undefined") {
      return {};
    }

    const toastWidth = Math.min(280, window.innerWidth - 24);
    const left = Math.min(Math.max(anchorRect.left + anchorRect.width / 2 - toastWidth / 2, 12), window.innerWidth - toastWidth - 12);
    const preferredTop = anchorRect.bottom + 10;
    const top = preferredTop + 88 < window.innerHeight ? preferredTop : Math.max(12, anchorRect.top - 88);

    return {
      left,
      top,
      width: toastWidth,
    };
  }, [anchorRect]);

  const isAnchored = Boolean(anchorRect);

  return (
    <div
      className={[
        "pointer-events-auto fixed z-[70] rounded-2xl border bg-surface px-3.5 py-3 text-sm shadow-[0_18px_44px_rgba(15,46,26,0.18)] transition-[opacity,transform] duration-200 motion-reduce:transition-none",
        isAnchored ? "" : "inset-x-3 bottom-[calc(var(--a1-bottom-nav-height)+env(safe-area-inset-bottom)+0.875rem)] mx-auto max-w-[22rem]",
        tone === "error" ? "border-cta/35 text-primary" : "border-fresh/25 text-primary",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
      ].join(" ")}
      role="status"
      style={positionStyle}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={[
            "grid h-7 w-7 shrink-0 place-items-center rounded-full",
            tone === "error" ? "bg-cta-soft text-cta-hover" : "bg-fresh-soft text-fresh",
          ].join(" ")}
        >
          <InfoIcon tone={tone} />
        </span>
        <span className="min-w-0 flex-1 font-bold leading-5">{message}</span>
        {actionHref && actionLabel ? (
          <Link
            className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-extrabold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
