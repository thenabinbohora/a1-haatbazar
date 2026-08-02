import type { MouseEvent } from "react";

type RouteNavigationIntent = {
  hash: string;
  pathname: string;
};

type NavigationIntentWindow = Window & {
  __a1RouteNavigationIntent?: RouteNavigationIntent;
  __a1SearchScrollIntent?: string;
};

type SearchNavigationRouter = {
  push: (href: string, options?: { scroll?: boolean }) => void;
};

export function isUnmodifiedPrimaryClick(event: MouseEvent<HTMLElement>) {
  return (
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.defaultPrevented
  );
}

export function markRouteNavigationIntent(href: string) {
  const targetUrl = new URL(href, window.location.origin);
  (window as NavigationIntentWindow).__a1RouteNavigationIntent = {
    hash: targetUrl.hash,
    pathname: targetUrl.pathname,
  };
}

export function consumeRouteNavigationIntent(pathname: string) {
  const intentWindow = window as NavigationIntentWindow;
  const intent = intentWindow.__a1RouteNavigationIntent;
  delete intentWindow.__a1RouteNavigationIntent;

  return intent?.pathname === pathname ? intent : null;
}

export function buildSearchNavigationHref(query: string) {
  const normalizedQuery = query.trim().replace(/\s+/g, " ").slice(0, 120);
  const search = normalizedQuery
    ? `?q=${encodeURIComponent(normalizedQuery)}`
    : "";

  return `/search${search}#product-results`;
}

export function consumeSearchScrollIntent(pathAndSearch: string) {
  const intentWindow = window as NavigationIntentWindow;
  const intent = intentWindow.__a1SearchScrollIntent;

  if (intent !== pathAndSearch) {
    return false;
  }

  delete intentWindow.__a1SearchScrollIntent;
  return true;
}

export function navigateToSearch(
  query: string,
  router: SearchNavigationRouter,
) {
  const href = buildSearchNavigationHref(query);

  if (window.location.pathname !== "/search") {
    markRouteNavigationIntent(href);
    router.push(href, { scroll: true });
    return;
  }

  const targetUrl = new URL(href, window.location.origin);
  const currentPathAndSearch = `${window.location.pathname}${window.location.search}`;
  const targetPathAndSearch = `${targetUrl.pathname}${targetUrl.search}`;

  if (targetPathAndSearch === currentPathAndSearch) {
    if (window.location.hash !== targetUrl.hash) {
      window.history.replaceState(null, "", href);
    }

    document.getElementById("product-results")?.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
  } else {
    // Next patches the native History API so useSearchParams updates without a
    // same-path route-component request. Null is intentional: reusing Next's
    // internal history state bypasses that synchronization.
    (window as NavigationIntentWindow).__a1SearchScrollIntent =
      targetPathAndSearch;
    window.history.pushState(null, "", href);
  }
}

export function scrollDocumentToTop({ smooth = false }: { smooth?: boolean } = {}) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.scrollingElement?.scrollTo({
    behavior: smooth && !reducedMotion ? "smooth" : "auto",
    top: 0,
  });
}
