import { expect, test } from "@playwright/test";
import {
  bodyIsLocked,
  documentScrollTop,
  expectAnchorBelowStickyHeader,
  expectBodyUnlocked,
  expectDocumentAtTop,
  expectMainContentFocused,
  expectPathAndParams,
  expectScrollRestored,
  expectTopFirstForwardNavigation,
  scrollDocumentToBottom,
  startRouteFrameAudit,
  waitForPageSettled,
} from "./helpers/navigation";
import {
  expandFilterGroup,
  expectCanonicalPathAndParams,
  getVisibleSortSelect,
  openMobileFilterDialog,
} from "./helpers/product-listing";

test.use({
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
});

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
});

test.describe("persistent mobile navigation UI", () => {
  test("footer disclosures are exclusive, toggleable, and reset after navigation", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForPageSettled(page);

    const shop = page.getByRole("button", { name: "Shop", exact: true });
    const account = page.getByRole("button", { name: "Your account", exact: true });
    const helpAndLegal = page.getByRole("button", {
      name: "Help & legal",
      exact: true,
    });

    await shop.scrollIntoViewIfNeeded();
    await shop.click();
    await expect(shop).toHaveAttribute("aria-expanded", "true");

    await account.click();
    await expect(shop).toHaveAttribute("aria-expanded", "false");
    await expect(account).toHaveAttribute("aria-expanded", "true");

    await account.click();
    await expect(account).toHaveAttribute("aria-expanded", "false");

    await helpAndLegal.click();
    await expect(helpAndLegal).toHaveAttribute("aria-expanded", "true");
    const privacyLink = page
      .getByRole("link", { name: "Privacy Policy", exact: true })
      .last();
    await privacyLink.scrollIntoViewIfNeeded();
    const footerOffset = await documentScrollTop(page);

    await startRouteFrameAudit(page);
    await privacyLink.click();

    await expectPathAndParams(page, "/privacy");
    await expectTopFirstForwardNavigation(page, "/privacy", {
      stabilityMs: 700,
    });
    await expectDocumentAtTop(page);
    await expectMainContentFocused(page);
    await expect(shop).toHaveAttribute("aria-expanded", "false");
    await expect(account).toHaveAttribute("aria-expanded", "false");
    await expect(helpAndLegal).toHaveAttribute("aria-expanded", "false");

    await page.goBack();
    await expectPathAndParams(page, "/");
    await expectScrollRestored(page, footerOffset);
    await expect(page.locator("footer")).toBeInViewport();
    await expect(shop).toHaveAttribute("aria-expanded", "false");
    await expect(account).toHaveAttribute("aria-expanded", "false");
    await expect(helpAndLegal).toHaveAttribute("aria-expanded", "false");
  });

  test("Home from the products footer is top-first without a delayed jump", async ({
    page,
  }) => {
    await page.goto("/products");
    await waitForPageSettled(page);
    await scrollDocumentToBottom(page);
    expect(await documentScrollTop(page)).toBeGreaterThan(500);

    const homeTab = page
      .getByRole("navigation", { name: "Bottom navigation" })
      .getByRole("link", { name: "Home", exact: true });

    await startRouteFrameAudit(page);
    await homeTab.click();

    await expectPathAndParams(page, "/");
    await expectTopFirstForwardNavigation(page, "/", { stabilityMs: 1_000 });
    await expectDocumentAtTop(page);
    await expectMainContentFocused(page);
  });

  test("a same-destination footer link closes its disclosure and moves to the page top", async ({
    page,
  }) => {
    await page.goto("/products");
    await waitForPageSettled(page);
    await scrollDocumentToBottom(page);

    const shopDisclosure = page.getByRole("button", {
      name: "Shop",
      exact: true,
    });
    await shopDisclosure.click();
    await expect(shopDisclosure).toHaveAttribute("aria-expanded", "true");

    const shopAllLink = page
      .getByRole("link", { name: "Shop all", exact: true })
      .last();
    await shopAllLink.click();

    await expectPathAndParams(page, "/products");
    await expectDocumentAtTop(page);
    await expectMainContentFocused(page);
    await expect(shopDisclosure).toHaveAttribute("aria-expanded", "false");
  });

  test("Back closes the cart drawer and releases its body lock", async ({ page }) => {
    await page.goto("/");
    await waitForPageSettled(page);

    const bottomNavigation = page.getByRole("navigation", { name: "Bottom navigation" });
    await bottomNavigation.getByRole("link", { name: "Shop", exact: true }).click();
    await expectPathAndParams(page, "/products");

    await bottomNavigation.getByRole("button", { name: /^Cart,/ }).click();
    await expect(page.getByRole("dialog", { name: "Shopping cart" })).toBeVisible();
    await expect.poll(() => bodyIsLocked(page)).toBe(true);

    await page.goBack();
    await expectPathAndParams(page, "/");
    await expect(page.getByRole("dialog", { name: "Shopping cart" })).toHaveCount(0);
    await expect(page.locator(".a1-drawer-backdrop")).toHaveCount(0);
    await expect(page.locator("#main-content")).not.toHaveAttribute("aria-hidden", "true");
    await expect(page.locator("#main-content")).not.toHaveAttribute("inert", "");
    await expectBodyUnlocked(page);
  });

  test("query-only Back also closes the cart drawer and releases its body lock", async ({
    page,
  }) => {
    await page.goto("/products");
    await waitForPageSettled(page);
    await getVisibleSortSelect(page).selectOption("price-asc");
    await expectCanonicalPathAndParams(page, "/products", { sort: "price-asc" });

    const bottomNavigation = page.getByRole("navigation", {
      name: "Bottom navigation",
    });
    await bottomNavigation.getByRole("button", { name: /^Cart,/ }).click();
    await expect(page.getByRole("dialog", { name: "Shopping cart" })).toBeVisible();
    await expect.poll(() => bodyIsLocked(page)).toBe(true);

    await page.goBack();
    await expectPathAndParams(page, "/products");
    await expect(page.getByRole("dialog", { name: "Shopping cart" })).toHaveCount(0);
    await expectBodyUnlocked(page);
  });

  test("Shop is active for every catalogue route family", async ({ page }) => {
    test.setTimeout(90_000);

    const catalogueRoutes = [
      "/products",
      "/categories",
      "/category/vegetables",
      "/search?q=tea",
      "/offers",
      "/featured",
      "/best-sellers",
    ];

    for (const route of catalogueRoutes) {
      await page.goto(route);
      await waitForPageSettled(page);

      const bottomNavigation = page.getByRole("navigation", {
        name: "Bottom navigation",
      });
      await expect(
        bottomNavigation.getByRole("link", { name: "Shop", exact: true }),
      ).toHaveAttribute("aria-current", "page");
      await expect(
        bottomNavigation.getByRole("link", { name: "Home", exact: true }),
      ).not.toHaveAttribute("aria-current", "page");
    }
  });

  test("tapping an already-active top-level tab returns to the document top", async ({
    page,
  }) => {
    for (const destination of [
      { href: "/", label: "Home" },
      { href: "/products", label: "Shop" },
    ]) {
      await page.goto(destination.href);
      await waitForPageSettled(page);
      await page.locator("footer").scrollIntoViewIfNeeded();
      expect(await documentScrollTop(page)).toBeGreaterThan(500);

      await page
        .getByRole("navigation", { name: "Bottom navigation" })
        .getByRole("link", { name: destination.label, exact: true })
        .click();
      await expectDocumentAtTop(page);
    }
  });

  test("sort preserves the grid while filters target and close at the results heading", async ({
    page,
  }) => {
    test.setTimeout(90_000);

    await page.goto("/products");
    await waitForPageSettled(page);

    const sort = getVisibleSortSelect(page);
    await sort.scrollIntoViewIfNeeded();
    const sortOffset = await documentScrollTop(page);

    await sort.selectOption("price-asc");
    await expectCanonicalPathAndParams(
      page,
      "/products",
      { sort: "price-asc" },
      30_000,
    );
    await expectScrollRestored(page, sortOffset, 120);

    const { dialog: filterDialog, trigger: filterTrigger } =
      await openMobileFilterDialog(page);
    await expandFilterGroup(filterDialog, "Availability");
    await filterDialog.getByLabel("In stock only").check();
    const filterReturnOffset = await documentScrollTop(page);
    await filterDialog.getByRole("button", { name: "Apply filters" }).click();

    await expectCanonicalPathAndParams(
      page,
      "/products",
      {
        inStock: true,
        sort: "price-asc",
      },
      30_000,
    );
    await expect(page).toHaveURL(/#product-results$/);
    await expectAnchorBelowStickyHeader(
      page,
      page.locator("#product-results"),
    );
    await expect(filterTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(filterDialog).toBeHidden();

    await page.goBack();
    await expectCanonicalPathAndParams(
      page,
      "/products",
      { sort: "price-asc" },
      30_000,
    );
    await expectScrollRestored(page, filterReturnOffset, 160);
    await expect(getVisibleSortSelect(page)).toHaveValue("price-asc");

    const { dialog: reopenedFilterDialog } = await openMobileFilterDialog(page);
    await expandFilterGroup(reopenedFilterDialog, "Availability");
    await expect(
      reopenedFilterDialog.getByLabel("In stock only"),
    ).not.toBeChecked();
  });

  test("Back restores a deep catalogue position after a short filtered result", async ({
    page,
  }) => {
    await page.goto("/products?sort=newest");
    await waitForPageSettled(page);

    await page.locator("#product-results-grid").evaluate((grid) => {
      const gridBottom = grid.getBoundingClientRect().bottom + window.scrollY;
      const maximumScroll =
        (document.scrollingElement?.scrollHeight ?? 0) - window.innerHeight;
      window.scrollTo({
        behavior: "instant",
        top: Math.min(maximumScroll, gridBottom - window.innerHeight * 0.55),
      });
    });
    const deepCatalogueOffset = await documentScrollTop(page);
    expect(deepCatalogueOffset).toBeGreaterThan(800);

    const { dialog } = await openMobileFilterDialog(page);
    await expandFilterGroup(dialog, "Price");
    await dialog.getByLabel("Maximum price", { exact: true }).fill("0.01");
    await dialog.getByRole("button", { name: "Apply filters", exact: true }).click();

    await expectCanonicalPathAndParams(page, "/products", {
      maxPrice: "0.01",
      sort: "newest",
    });
    await expect(
      page.getByText("0 products found", { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    await expectAnchorBelowStickyHeader(page, page.locator("#product-results"));

    await page.goBack();
    await expectCanonicalPathAndParams(page, "/products", { sort: "newest" });
    await expect(
      page.locator("#product-results-grid article").first(),
    ).toBeVisible();
    await expectScrollRestored(page, deepCatalogueOffset, 180);
  });

  test("same-page mobile search anchors after its compact header commits", async ({
    page,
  }) => {
    await page.goto("/search");
    await waitForPageSettled(page);

    const headerSearch = page
      .getByRole("combobox", { name: "Search groceries", exact: true })
      .filter({ visible: true });
    await headerSearch.fill("tea");
    await headerSearch.press("Enter");

    await expectCanonicalPathAndParams(page, "/search", { q: "tea" });
    await expect(page).toHaveURL(/#product-results$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: 'Search results for "tea"',
      }),
    ).toBeVisible();
    await expectAnchorBelowStickyHeader(page, page.locator("#product-results"));

    const anchoredOffset = await documentScrollTop(page);
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          const deadline = performance.now() + 700;

          const waitForDeadline = () => {
            if (performance.now() >= deadline) {
              resolve();
              return;
            }

            requestAnimationFrame(waitForDeadline);
          };

          requestAnimationFrame(waitForDeadline);
        }),
    );
    expect(
      Math.abs((await documentScrollTop(page)) - anchoredOffset),
      "The committed search anchor must not be followed by a delayed scroll correction",
    ).toBeLessThanOrEqual(2);

    await page.goBack();
    await expectCanonicalPathAndParams(page, "/search");
    await expect(
      page.getByRole("heading", { level: 1, name: "Search groceries" }),
    ).toBeVisible();
    await expectDocumentAtTop(page);
  });
});
