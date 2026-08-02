import { expect, test } from "@playwright/test";
import {
  documentScrollTop,
  expectAnchorBelowStickyHeader,
  expectDocumentAtTop,
  expectMainContentFocused,
  expectPathAndParams,
  expectScrollRestored,
  expectTopFirstForwardNavigation,
  observedRouteFallbackFrames,
  scrollDocumentToBottom,
  startRouteFrameAudit,
  stopRouteFrameAudit,
  waitForPageSettled,
} from "./helpers/navigation";

test.describe("top-first route transitions", () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
  });

  test("a long category route opens Home at the top without a footer-first frame", async ({
    page,
  }) => {
    await page.goto("/category/vegetables");
    await waitForPageSettled(page);
    await scrollDocumentToBottom(page);
    expect(await documentScrollTop(page)).toBeGreaterThan(500);

    await startRouteFrameAudit(page);
    await page
      .locator("header")
      .getByRole("link", { name: "A1 Haat Bazar home", exact: true })
      .click();

    await expectPathAndParams(page, "/");
    await expectTopFirstForwardNavigation(page, "/", { stabilityMs: 1_000 });
    await expectDocumentAtTop(page);
    await expectMainContentFocused(page);
  });

  test("slow Home navigation stays top-first while streamed sections resolve", async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName !== "chromium",
      "The deterministic slow-RSC audit runs once; WebKit covers the same transition without interception.",
    );
    test.setTimeout(180_000);

    for (const width of [390, 768, 1024, 1280]) {
      await test.step(`${width}px with an 850ms Home RSC delay`, async () => {
        await page.setViewportSize({ height: 900, width });
        await page.goto("/category/vegetables");
        await waitForPageSettled(page);
        await scrollDocumentToBottom(page);

        let delayedHomeRequest = false;
        let homeRscRequestCount = 0;
        await page.route("**/*", async (route) => {
          const request = route.request();
          const requestUrl = new URL(request.url());
          const headers = request.headers();
          const isHomeRscRequest =
            requestUrl.pathname === "/" &&
            (requestUrl.searchParams.has("_rsc") || headers.rsc === "1");

          if (isHomeRscRequest) {
            homeRscRequestCount += 1;

            if (!delayedHomeRequest) {
              delayedHomeRequest = true;
              await new Promise((resolve) => setTimeout(resolve, 850));
            }
          }

          await route.continue();
        });

        const clientErrors: string[] = [];
        page.on("pageerror", (error) => clientErrors.push(error.message));
        page.on("console", (message) => {
          if (message.type() === "error") {
            clientErrors.push(message.text());
          }
        });
        await startRouteFrameAudit(page);
        await page
          .locator("header")
          .getByRole("link", { name: "A1 Haat Bazar home", exact: true })
          .click();

        await expectPathAndParams(page, "/");
        await expect.poll(() => delayedHomeRequest).toBe(true);
        await expect(page.locator("main .skeleton-shimmer")).toHaveCount(0, {
          timeout: 20_000,
        });
        await expect(
          page.getByRole("heading", {
            level: 2,
            name: "Deals for your next grocery run",
          }),
        ).toBeVisible();
        const fallbackFrames = await observedRouteFallbackFrames(page);
        expect(
          fallbackFrames.length,
          "Expected the Home route loading UI or a section Suspense fallback to occupy at least one animation frame",
        ).toBeGreaterThan(0);
        expect(
          fallbackFrames.filter((frame) => frame.footerVisible).slice(0, 3),
          "Expected no painted Home fallback frame to expose the footer",
        ).toEqual([]);
        expect(
          fallbackFrames.filter((frame) => frame.scrollTop > 32).slice(0, 3),
          "Expected every painted Home fallback frame to remain at the document top",
        ).toEqual([]);
        const frames = await expectTopFirstForwardNavigation(page, "/", {
          stabilityMs: 700,
        });
        await expectDocumentAtTop(page);
        await expectMainContentFocused(page);
        expect(clientErrors).toEqual([]);
        expect(
          homeRscRequestCount,
          "One Home action should issue one RSC navigation request",
        ).toBe(1);

        const mapFrame = page.getByTitle(
          "Map showing A1 Haat Bazar in Salisbury",
        );
        await expect(mapFrame).toHaveAttribute("loading", "lazy");
        expect(
          await mapFrame.evaluate(
            (frame) => frame.parentElement?.getBoundingClientRect().height ?? 0,
          ),
        ).toBeGreaterThanOrEqual(210);

        const settledHomeFrames = frames.filter(
          (frame) => frame.headingVisible && frame.footerTop !== null,
        );
        const footerPositions = settledHomeFrames.map(
          (frame) => frame.footerTop!,
        );
        expect(footerPositions.length).toBeGreaterThan(0);
        expect(
          Math.max(...footerPositions) - Math.min(...footerPositions),
          "Expected section skeletons to keep the Home footer stable as deferred content resolves",
        ).toBeLessThanOrEqual(width < 768 ? 240 : 160);

        await page.unroute("**/*");
      });
    }
  });

  test("a footer legal link opens at the top and Back restores the footer position", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForPageSettled(page);

    const footer = page.locator("footer");
    const privacyLink = footer.getByRole("link", {
      name: "Privacy Policy",
      exact: true,
    });
    await privacyLink.scrollIntoViewIfNeeded();
    const footerOffset = await documentScrollTop(page);
    expect(footerOffset).toBeGreaterThan(500);

    await startRouteFrameAudit(page);
    await privacyLink.click();

    await expectPathAndParams(page, "/privacy");
    await expectTopFirstForwardNavigation(page, "/privacy", {
      stabilityMs: 700,
    });
    await expectDocumentAtTop(page);
    await expectMainContentFocused(page);

    await page.goBack();
    await expectPathAndParams(page, "/");
    await expectScrollRestored(page, footerOffset);
    await expect(footer).toBeInViewport();
  });
});

