"use client";

import { useLayoutEffect, type RefObject } from "react";

type IsolationState = {
  ariaHidden: string | null;
  count: number;
  inert: boolean;
};

const isolatedElements = new Map<HTMLElement, IsolationState>();
const BACKGROUND_SELECTOR =
  'header, #main-content, footer, aside, nav[aria-label="Bottom navigation"]';

function isolate(element: HTMLElement) {
  const current = isolatedElements.get(element);

  if (current) {
    current.count += 1;
    return;
  }

  isolatedElements.set(element, {
    ariaHidden: element.getAttribute("aria-hidden"),
    count: 1,
    inert: element.inert,
  });
  element.inert = true;
  element.setAttribute("aria-hidden", "true");
}

function restore(element: HTMLElement) {
  const state = isolatedElements.get(element);

  if (!state) {
    return;
  }

  state.count -= 1;

  if (state.count > 0) {
    return;
  }

  isolatedElements.delete(element);
  element.inert = state.inert;

  if (state.ariaHidden === null) {
    element.removeAttribute("aria-hidden");
  } else {
    element.setAttribute("aria-hidden", state.ariaHidden);
  }
}

/** Keeps page content out of the focus and accessibility trees while a modal layer is open. */
export function useModalIsolation(
  isOpen: boolean,
  contentRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(BACKGROUND_SELECTOR),
    ).filter(
      (element) =>
        !contentRef.current?.contains(element) &&
        !element.contains(contentRef.current),
    );

    for (const element of elements) {
      isolate(element);
    }

    return () => {
      for (const element of elements) {
        restore(element);
      }
    };
  }, [contentRef, isOpen]);
}
