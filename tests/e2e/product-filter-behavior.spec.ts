import { expect, test } from "@playwright/test";
import {
  bodyIsLocked,
  expectAnchorBelowStickyHeader,
  expectBodyUnlocked,
  waitForPageSettled,
} from "./helpers/navigation";
import {
  engageDesktopStickySidebar,
  expandFilterGroup,
  expectCanonicalPathAndParams,
  expectDisplayedPricesSorted,
  expectFilterContentContained,
  expectFilterContract,
  expectFilterGroupsCollapsed,
  expectFocusInside,
  expectMobileFilterActionsUsable,
  expectSingleVisibleSort,
  expectSortContract,
  getDesktopFilterSidebar,
  getFilterGroupPanel,
  getFilterGroupTrigger,
  getMobileFilterTrigger,
  getProductHrefs,
  getVisibleSortSelect,
  openMobileFilterDialog,
} from "./helpers/product-listing";

test.describe("mobile product filters", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });

  test("the filter drawer is modal, keyboard-safe, contained, and separate from sorting", async ({
    page,
  }) => {
    await page.goto("/products");
    await waitForPageSettled(page);
    await expectSortContract(page);

    const { dialog, trigger } = await openMobileFilterDialog(page);
    await expectFilterGroupsCollapsed(dialog);
    await expectFilterContract(dialog, { mode: "mobile" });
    await expandFilterGroup(dialog, "Offers & collections");
    await expectFilterContentContained(dialog);
    await expectMobileFilterActionsUsable(dialog);
    await expect.poll(() => bodyIsLocked(page)).toBe(true);
    const bottomNavigation = page.getByRole("navigation", {
      includeHidden: true,
      name: "Bottom navigation",
    });
    await expect(bottomNavigation).toHaveAttribute("aria-hidden", "true");
    await expect
      .poll(() => bottomNavigation.evaluate((element) => (element as HTMLElement).inert))
      .toBe(true);

    const closeButton = dialog
      .getByRole("button", { name: /^Close(?: filters)?$/i })
      .first();
    await expect(closeButton).toBeVisible();
    await closeButton.focus();
    await page.keyboard.press("Shift+Tab");
    await expectFocusInside(dialog);

    await dialog.getByRole("checkbox", { name: "On sale", exact: true }).check();
    await page.keyboard.press("Escape");

    await expect(dialog).toBeHidden();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
    await expectBodyUnlocked(page);
    await expect(bottomNavigation).not.toHaveAttribute("aria-hidden", "true");
    await expect
      .poll(() => bottomNavigation.evaluate((element) => (element as HTMLElement).inert))
      .toBe(false);

    const reopened = await openMobileFilterDialog(page);
    await expectFilterGroupsCollapsed(reopened.dialog);
    await expandFilterGroup(reopened.dialog, "Offers & collections");
    await expect(
      reopened.dialog.getByRole("checkbox", { name: "On sale", exact: true }),
    ).not.toBeChecked();
    await page.keyboard.press("Escape");
    await expectBodyUnlocked(page);
  });

  test("Apply, removable chips, Clear all, Back, and Forward preserve canonical URL state", async ({
    page,
  }) => {
    await page.goto("/products?sort=newest");
    await waitForPageSettled(page);

    const {
      dialog: initialDialog,
      trigger: filterTrigger,
    } = await openMobileFilterDialog(page);
    let dialog = initialDialog;
    await expectFilterGroupsCollapsed(dialog);
    await expandFilterGroup(dialog, "Offers & collections");
    await dialog
      .getByRole("checkbox", { name: "Featured products", exact: true })
      .check();
    await expandFilterGroup(dialog, "Availability");
    await dialog
      .getByRole("checkbox", { name: "In stock only", exact: true })
      .check();
    await dialog.getByRole("button", { name: "Apply filters", exact: true }).click();

    await expectCanonicalPathAndParams(page, "/products", {
      featured: true,
      inStock: true,
      sort: "newest",
    });
    await expect(page.getByRole("dialog", { name: "Filters", exact: true })).toBeHidden();
    await expectBodyUnlocked(page);
    await expect(filterTrigger).toBeFocused();
    await expectAnchorBelowStickyHeader(page, page.locator("#product-results"));

    const activeFilters = page.getByLabel("Active filters", { exact: true });
    await expect(
      activeFilters.getByRole("button", {
        name: /^Remove Featured(?: products)? filter$/i,
      }),
    ).toBeVisible();
    await expect(
      activeFilters.getByRole("button", {
        name: /^Remove In stock(?: only)? filter$/i,
      }),
    ).toBeVisible();

    await page.goBack();
    await expectCanonicalPathAndParams(page, "/products", { sort: "newest" });
    await expect(getVisibleSortSelect(page)).toHaveValue("newest");

    await page.goForward();
    await expectCanonicalPathAndParams(page, "/products", {
      featured: true,
      inStock: true,
      sort: "newest",
    });
    await expect(
      page
        .getByLabel("Active filters", { exact: true })
        .getByRole("button", {
          name: /^Remove Featured(?: products)? filter$/i,
        }),
    ).toBeVisible();

    await page
      .getByLabel("Active filters", { exact: true })
      .getByRole("button", {
        name: /^Remove Featured(?: products)? filter$/i,
      })
      .click();
    await expectCanonicalPathAndParams(page, "/products", {
      inStock: true,
      sort: "newest",
    });

    ({ dialog } = await openMobileFilterDialog(page));
    await expectFilterGroupsCollapsed(dialog);
    await dialog.getByRole("button", { name: "Clear all", exact: true }).click();
    await expect(dialog).toBeVisible();
    await expandFilterGroup(dialog, "Availability");
    await expect(
      dialog.getByRole("checkbox", { name: "In stock only", exact: true }),
    ).not.toBeChecked();
    await dialog.getByRole("button", { name: "Apply filters", exact: true }).click();

    await expectCanonicalPathAndParams(page, "/products", { sort: "newest" });
    await expect(page.getByLabel("Active filters", { exact: true })).toHaveCount(0);
    await expectBodyUnlocked(page);
  });
});

