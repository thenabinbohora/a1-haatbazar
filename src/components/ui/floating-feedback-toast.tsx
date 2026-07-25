"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { CSSProperties } from "react";

type FloatingFeedbackToastProps = {
  actionHref?: string;
  actionLabel?: string;
  anchorRect?: DOMRect | null;
  duration?: number;
  message: string;
  onClose: () => void;
  placement?: "anchor" | "top";
  tone?: "success" | "info" | "error";
};

const VIEWPORT_PADDING = 14;
const ANCHOR_GAP = 8;
const TOAST_MAX_WIDTH = 220;
const FALLBACK_HEIGHT = 76;
const MOBILE_BOTTOM_GUARD = 88;

function InfoIcon({ tone }: { tone: "success" | "info" | "error" }) {
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
      ) : tone === "info" ? (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 11v5" />
          <path d="M12 8h.01" />
        </>
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
  placement = "anchor",
  tone = "success",
}: FloatingFeedbackToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [positionStyle, setPositionStyle] = useState<CSSProperties>({});
  const toastRef = useRef<HTMLDivElement | null>(null);
  const effectiveDuration = actionHref && actionLabel ? Math.max(duration, 5000) : duration;

  useEffect(() => {
    const showFrame = window.requestAnimationFrame(() => setIsVisible(true));
    const hideTimer = window.setTimeout(() => setIsVisible(false), Math.max(0, effectiveDuration - 180));
    const closeTimer = window.setTimeout(onClose, effectiveDuration);

    return () => {
      window.cancelAnimationFrame(showFrame);
      window.clearTimeout(hideTimer);
      window.clearTimeout(closeTimer);
    };
  }, [effectiveDuration, onClose, message]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function clamp(value: number, min: number, max: number) {
      return Math.min(Math.max(value, min), max);
    }

    function getSafeBottom() {
      return window.innerWidth < 1280 ? MOBILE_BOTTOM_GUARD : VIEWPORT_PADDING;
    }

    function getFallbackPosition(width: number): CSSProperties {
      return {
        left: clamp((window.innerWidth - width) / 2, VIEWPORT_PADDING, window.innerWidth - width - VIEWPORT_PADDING),
        top: VIEWPORT_PADDING,
        width,
      };
    }

    function updatePosition() {
      const toast = toastRef.current;
      const width = Math.min(placement === "top" ? 400 : TOAST_MAX_WIDTH, window.innerWidth - VIEWPORT_PADDING * 2);
      const height = toast?.offsetHeight ?? FALLBACK_HEIGHT;
      const maxTop = window.innerHeight - getSafeBottom() - height;

      if (placement === "top") {
        setPositionStyle({
          left: clamp((window.innerWidth - width) / 2, VIEWPORT_PADDING, window.innerWidth - width - VIEWPORT_PADDING),
          top: "calc(env(safe-area-inset-top) + 88px)",
          width,
        });
        return;
      }

      if (!anchorRect || maxTop < VIEWPORT_PADDING) {
        setPositionStyle(getFallbackPosition(width));
        return;
      }

      const anchorCenterX = anchorRect.left + anchorRect.width / 2;
      const anchorCenterY = anchorRect.top + anchorRect.height / 2;
      const preferredSide = anchorCenterX < window.innerWidth / 2 ? "right" : "left";
      const rightLeft = anchorRect.right + ANCHOR_GAP;
      const leftLeft = anchorRect.left - width - ANCHOR_GAP;
      const rightFits = rightLeft + width <= window.innerWidth - VIEWPORT_PADDING;
      const leftFits = leftLeft >= VIEWPORT_PADDING;
      const sideTop = clamp(anchorCenterY - height / 2, VIEWPORT_PADDING, maxTop);

      if (preferredSide === "right" && rightFits) {
        setPositionStyle({ left: rightLeft, top: sideTop, width });
        return;
      }

      if (preferredSide === "left" && leftFits) {
        setPositionStyle({ left: leftLeft, top: sideTop, width });
        return;
      }

      if (rightFits) {
        setPositionStyle({ left: rightLeft, top: sideTop, width });
        return;
      }

      if (leftFits) {
        setPositionStyle({ left: leftLeft, top: sideTop, width });
        return;
      }

      const centeredLeft = clamp(anchorCenterX - width / 2, VIEWPORT_PADDING, window.innerWidth - width - VIEWPORT_PADDING);
      const belowTop = anchorRect.bottom + ANCHOR_GAP;
      const aboveTop = anchorRect.top - height - ANCHOR_GAP;

      if (belowTop <= maxTop) {
        setPositionStyle({ left: centeredLeft, top: belowTop, width });
        return;
      }

      if (aboveTop >= VIEWPORT_PADDING) {
        setPositionStyle({ left: centeredLeft, top: aboveTop, width });
        return;
      }

      setPositionStyle(getFallbackPosition(width));
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorRect, message, placement]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={[
        "pointer-events-auto fixed z-[90] rounded-xl border bg-[#fffef8] px-3 py-2.5 text-sm shadow-[0_18px_44px_rgba(15,46,26,0.18)] transition-[opacity,transform] duration-200 motion-reduce:transition-none",
        tone === "success" ? "border-fresh/30 text-primary" : "border-cta/35 text-primary",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
      ].join(" ")}
      ref={toastRef}
      role="status"
      style={positionStyle}
    >
      <div className="flex items-center gap-2">
        <span
          className={[
            "grid h-6 w-6 shrink-0 place-items-center rounded-full",
            tone === "success" ? "bg-fresh-soft text-fresh" : "bg-cta-soft text-cta-hover",
          ].join(" ")}
        >
          <InfoIcon tone={tone} />
        </span>
        <span className="min-w-0 flex-1 text-xs font-extrabold leading-5 text-primary sm:text-sm">{message}</span>
        {actionHref && actionLabel ? (
          <Link
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full bg-primary px-2.5 py-1.5 text-xs font-extrabold text-white transition-colors hover:bg-primary-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
            href={actionHref}
          >
            {actionLabel}
          </Link>
        ) : null}
        <button
          aria-label="Dismiss notification"
          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full text-primary-muted transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
          onClick={onClose}
          type="button"
        >
          <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24">
            <path d="m7 7 10 10M17 7 7 17" />
          </svg>
        </button>
      </div>
    </div>,
    document.body,
  );
}
