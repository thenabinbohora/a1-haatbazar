"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { ProductFilterPanel } from "@/components/product/product-filter-panel";
import { useDismissibleLayer } from "@/components/ui/overlay-provider";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useModalIsolation } from "@/hooks/use-modal-isolation";
import { useResetOnNavigation } from "@/hooks/use-reset-on-navigation";
import {
  clearProductFilters,
  countActiveProductFilters,
  type ProductFilterContext,
  type StorefrontSearchParams,
} from "@/lib/product-filter-state";
import type { StorefrontFilters } from "@/lib/storefront";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type MobileFilterDrawerProps = {
  context: ProductFilterContext;
  disabled?: boolean;
  filters: StorefrontFilters;
  onApply: (values: StorefrontSearchParams) => void;
  values: StorefrontSearchParams;
};

function FilterIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2.2"
      viewBox="0 0 24 24"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function MobileFilterDrawer({
  context,
  disabled = false,
  filters,
  onApply,
  values,
}: MobileFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(values);
  const [isPriceValid, setIsPriceValid] = useState(true);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef(true);
  const restoreScrollRef = useRef(true);
  const shouldRestoreScroll = useCallback(() => restoreScrollRef.current, []);
  const id = useId();
  const dialogId = `${id}-dialog`;
  const dialogTitleId = `${id}-title`;
  const activeCount = countActiveProductFilters(values, context);

  const dismiss = useDismissibleLayer({
    contentRef: dialogRef,
    kind: "drawer",
    onDismiss: (reason) => {
      if (reason !== "action") {
        restoreScrollRef.current = ![
          "navigation",
          "session-change",
        ].includes(reason);
      }
      restoreFocusRef.current = ![
        "another-layer",
        "navigation",
        "session-change",
      ].includes(reason);
      setDraft(values);
      setIsOpen(false);
    },
    open: isOpen,
    restoreFocusOnDismiss: false,
    triggerRef,
  });

  useBodyScrollLock(isOpen, shouldRestoreScroll);
  useModalIsolation(isOpen, dialogRef);
  useResetOnNavigation(() => {
    if (isOpen) {
      restoreFocusRef.current = true;
      restoreScrollRef.current = false;
      setIsOpen(false);
    }
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const closeAtDesktop = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        dismiss("resize");
      }
    };

    closeAtDesktop(desktopQuery);
    desktopQuery.addEventListener("change", closeAtDesktop);
    return () => desktopQuery.removeEventListener("change", closeAtDesktop);
  }, [dismiss, isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    restoreFocusRef.current = true;
    const triggerElement = triggerRef.current;
    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (element) =>
          element.getClientRects().length > 0 &&
          element.getAttribute("aria-hidden") !== "true",
      );

      if (!focusableElements.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === firstElement || !dialogRef.current.contains(activeElement))
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);

      if (restoreFocusRef.current && triggerElement?.isConnected) {
        window.requestAnimationFrame(() => triggerElement.focus());
      }
    };
  }, [isOpen]);

  function openDrawer() {
    setDraft(values);
    setIsPriceValid(true);
    restoreScrollRef.current = true;
    setIsOpen(true);
  }

  function closeDrawer() {
    restoreScrollRef.current = true;
    dismiss("action");
  }

  const drawer =
    isOpen
      ? createPortal(
          <div className="fixed inset-0 z-[var(--z-layer-drawer)] h-[100dvh] lg:hidden">
            <button
              aria-hidden="true"
              aria-label="Close filters"
              className="a1-drawer-backdrop absolute inset-0 h-full w-full cursor-pointer bg-primary-muted/55"
              onClick={() => dismiss("outside-pointer")}
              tabIndex={-1}
              type="button"
            />
            <div
              aria-labelledby={dialogTitleId}
              aria-modal="true"
              className="a1-filter-sheet absolute inset-x-0 bottom-0 flex max-h-[min(88dvh,760px)] w-full max-w-full min-w-0 flex-col rounded-t-[1.5rem] border-t border-border bg-background shadow-[0_-24px_60px_rgba(15,46,26,0.2)] outline-none"
              id={dialogId}
              ref={dialogRef}
              role="dialog"
              tabIndex={-1}
            >
              <div className="flex min-w-0 items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 sm:px-6">
                <div className="min-w-0">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-fresh">
                    Refine your shop
                  </p>
                  <h2
                    className="mt-0.5 text-xl font-extrabold text-primary"
                    id={dialogTitleId}
                  >
                    Filters
                  </h2>
                </div>
                <button
                  aria-label="Close filters"
                  className="grid h-12 w-12 shrink-0 cursor-pointer place-items-center rounded-full border border-border bg-surface text-text-muted transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  onClick={closeDrawer}
                  ref={closeButtonRef}
                  type="button"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="polished-scrollbar min-h-0 w-full max-w-full min-w-0 flex-1 overscroll-contain overflow-y-auto px-4 sm:px-6">
                <ProductFilterPanel
                  context={context}
                  filters={filters}
                  mode="mobile"
                  onChange={setDraft}
                  onPriceValidityChange={setIsPriceValid}
                  values={draft}
                />
              </div>

              <div className="grid w-full max-w-full min-w-0 grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-2.5 border-t border-border bg-surface px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 sm:px-6">
                <button
                  className="inline-flex min-h-12 min-w-0 cursor-pointer items-center justify-center rounded-xl border border-primary/20 bg-surface px-3 text-sm font-extrabold text-primary transition-colors hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta disabled:cursor-wait disabled:opacity-60"
                  disabled={disabled}
                  onClick={() => setDraft(clearProductFilters(draft))}
                  type="button"
                >
                  Clear all
                </button>
                <button
                  className="a1-primary-button min-h-12 min-w-0 cursor-pointer !rounded-xl px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta"
                  disabled={disabled || !isPriceValid}
                  onClick={() => {
                    restoreFocusRef.current = true;
                    restoreScrollRef.current = true;
                    flushSync(() => dismiss("action"));
                    onApply(draft);
                  }}
                  type="button"
                >
                  {disabled ? "Updating…" : "Apply filters"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        aria-controls={dialogId}
        aria-disabled={disabled}
        aria-expanded={isOpen}
        className="flex min-h-11 w-full max-w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 text-sm shadow-[0_1px_2px_rgba(24,38,27,0.05)] transition-colors duration-200 hover:border-primary/30 hover:bg-fresh-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cta aria-disabled:cursor-wait aria-disabled:opacity-60 max-[360px]:gap-1.5 max-[360px]:px-2"
        data-product-filter-trigger
        onClick={() => {
          if (!disabled) {
            openDrawer();
          }
        }}
        ref={triggerRef}
        type="button"
      >
        <span className="flex min-w-0 items-center gap-2 font-extrabold text-text max-[360px]:gap-1.5">
          <FilterIcon />
          <span className="min-w-0 truncate">
            <span className="max-[360px]:hidden">Filters</span>
            <span className="hidden max-[360px]:inline">Filter</span>
          </span>
        </span>
        {activeCount ? (
          <span
            aria-label={`${activeCount} active ${activeCount === 1 ? "filter" : "filters"}`}
            className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-cta-soft px-1.5 text-xs font-extrabold text-cta-hover max-[360px]:h-5 max-[360px]:min-w-5 max-[360px]:px-1 max-[360px]:text-[0.68rem]"
          >
            {activeCount}
          </span>
        ) : null}
      </button>
      {drawer}
    </>
  );
}
