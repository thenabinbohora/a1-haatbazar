import { expect, type Locator, type Page } from "@playwright/test";

export type RouteNavigationFrame = {
  documentHeight: number;
  fallbackVisible: boolean;
  footerTop: number | null;
  footerVisible: boolean;
  headingTop: number | null;
  headingVisible: boolean;
  pathname: string;
  scrollTop: number;
  timestamp: number;
  topContentVisible: boolean;
  viewportHeight: number;
};

type RouteFrameAudit = {
  frames: RouteNavigationFrame[];
  requestId: number;
  running: boolean;
};

type RouteFrameAuditWindow = Window & {
  __a1RouteFrameAudit?: RouteFrameAudit;
};

export async function waitForPageSettled(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForLoadState("networkidle");
  await page.locator("#main-content").waitFor({ state: "attached" });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}

export async function documentScrollTop(page: Page) {
  return page.evaluate(() => document.scrollingElement?.scrollTop ?? window.scrollY);
}

export async function scrollDocumentToBottom(page: Page) {
  await page.evaluate(() => {
    const scrollingElement = document.scrollingElement;

    if (!scrollingElement) {
      return;
    }

    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  });

  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const scrollingElement = document.scrollingElement;

          if (!scrollingElement) {
            return Number.POSITIVE_INFINITY;
          }

          return Math.abs(
            scrollingElement.scrollHeight -
              scrollingElement.clientHeight -
              scrollingElement.scrollTop,
          );
        }),
      { message: "Expected the document to reach its bottom edge" },
    )
    .toBeLessThanOrEqual(2);
}

/**
 * Samples every painted frame across a client-side navigation.
 *
 * Start this immediately before the user action. Filtering by the committed
 * destination pathname lets tests ignore the still-visible source route while
 * its server response is pending, while preserving any destination loading
 * frames that final-state assertions would otherwise miss.
 */
export async function startRouteFrameAudit(page: Page) {
  await page.evaluate(() => {
    const auditWindow = window as RouteFrameAuditWindow;
    const previousAudit = auditWindow.__a1RouteFrameAudit;

    if (previousAudit) {
      previousAudit.running = false;
      window.cancelAnimationFrame(previousAudit.requestId);
    }

    const audit: RouteFrameAudit = {
      frames: [],
      requestId: 0,
      running: true,
    };
    auditWindow.__a1RouteFrameAudit = audit;

    const sampleFrame = () => {
      const currentAudit = auditWindow.__a1RouteFrameAudit;

      if (!currentAudit || !currentAudit.running) {
        return;
      }

      const footer = document.querySelector<HTMLElement>("footer");
      const footerRect = footer?.getBoundingClientRect() ?? null;
      const heading = document.querySelector<HTMLElement>("#main-content h1");
      const headingRect = heading?.getBoundingClientRect() ?? null;
      const fallbackVisible = Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-route-loading-shell], #main-content .skeleton-shimmer",
        ),
      ).some((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);

        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          rect.width > 0 &&
          rect.height > 0
        );
      });
      const stickyHeaderBottom = Array.from(
        document.querySelectorAll<HTMLElement>("header"),
      )
        .filter((header) => {
          const position = getComputedStyle(header).position;
          const rect = header.getBoundingClientRect();

          return (
            (position === "sticky" || position === "fixed") &&
            rect.top <= 1 &&
            rect.bottom > 0
          );
        })
        .reduce(
          (maximum, header) =>
            Math.max(maximum, header.getBoundingClientRect().bottom),
          0,
        );
      const mainChildren = Array.from(
        document.querySelector<HTMLElement>("#main-content")?.children ?? [],
      );
      const topContentVisible = mainChildren.some((element) => {
        const rect = element.getBoundingClientRect();

        return (
          rect.height >= 16 &&
          rect.top < window.innerHeight &&
          rect.bottom > stickyHeaderBottom
        );
      });

      currentAudit.frames.push({
        documentHeight: document.scrollingElement?.scrollHeight ?? 0,
        fallbackVisible,
        footerTop: footerRect?.top ?? null,
        footerVisible: Boolean(
          footerRect &&
            footerRect.top < window.innerHeight &&
            footerRect.bottom > 0,
        ),
        headingTop: headingRect?.top ?? null,
        headingVisible: Boolean(
          headingRect &&
            headingRect.top < window.innerHeight &&
            headingRect.bottom > stickyHeaderBottom,
        ),
        pathname: window.location.pathname,
        scrollTop:
          document.scrollingElement?.scrollTop ?? window.scrollY,
        timestamp: window.performance.now(),
        topContentVisible,
        viewportHeight: window.innerHeight,
      });
      currentAudit.requestId = window.requestAnimationFrame(sampleFrame);
    };

    sampleFrame();
  });
}

async function waitForFrameAuditStability(page: Page, durationMs: number) {
  await page.evaluate(
    (duration) =>
      new Promise<void>((resolve) => {
        const deadline = window.performance.now() + duration;

        const waitForDeadline = () => {
          if (window.performance.now() >= deadline) {
            resolve();
            return;
          }

          window.requestAnimationFrame(waitForDeadline);
        };

        window.requestAnimationFrame(waitForDeadline);
      }),
    durationMs,
  );
}

export async function observedRouteFallbackFrames(page: Page) {
  return page.evaluate(() => {
    const audit = (window as RouteFrameAuditWindow).__a1RouteFrameAudit;

    return audit?.frames.filter((frame) => frame.fallbackVisible) ?? [];
  });
}

