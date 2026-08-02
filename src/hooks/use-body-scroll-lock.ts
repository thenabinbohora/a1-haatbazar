"use client";

import { useLayoutEffect, useRef } from "react";

const activeLocks = new Set<symbol>();
type BodyScrollState = {
  left: string;
  overflow: string;
  position: string;
  right: string;
  scrollY: number;
  top: string;
  width: string;
};

let originalBodyState: BodyScrollState | null = null;
let shouldRestoreOriginalScroll = true;
const alwaysRestoreScroll = () => true;

function releaseLock(token: symbol, restoreScroll: boolean) {
  activeLocks.delete(token);
  shouldRestoreOriginalScroll = shouldRestoreOriginalScroll && restoreScroll;

  if (activeLocks.size === 0 && originalBodyState) {
    const state = originalBodyState;
    originalBodyState = null;
    document.body.style.overflow = state.overflow;
    document.body.style.position = state.position;
    document.body.style.top = state.top;
    document.body.style.left = state.left;
    document.body.style.right = state.right;
    document.body.style.width = state.width;
    if (shouldRestoreOriginalScroll) {
      window.scrollTo({ left: 0, top: state.scrollY, behavior: "instant" });
    }

    shouldRestoreOriginalScroll = true;
  }
}

/**
 * Reference-counted body scroll lock for dialogs and drawers.
 *
 * It restores the exact pre-existing inline value and remains safe if nested
 * overlays are introduced later.
 */
export function useBodyScrollLock(
  isLocked: boolean,
  shouldRestoreScroll: () => boolean = alwaysRestoreScroll,
) {
  const tokenRef = useRef(Symbol("body-scroll-lock"));

  useLayoutEffect(() => {
    if (!isLocked) {
      return;
    }

    const token = tokenRef.current;

    if (activeLocks.size === 0) {
      shouldRestoreOriginalScroll = true;
      originalBodyState = {
        left: document.body.style.left,
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        right: document.body.style.right,
        scrollY: window.scrollY,
        top: document.body.style.top,
        width: document.body.style.width,
      };
    }

    activeLocks.add(token);
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${originalBodyState?.scrollY ?? 0}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";

    return () => releaseLock(token, shouldRestoreScroll());
  }, [isLocked, shouldRestoreScroll]);
}
