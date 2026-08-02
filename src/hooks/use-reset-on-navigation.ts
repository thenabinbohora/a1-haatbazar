"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Resets transient UI after a committed pathname or query change.
 *
 * Hash-only navigation is intentionally excluded so native anchor scrolling
 * remains undisturbed.
 */
export function useResetOnNavigation(reset: () => void) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigationKey = `${pathname}?${searchParams.toString()}`;
  const previousNavigationRef = useRef(navigationKey);
  const resetRef = useRef(reset);

  useLayoutEffect(() => {
    resetRef.current = reset;
  }, [reset]);

  useLayoutEffect(() => {
    if (previousNavigationRef.current === navigationKey) {
      return;
    }

    previousNavigationRef.current = navigationKey;
    resetRef.current();
  }, [navigationKey]);
}