export async function stopRouteFrameAudit(
  page: Page,
  destinationPathname: string,
) {
  return page.evaluate((pathname) => {
    const auditWindow = window as RouteFrameAuditWindow;
    const audit = auditWindow.__a1RouteFrameAudit;

    if (!audit) {
      return [] as RouteNavigationFrame[];
    }

    audit.running = false;
    window.cancelAnimationFrame(audit.requestId);
    delete auditWindow.__a1RouteFrameAudit;

    return audit.frames.filter((frame) => frame.pathname === pathname);
  }, destinationPathname);
}

export async function expectTopFirstForwardNavigation(
  page: Page,
  destinationPathname: string,
  {
    maximumOffset = 32,
    stabilityMs = 900,
  }: {
    maximumOffset?: number;
    stabilityMs?: number;
  } = {},
) {
  await expect(page.locator("#main-content h1").first()).toBeVisible();
  await waitForFrameAuditStability(page, stabilityMs);

  const destinationFrames = await stopRouteFrameAudit(
    page,
    destinationPathname,
  );

  expect(
    destinationFrames.length,
    `Expected to sample at least one painted frame for ${destinationPathname}`,
  ).toBeGreaterThan(0);

  const firstFrame = destinationFrames[0]!;
  expect(
    firstFrame.scrollTop,
    `Expected the first ${destinationPathname} frame to start at the top; frame=${JSON.stringify(firstFrame)}`,
  ).toBeLessThanOrEqual(maximumOffset);
  expect(
    firstFrame.topContentVisible,
    `Expected top content or a top-loading shell in the first ${destinationPathname} frame; frame=${JSON.stringify(firstFrame)}`,
  ).toBe(true);

  const footerFrames = destinationFrames.filter((frame) => frame.footerVisible);
  expect(
    footerFrames.slice(0, 3),
    `Expected no destination frame to expose the footer before top content on ${destinationPathname}`,
  ).toEqual([]);

  const displacedFrames = destinationFrames.filter(
    (frame) => frame.scrollTop > maximumOffset,
  );
  expect(
    displacedFrames.slice(0, 3),
    `Expected ${destinationPathname} to remain within ${maximumOffset}px of the top without a delayed jump`,
  ).toEqual([]);

  expect(
    destinationFrames.some((frame) => frame.headingVisible),
    `Expected the destination heading to become visible below the sticky header on ${destinationPathname}`,
  ).toBe(true);

  return destinationFrames;
}

export async function expectDocumentAtTop(page: Page, maximumOffset = 32) {
  await expect
    .poll(() => documentScrollTop(page), {
      message: `Expected the document scroll position to be at most ${maximumOffset}px`,
    })
    .toBeLessThanOrEqual(maximumOffset);
}

export async function expectScrollRestored(
  page: Page,
  expectedOffset: number,
  tolerance = 160,
) {
  await expect
    .poll(
      async () => Math.abs((await documentScrollTop(page)) - expectedOffset),
      {
        message: `Expected browser history to restore scroll near ${Math.round(expectedOffset)}px`,
      },
    )
    .toBeLessThanOrEqual(tolerance);
}

export async function expectMainContentFocused(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            document.activeElement instanceof HTMLElement
              ? document.activeElement.id
              : null,
        ),
      { message: "Expected forward navigation to focus #main-content" },
    )
    .toBe("main-content");
}

export async function expectPathAndParams(
  page: Page,
  pathname: string,
  parameters: Record<string, string> = {},
) {
  await expect
    .poll(
      () => {
        const currentUrl = new URL(page.url());
        return {
          pathname: currentUrl.pathname,
          parameters: Object.fromEntries(
            Object.keys(parameters).map((key) => [key, currentUrl.searchParams.get(key)]),
          ),
        };
      },
      { message: `Expected navigation to ${pathname}` },
    )
    .toEqual({
      pathname,
      parameters,
    });
}

export async function expectAnchorBelowStickyHeader(page: Page, target: Locator) {
  await expect
    .poll(
      () =>
        target.evaluate((element) => {
          const targetTop = element.getBoundingClientRect().top;
          const stickyHeaderBottom = Array.from(
            document.querySelectorAll<HTMLElement>("header"),
          )
            .filter((header) => {
              const position = getComputedStyle(header).position;
              const rect = header.getBoundingClientRect();
              return (
                (position === "sticky" || position === "fixed") &&
                rect.top <= 1 &&
                rect.bottom > 0
              );
            })
            .reduce(
              (maximum, header) =>
                Math.max(maximum, header.getBoundingClientRect().bottom),
              0,
            );

          return {
            belowHeader: targetTop >= stickyHeaderBottom - 2,
            inViewport: targetTop < window.innerHeight,
          };
        }),
      { message: "Expected the hash target to be visible below the sticky header" },
    )
    .toEqual({ belowHeader: true, inViewport: true });
}

export async function bodyIsLocked(page: Page) {
  return page.evaluate(() =>
    [document.documentElement, document.body].some((element) => {
      const computedStyle = getComputedStyle(element);
      const inlineStyle = element.style;
      return (
        inlineStyle.overflow === "hidden" ||
        inlineStyle.position === "fixed" ||
        computedStyle.overflowY === "hidden" ||
        element.classList.contains("overflow-hidden")
      );
    }),
  );
}

export async function expectBodyUnlocked(page: Page) {
  await expect
    .poll(
      () => bodyIsLocked(page),
      { message: "Expected route navigation to release the body scroll lock" },
    )
    .toBe(false);
}