test.describe("forward navigation and browser history", () => {
  test("View all best sellers opens at the top and Back restores the homepage", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForPageSettled(page);

    const viewAll = page.getByRole("link", {
      name: "View all best sellers",
      exact: true,
    });
    await viewAll.scrollIntoViewIfNeeded();
    const homepageOffset = await documentScrollTop(page);
    expect(homepageOffset).toBeGreaterThan(800);

    await viewAll.click();
    await expectPathAndParams(page, "/best-sellers");
    await expect(
      page.getByRole("heading", { level: 1, name: "Best sellers" }),
    ).toBeVisible();
    await expectDocumentAtTop(page);
    await expectMainContentFocused(page);

    await page.goBack();
    await expectPathAndParams(page, "/");
    await expectScrollRestored(page, homepageOffset);
  });

  test("View all featured products opens its destination at the top", async ({ page }) => {
    await page.goto("/");
    await waitForPageSettled(page);

    const viewAll = page.getByRole("link", {
      name: "View all featured products",
      exact: true,
    });
    await viewAll.scrollIntoViewIfNeeded();
    expect(await documentScrollTop(page)).toBeGreaterThan(500);

    await viewAll.click();
    await expectPathAndParams(page, "/featured");
    await expect(
      page.getByRole("heading", { level: 1, name: "Featured products" }),
    ).toBeVisible();
    await expectDocumentAtTop(page);
    await expectMainContentFocused(page);
  });

  test("every remaining homepage View all link opens its destination at the top", async ({
    page,
  }) => {
    const destinations: Array<{
      name: string;
      pathname: string;
      parameters: Record<string, string>;
    }> = [
      {
        name: "View all grocery categories",
        pathname: "/categories",
        parameters: {},
      },
      {
        name: "View all weekly offers",
        pathname: "/offers",
        parameters: {},
      },
      {
        name: "View all fresh vegetables",
        pathname: "/category/vegetables",
        parameters: {},
      },
    ];

    for (const destination of destinations) {
      await page.goto("/");
      await waitForPageSettled(page);

      const viewAll = page.getByRole("link", {
        name: destination.name,
        exact: true,
      });
      await viewAll.scrollIntoViewIfNeeded();
      expect(await documentScrollTop(page)).toBeGreaterThan(500);
      await page.evaluate(() => {
        (window as Window & { __navigationDocumentMarker?: string }).__navigationDocumentMarker =
          "same-document";
      });

      await viewAll.click();
      await expectPathAndParams(
        page,
        destination.pathname,
        destination.parameters,
      );
      await expect(page.locator("main h1")).toBeVisible();
      expect(
        await page.evaluate(
          () =>
            (window as Window & { __navigationDocumentMarker?: string })
              .__navigationDocumentMarker,
        ),
      ).toBe("same-document");
      await expectDocumentAtTop(page);
      await expectMainContentFocused(page);
    }
  });

  test("a product opens at the top and Back restores its grid position", async ({ page }) => {
    await page.goto("/products");
    await waitForPageSettled(page);
    await expect(page.getByRole("heading", { level: 1, name: "Shop groceries" })).toBeVisible();

    const productLinks = page.locator('main article a[aria-label^="View "]');
    await expect(productLinks.first()).toBeVisible();
    const productCount = await productLinks.count();
    const productLink = productLinks.nth(Math.min(productCount - 1, 7));
    await productLink.scrollIntoViewIfNeeded();
    const gridOffset = await documentScrollTop(page);
    expect(gridOffset).toBeGreaterThan(250);

    const productPath = await productLink.getAttribute("href");
    expect(productPath).toMatch(/^\/products\/[^/]+$/);
    await productLink.click();
    await expectPathAndParams(page, productPath!);
    await expect(page.locator("main h1")).toBeVisible();
    await expectDocumentAtTop(page);
    await expectMainContentFocused(page);

    await page.goBack();
    await expectPathAndParams(page, "/products");
    await expectScrollRestored(page, gridOffset);
  });

  test("a Home product opens at the top and Back/Forward preserve native positions", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForPageSettled(page);

    const homeProductLinks = page.locator(
      'main article a[aria-label^="View "]',
    );
    await expect(homeProductLinks.first()).toBeVisible();
    const productLink = homeProductLinks.nth(
      Math.min((await homeProductLinks.count()) - 1, 7),
    );
    await productLink.scrollIntoViewIfNeeded();
    const homeOffset = await documentScrollTop(page);
    expect(homeOffset).toBeGreaterThan(500);

    const productHref = await productLink.getAttribute("href");
    expect(productHref).toMatch(/^\/products\/[^/]+/);
    const productUrl = new URL(productHref!, "http://a1.test");

    await productLink.click();
    await expectPathAndParams(page, productUrl.pathname);
    await expect(page.locator("main h1")).toBeVisible();
    await expectDocumentAtTop(page);
    await expectMainContentFocused(page);

    await page.goBack();
    await expectPathAndParams(page, "/");
    await expectScrollRestored(page, homeOffset);

    await page.goForward();
    await expectPathAndParams(page, productUrl.pathname);
    await expectDocumentAtTop(page);
  });
});