test.describe("desktop product filters", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("the sidebar is stable and the one sort control supports the canonical sort schema", async ({
    page,
  }) => {
    await page.goto("/products");
    await waitForPageSettled(page);
    const routeComponentRequests: string[] = [];
    page.on("request", (request) => {
      const requestUrl = new URL(request.url());

      if (
        requestUrl.searchParams.has("_rsc") ||
        request.headers().rsc === "1"
      ) {
        routeComponentRequests.push(request.url());
      }
    });

    const sidebar = getDesktopFilterSidebar(page);
    await expect(sidebar).toHaveCount(1);
    await expect(getMobileFilterTrigger(page)).toHaveCount(0);
    await expectFilterGroupsCollapsed(sidebar);
    await engageDesktopStickySidebar(page, sidebar);
    await expectFilterContract(sidebar, { mode: "desktop" });
    await expectFilterContentContained(sidebar);
    await expectSortContract(page);

    const sort = getVisibleSortSelect(page);
    await sort.selectOption("price-asc");
    await expectCanonicalPathAndParams(page, "/products", { sort: "price-asc" });
    await expectDisplayedPricesSorted(page, "ascending");

    await getVisibleSortSelect(page).selectOption("price-desc");
    await expectCanonicalPathAndParams(page, "/products", { sort: "price-desc" });
    await expectDisplayedPricesSorted(page, "descending");

    const currentSidebar = getDesktopFilterSidebar(page);
    await expandFilterGroup(currentSidebar, "Offers & collections");
    await currentSidebar
      .getByRole("checkbox", { name: "On sale", exact: true })
      .check();
    await expect(
      getFilterGroupTrigger(currentSidebar, "Offers & collections"),
    ).toHaveAttribute("aria-expanded", "true");
    await expectCanonicalPathAndParams(page, "/products", {
      sale: true,
      sort: "price-desc",
    });
    await expect(
      page
        .getByLabel("Active filters", { exact: true })
        .getByRole("button", { name: /^Remove On sale filter$/i }),
    ).toBeVisible();
    expect(
      routeComponentRequests,
      "Client-side sort and filter changes must not issue route-component requests",
    ).toEqual([]);
  });

  test("duplicated direct URL parameters preserve first-value server semantics", async ({
    page,
  }) => {
    await page.goto("/products?sort=price-asc&sort=price-desc");
    await waitForPageSettled(page);

    await expect(getVisibleSortSelect(page)).toHaveValue("price-asc");
    await expectDisplayedPricesSorted(page, "ascending");
  });

  test("same-page search submissions update URL, copy, and results without an RSC request", async ({
    page,
  }) => {
    await page.goto("/search?q=tea");
    await waitForPageSettled(page);

    const routeComponentRequests: string[] = [];
    page.on("request", (request) => {
      const requestUrl = new URL(request.url());

      if (
        requestUrl.searchParams.has("_rsc") ||
        request.headers().rsc === "1"
      ) {
        routeComponentRequests.push(request.url());
      }
    });

    const headerSearch = page
      .getByRole("combobox", { name: "Search groceries", exact: true })
      .filter({ visible: true });
    await headerSearch.fill("rice");
    await headerSearch.press("Enter");

    await expectCanonicalPathAndParams(page, "/search", { q: "rice" });
    await expect(page).toHaveURL(/#product-results$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: 'Search results for "rice"',
      }),
    ).toBeVisible();
    await expect(page.locator("#listing-search")).toHaveValue("rice");
    await expectAnchorBelowStickyHeader(page, page.locator("#product-results"));

    await page.goBack();
    await expectCanonicalPathAndParams(page, "/search", { q: "tea" });
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: 'Search results for "tea"',
      }),
    ).toBeVisible();
    await expect(page.locator("#listing-search")).toHaveValue("tea");

    await page.locator("#listing-search").fill("noodles");
    await page
      .locator('form[role="search"]')
      .filter({ has: page.locator("#listing-search") })
      .getByRole("button", { name: "Search", exact: true })
      .click();

    await expectCanonicalPathAndParams(page, "/search", { q: "noodles" });
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: 'Search results for "noodles"',
      }),
    ).toBeVisible();
    await expect(headerSearch).toHaveValue("noodles");
    expect(
      routeComponentRequests,
      "Same-page search submissions must not issue route-component requests",
    ).toEqual([]);
  });

  test("every listing route uses contextual shared filters", async ({ page }) => {
    const routes = [
      "/products",
      "/search?q=tea",
      "/category/vegetables",
      "/offers",
      "/featured",
      "/best-sellers",
    ];

    for (const route of routes) {
      await test.step(route, async () => {
        await page.goto(route);
        await waitForPageSettled(page);

        const sidebar = getDesktopFilterSidebar(page);
        await expect(sidebar).toBeVisible();
        await expectSingleVisibleSort(page);

        const expectedGroupNames =
          route === "/category/vegetables"
            ? [
                "Category",
                "Price",
                "Availability",
                "Offers & collections",
              ]
            : undefined;

        await expectFilterContract(sidebar, {
          groupNames: expectedGroupNames,
          mode: "desktop",
        });
        await expectFilterGroupsCollapsed(sidebar, expectedGroupNames);

        if (route === "/category/vegetables") {
          const categoryPanel = await getFilterGroupPanel(sidebar, "Category");
          await expect(categoryPanel).toContainText("Vegetables");
          await expect(categoryPanel.getByRole("combobox")).toHaveCount(0);
          await expect(
            sidebar.getByRole("checkbox", { name: "Fresh vegetables", exact: true }),
          ).toHaveCount(0);
          await expect(
            sidebar.getByRole("checkbox", { name: "Fresh products", exact: true }),
          ).toHaveCount(0);
        }

        const redundantCollectionOption =
          route === "/offers"
            ? "On sale"
            : route === "/featured"
              ? "Featured products"
              : route === "/best-sellers"
                ? "Best sellers"
                : null;

        if (redundantCollectionOption) {
          await expandFilterGroup(sidebar, "Offers & collections");
          await expect(
            sidebar.getByRole("checkbox", {
              name: redundantCollectionOption,
              exact: true,
            }),
          ).toHaveCount(0);
        }

        if (route === "/search?q=tea") {
          await expandFilterGroup(sidebar, "Offers & collections");
          await sidebar
            .getByRole("checkbox", { name: "Featured products", exact: true })
            .check();
          await expectCanonicalPathAndParams(page, "/search", {
            featured: true,
            q: "tea",
          });
        }
      });
    }
  });

  test("Featured and Best Sellers filters match their dedicated collection routes", async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName === "webkit",
      "Server-rendered collection semantics are covered once; WebKit runs the UI contract tests.",
    );

    await page.goto("/products");
    await waitForPageSettled(page);
    const allProducts = await getProductHrefs(page);

    await page.goto("/products?featured=true");
    await waitForPageSettled(page);
    await expectCanonicalPathAndParams(page, "/products", { featured: true });
    const featuredFilterProducts = await getProductHrefs(page);
    await expect(
      page
        .getByLabel("Active filters", { exact: true })
        .getByRole("button", {
          name: /^Remove Featured(?: products)? filter$/i,
        }),
    ).toBeVisible();

    await page.goto("/featured");
    await waitForPageSettled(page);
    const featuredRouteProducts = await getProductHrefs(page);

    await page.goto("/products?bestSeller=true");
    await waitForPageSettled(page);
    await expectCanonicalPathAndParams(page, "/products", { bestSeller: true });
    const bestSellerFilterProducts = await getProductHrefs(page);
    await expect(
      page
        .getByLabel("Active filters", { exact: true })
        .getByRole("button", {
          name: /^Remove Best sellers? filter$/i,
        }),
    ).toBeVisible();

    await page.goto("/best-sellers");
    await waitForPageSettled(page);
    const bestSellerRouteProducts = await getProductHrefs(page);

    expect(featuredFilterProducts.length).toBeGreaterThan(0);
    expect(bestSellerFilterProducts.length).toBeGreaterThan(0);
    expect(featuredFilterProducts).toEqual(featuredRouteProducts);
    expect(bestSellerFilterProducts).toEqual(bestSellerRouteProducts);
    expect(featuredFilterProducts).not.toEqual(bestSellerFilterProducts);
    expect(featuredFilterProducts.every((href) => allProducts.includes(href))).toBe(true);
    expect(bestSellerFilterProducts.every((href) => allProducts.includes(href))).toBe(true);
  });
});
