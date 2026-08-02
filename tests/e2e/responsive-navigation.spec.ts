import { expect, test } from "@playwright/test";
import {
  documentScrollTop,
  expectAnchorBelowStickyHeader,
  expectDocumentAtTop,
  expectPathAndParams,
  expectScrollRestored,
  expectTopFirstForwardNavigation,
  scrollDocumentToBottom,
  startRouteFrameAudit,
  waitForPageSettled,
} from "./helpers/navigation";

const VIEWPORT_WIDTHS = [
  360, 375, 390, 412, 430, 540, 768, 1024, 1280, 1440, 1536,
];

test("navigation shell remains usable across the required responsive matrix", async ({
  page,
}) => {
  for (const width of VIEWPORT_WIDTHS) {
    await test.step(`${width}px at 100% zoom`, async () => {
      await page.setViewportSize({ height: 900, width });
      await page.goto("/");
      await waitForPageSettled(page);

      const viewportState = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        visualScale: window.visualViewport?.scale ?? 1,
      }));
      expect(viewportState.visualScale).toBe(1);
      expect(viewportState.scrollWidth - viewportState.clientWidth).toBeLessThanOrEqual(
        1,
      );

      const header = page.locator("header");
      await expect(header).toBeVisible();
      await expect
        .poll(() => header.evaluate((element) => element.getBoundingClientRect().top))
        .toBe(0);

      const bottomNavigation = page.getByRole("navigation", {
        name: "Bottom navigation",
      });
      const mobileFooterShop = page.getByRole("button", {
        name: "Shop",
        exact: true,
      });

      if (width < 1280) {
        await expect(bottomNavigation).toBeVisible();
      } else {
        await expect(bottomNavigation).toBeHidden();
      }

      await page.evaluate(() => {
        document.scrollingElement?.scrollTo({
          behavior: "auto",
          top: document.scrollingElement.scrollHeight,
        });
      });

      if (width < 768) {
        await expect(mobileFooterShop).toBeVisible();
        await mobileFooterShop.click();
        await expect(mobileFooterShop).toHaveAttribute("aria-expanded", "true");
      } else {
        await expect(mobileFooterShop).toBeHidden();
        await expect(
          page.getByRole("navigation", {
            name: "Footer shop links",
            exact: true,
          }),
        ).toBeVisible();
      }

      if (width < 1280) {
        await page.evaluate(async () => {
          document.scrollingElement?.scrollTo({
            behavior: "auto",
            top: document.scrollingElement.scrollHeight,
          });
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          });
        });
        const [footerBottom, navigationTop] = await Promise.all([
          page.locator("footer").evaluate(
            (element) => element.getBoundingClientRect().bottom,
          ),
          bottomNavigation.evaluate(
            (element) => element.getBoundingClientRect().top,
          ),
        ]);
        expect(footerBottom).toBeLessThan(navigationTop);
      }
    });
  }
});

test("forward Home navigation is top-first across the responsive route matrix", async ({
  browserName,
  page,
}) => {
  test.skip(
    browserName !== "chromium",
    "The complete resize matrix runs once; WebKit covers representative desktop and mobile route transitions.",
  );
  test.setTimeout(120_000);

  for (const width of VIEWPORT_WIDTHS) {
    await test.step(`${width}px forward Home transition`, async () => {
      await page.setViewportSize({ height: 900, width });
      await page.goto("/products");
      await waitForPageSettled(page);
      await scrollDocumentToBottom(page);
      const sourceOffset = await documentScrollTop(page);
      expect(sourceOffset).toBeGreaterThan(500);

      await startRouteFrameAudit(page);
      await page
        .locator("header")
        .getByRole("link", { name: "A1 Haat Bazar home", exact: true })
        .click();

      await expectPathAndParams(page, "/");
      await expectTopFirstForwardNavigation(page, "/", {
        stabilityMs: 250,
      });
      await expectDocumentAtTop(page);

      const viewportState = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        visualScale: window.visualViewport?.scale ?? 1,
      }));
      expect(viewportState.visualScale).toBe(1);
      expect(
        viewportState.scrollWidth - viewportState.clientWidth,
      ).toBeLessThanOrEqual(1);

      await page.goBack();
      await expectPathAndParams(page, "/products");
      await expectScrollRestored(page, sourceOffset, 640);
      await expect(page.locator("footer")).toBeInViewport();
    });
  }
});

test("sticky hash targets clear the header across the responsive matrix", async ({
  browserName,
  page,
}) => {
  test.skip(
    browserName !== "chromium",
    "The complete resize matrix runs once; WebKit covers representative hash navigation.",
  );
  test.setTimeout(120_000);

  for (const width of VIEWPORT_WIDTHS) {
    await test.step(`${width}px sticky anchor offset`, async () => {
      await page.setViewportSize({ height: 900, width });
      await page.goto("/privacy");
      await waitForPageSettled(page);

      if (width < 1024) {
        await page.getByText("Contents", { exact: true }).click();
      }

      const contentsLink = page.locator(
        'nav[aria-label="Privacy Policy contents"] a[href="#information-we-collect"]:visible',
      );
      await contentsLink.click();

      const target = page.locator("#information-we-collect");
      await expect(target).toBeVisible();
      await expectAnchorBelowStickyHeader(page, target);
    });
  }
});