test.describe("hash navigation", () => {
  test("legal table-of-contents links preserve the hash and clear the sticky header", async ({
    page,
  }) => {
    await page.goto("/privacy");
    await waitForPageSettled(page);

    const contentsLink = page.locator(
      'nav[aria-label="Privacy Policy contents"] a[href="#information-we-collect"]:visible',
    );
    await expect(contentsLink).toHaveCount(1);
    await contentsLink.click();

    await expect(page).toHaveURL(/\/privacy#information-we-collect$/);
    const target = page.locator("#information-we-collect");
    await expect(target).toBeVisible();
    await expectAnchorBelowStickyHeader(page, target);
  });

  test("cross-route search preserves its results hash, sticky offset, focus, and Back position", async ({
    page,
  }) => {
    await page.goto("/privacy");
    await waitForPageSettled(page);
    await scrollDocumentToBottom(page);
    const sourceOffset = await documentScrollTop(page);

    const headerSearch = page.locator("header").getByRole("search");
    const searchInput = headerSearch.getByRole("combobox", {
      name: "Search groceries",
    });
    await searchInput.fill("rice");
    await startRouteFrameAudit(page);
    await searchInput.press("Enter");

    await expectPathAndParams(page, "/search", { q: "rice" });
    await expect(page).toHaveURL(/\/search\?q=rice#product-results$/);
    const results = page.locator("#product-results");
    await expect(results).toBeVisible();
    await expectAnchorBelowStickyHeader(page, results);
    await expectMainContentFocused(page);
    await waitForPageSettled(page);

    const searchFrames = await stopRouteFrameAudit(page, "/search");
    expect(
      searchFrames.length,
      "Expected to sample at least one painted frame for cross-route search",
    ).toBeGreaterThan(0);
    expect(
      searchFrames.filter((frame) => frame.footerVisible).slice(0, 3),
      "Expected no streamed cross-route search frame to expose the footer before the results target",
    ).toEqual([]);

    await page.goBack();
    await expectPathAndParams(page, "/privacy");
    await expectScrollRestored(page, sourceOffset);
    await expect(page.locator("footer")).toBeInViewport();
  });
});
