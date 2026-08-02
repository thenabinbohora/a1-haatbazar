"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { consumeRouteNavigationIntent } from "@/lib/client-navigation";

function currentLocationKey() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function decodeHashTargetId(hash: string) {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

/**
 * Coordinates the small part of route transitions that Next cannot infer from
 * the persistent storefront shell.
 *
 * Normal forward pathname changes start at the document top before paint and
 * focus the persistent main landmark without scrolling it. Native browser and
 * Next.js behavior remains authoritative for history traversal, hashes, and
 * query-only interactions.
 */
export function RouteTransitionManager() {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const historyNavigationKeyRef = useRef<string | null>(null);
  const pendingFocusPathnameRef = useRef<string | null>(null);
  const focusFrameRef = useRef<number | null>(null);
  const routeContentRef = useRef<Element | null>(null);
  const routeHeadingTextRef = useRef("");
  const routeTitleRef = useRef("");

  useLayoutEffect(() => {
    function captureCurrentRouteSnapshot() {
      const mainContent = document.getElementById("main-content");
      routeContentRef.current = mainContent?.firstElementChild ?? null;
      routeHeadingTextRef.current =
        mainContent?.querySelector("h1")?.textContent?.trim() ?? "";
      routeTitleRef.current = document.title;
    }

    function markHistoryNavigation() {
      historyNavigationKeyRef.current = currentLocationKey();
      pendingFocusPathnameRef.current = null;
    }

    function cancelPendingFocusForUserIntent() {
      pendingFocusPathnameRef.current = null;

      if (focusFrameRef.current !== null) {
        window.cancelAnimationFrame(focusFrameRef.current);
        focusFrameRef.current = null;
      }

      captureCurrentRouteSnapshot();
    }

    function clearPendingFocusForAnotherTarget(event: FocusEvent) {
      if (
        pendingFocusPathnameRef.current &&
        event.target !== document.getElementById("main-content")
      ) {
        pendingFocusPathnameRef.current = null;
      }
    }

    captureCurrentRouteSnapshot();
    window.addEventListener("popstate", markHistoryNavigation);
    document.addEventListener("focusin", clearPendingFocusForAnotherTarget, true);
    document.addEventListener("keydown", cancelPendingFocusForUserIntent, true);
    document.addEventListener("pointerdown", cancelPendingFocusForUserIntent, true);
    document.addEventListener("wheel", cancelPendingFocusForUserIntent, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("popstate", markHistoryNavigation);
      document.removeEventListener("focusin", clearPendingFocusForAnotherTarget, true);
      document.removeEventListener("keydown", cancelPendingFocusForUserIntent, true);
      document.removeEventListener("pointerdown", cancelPendingFocusForUserIntent, true);
      document.removeEventListener("wheel", cancelPendingFocusForUserIntent, true);

      if (focusFrameRef.current !== null) {
        window.cancelAnimationFrame(focusFrameRef.current);
      }
    };
  }, []);

  useLayoutEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;
    const locationKey = currentLocationKey();
    const isHistoryNavigation = historyNavigationKeyRef.current === locationKey;
    historyNavigationKeyRef.current = null;
    const sourceContent = routeContentRef.current;
    const sourceHeadingText = routeHeadingTextRef.current;
    const sourceTitle = routeTitleRef.current;
    const hashAtPathChange = window.location.hash;
    const navigationIntent = consumeRouteNavigationIntent(pathname);
    const intendedDestinationHash = navigationIntent?.hash ?? hashAtPathChange;
    const transitionDeadline = window.performance.now() + 10_000;
    pendingFocusPathnameRef.current = isHistoryNavigation ? null : pathname;

    if (!isHistoryNavigation) {
      const scrollRoot = document.scrollingElement ?? document.documentElement;
      const documentElement = document.documentElement;
      const previousInlineScrollBehavior = documentElement.style.scrollBehavior;

      // A route reset must never inherit smooth behavior or animate after paint.
      documentElement.style.scrollBehavior = "auto";
      documentElement.getClientRects();
      scrollRoot.scrollTo({ behavior: "auto", left: 0, top: 0 });
      documentElement.style.scrollBehavior = previousInlineScrollBehavior;
    }

    if (focusFrameRef.current !== null) {
      window.cancelAnimationFrame(focusFrameRef.current);
    }

    const finishWhenDestinationIsReady = () => {
      const mainContent = document.getElementById("main-content");
      const currentContent = mainContent?.firstElementChild ?? null;
      const currentHeadingText =
        mainContent?.querySelector("h1")?.textContent?.trim() ?? "";
      const hasRouteLoadingShell = Boolean(
        mainContent?.querySelector("[data-route-loading-shell]"),
      );
      const contentChanged =
        currentContent !== sourceContent ||
        currentHeadingText !== sourceHeadingText ||
        document.title !== sourceTitle;

      if (!mainContent || hasRouteLoadingShell || !contentChanged) {
        if (window.performance.now() >= transitionDeadline) {
          routeContentRef.current = currentContent;
          routeHeadingTextRef.current = currentHeadingText;
          routeTitleRef.current = document.title;
          pendingFocusPathnameRef.current = null;
          focusFrameRef.current = null;
          return;
        }

        focusFrameRef.current = window.requestAnimationFrame(
          finishWhenDestinationIsReady,
        );
        return;
      }

      const destinationHash =
        window.location.hash || intendedDestinationHash;
      const hashTarget =
        !isHistoryNavigation && destinationHash
          ? document.getElementById(decodeHashTargetId(destinationHash))
          : null;

      // A streamed route can expose its title and top shell before the hash
      // landmark mounts. Wait for the real target before applying the final
      // anchor scroll.
      if (
        !isHistoryNavigation &&
        destinationHash &&
        !hashTarget &&
        window.performance.now() < transitionDeadline
      ) {
        focusFrameRef.current = window.requestAnimationFrame(
          finishWhenDestinationIsReady,
        );
        return;
      }

      routeContentRef.current = currentContent;
      routeHeadingTextRef.current = currentHeadingText;
      routeTitleRef.current = document.title;
      focusFrameRef.current = null;

      if (hashTarget) {
        hashTarget.scrollIntoView({
          behavior: "auto",
          block: "start",
        });
      }

      if (pendingFocusPathnameRef.current === pathname) {
        mainContent.focus({ preventScroll: true });
        pendingFocusPathnameRef.current = null;
      }
    };

    focusFrameRef.current = window.requestAnimationFrame(
      finishWhenDestinationIsReady,
    );

    return () => {
      if (focusFrameRef.current !== null) {
        window.cancelAnimationFrame(focusFrameRef.current);
        focusFrameRef.current = null;
      }
    };
  }, [pathname]);

  return null;
}
