import { expect, type Locator, type Page } from "@playwright/test";

export const PRODUCT_LISTING_WIDTHS = [
  320, 360, 375, 390, 412, 430, 540, 768, 1024, 1280, 1440, 1536,
] as const;

export const DESKTOP_FILTER_BREAKPOINT = 1024;

export const FILTER_GROUP_NAMES = [
  "Category",
  "Brand",
  "Price",
  "Availability",
  "Offers & collections",
] as const;

export const SORT_VALUES = [
  "recommended",
  "newest",
  "price-asc",
  "price-desc",
  "best-selling",
  "biggest-saving",
] as const;

type QueryValue = boolean | number | string | undefined;

const QUERY_PARAMETER_ORDER = [
  "q",
  "category",
  "brand",
  "minPrice",
  "maxPrice",
  "inStock",
  "sale",
  "featured",
  "bestSeller",
  "sort",
] as const;

function compareQueryEntries(
  [firstKey, firstValue]: readonly [string, string],
  [secondKey, secondValue]: readonly [string, string],
) {
  const firstIndex = QUERY_PARAMETER_ORDER.indexOf(
    firstKey as (typeof QUERY_PARAMETER_ORDER)[number],
  );
  const secondIndex = QUERY_PARAMETER_ORDER.indexOf(
    secondKey as (typeof QUERY_PARAMETER_ORDER)[number],
  );
  const resolvedFirstIndex = firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex;
  const resolvedSecondIndex = secondIndex === -1 ? Number.MAX_SAFE_INTEGER : secondIndex;

  return (
    resolvedFirstIndex - resolvedSecondIndex ||
    firstKey.localeCompare(secondKey) ||
    firstValue.localeCompare(secondValue)
  );
}

function sortedQueryEntries(parameters: Record<string, QueryValue>) {
  return Object.entries(parameters)
    .filter((entry): entry is [string, Exclude<QueryValue, undefined>] => entry[1] !== undefined)
    .map(([key, value]) => [key, String(value)] as const)
    .sort(compareQueryEntries);
}

export async function expectCanonicalPathAndParams(
  page: Page,
  pathname: string,
  parameters: Record<string, QueryValue> = {},
  timeout = 10_000,
) {
  const expectedEntries = sortedQueryEntries(parameters);

  await expect
    .poll(
      () => {
        const currentUrl = new URL(page.url());
        const entries = Array.from(currentUrl.searchParams.entries());
        const keys = entries.map(([key]) => key);

        return {
          duplicateKeys: keys.filter((key, index) => keys.indexOf(key) !== index),
          entries,
          pathname: currentUrl.pathname,
        };
      },
      {
        message: `Expected one canonical set of query parameters at ${pathname}`,
        timeout,
      },
    )
    .toEqual({
      duplicateKeys: [],
      entries: expectedEntries,
      pathname,
    });
}

export function getVisibleSortSelect(page: Page) {
  return page
    .getByRole("combobox", { name: "Sort by", exact: true })
    .filter({ visible: true });
}

export async function expectSingleVisibleSort(page: Page) {
  const allSortSelects = page.locator("select[data-product-sort]");

  await expect(allSortSelects).toHaveCount(1);
  await expect(allSortSelects).toBeVisible();
  await expect(getVisibleSortSelect(page)).toHaveCount(1);
}

export async function expectSortContract(page: Page) {
  const sort = getVisibleSortSelect(page);

  await expectSingleVisibleSort(page);
  await expect
    .poll(() =>
      sort.evaluate((select) =>
        Array.from((select as HTMLSelectElement).options).map((option) => option.value),
      ),
    )
    .toEqual([...SORT_VALUES]);
}

export function getDesktopFilterSidebar(page: Page) {
  return page
    .getByRole("complementary", { name: "Product filters", exact: true })
    .filter({ visible: true });
}

export function getMobileFilterTrigger(page: Page) {
  return page.locator("button[data-product-filter-trigger]").filter({ visible: true });
}

export async function engageDesktopStickySidebar(page: Page, sidebar: Locator) {
  await expect(sidebar, "Expected the desktop filter sidebar to be visible").toBeVisible();
  await sidebar.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const stickyTop = Number.parseFloat(getComputedStyle(element).top) || 0;
    window.scrollBy({
      behavior: "instant",
      top: Math.max(0, rect.top - stickyTop + 2),
    });
  });
  await settleResponsiveLayout(page);

  await expect
    .poll(() =>
      sidebar.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const stickyTop = Number.parseFloat(getComputedStyle(element).top) || 0;
        return Math.abs(rect.top - stickyTop) <= 1;
      }),
    )
    .toBe(true);
}

export async function openMobileFilterDialog(page: Page) {
  const trigger = getMobileFilterTrigger(page);

  await expect(trigger).toHaveCount(1);
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  const dialog = page.getByRole("dialog", { name: "Filters", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");

  return { dialog, trigger };
}

export async function expandFilterGroups(scope: Locator) {
  for (const name of FILTER_GROUP_NAMES) {
    const trigger = getFilterGroupTrigger(scope, name);

    if (await trigger.count()) {
      await expandFilterGroup(scope, name);
    }
  }
}

export function getFilterGroupTrigger(scope: Locator, name: string) {
  return scope
    .getByRole("button", { name: new RegExp(`^${name}$`, "i") })
    .first();
}

export async function getFilterGroupPanel(scope: Locator, name: string) {
  const trigger = getFilterGroupTrigger(scope, name);
  await expect(trigger, `Expected the ${name} filter-group trigger`).toBeAttached();
  const panelId = await trigger.getAttribute("aria-controls");

  if (!panelId) {
    throw new Error(`The ${name} filter-group trigger does not reference its content`);
  }

  return scope.locator(`[id=${JSON.stringify(panelId)}]`);
}

export async function expandFilterGroup(scope: Locator, name: string) {
  const trigger = getFilterGroupTrigger(scope, name);
  await expect(trigger, `Expected the ${name} filter-group trigger`).toBeAttached();
  await expect(trigger).toHaveAttribute("aria-expanded", /^(?:true|false)$/);

  if ((await trigger.getAttribute("aria-expanded")) === "false") {
    await trigger.click();
  }

  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const panel = await getFilterGroupPanel(scope, name);
  await expect(panel, `Expected the ${name} filter-group panel to open`).toBeVisible();

  return panel;
}

export async function expectFilterGroupsCollapsed(
  scope: Locator,
  groupNames: readonly string[] = FILTER_GROUP_NAMES,
) {
  for (const name of groupNames) {
    const trigger = getFilterGroupTrigger(scope, name);
    await expect(
      trigger,
      `Expected the ${name} filter-group trigger to start collapsed`,
    ).toHaveAttribute("aria-expanded", "false");
    const panel = await getFilterGroupPanel(scope, name);
    await expect(panel, `Expected the ${name} filter-group panel`).toBeAttached();
    await expect(panel, `Expected the ${name} filter-group panel to start hidden`).toBeHidden();
  }
}

export async function expectFilterContract(
  scope: Locator,
  options: {
    groupNames?: readonly string[];
    mode: "desktop" | "mobile";
  },
) {
  const groupNames = options.groupNames ?? FILTER_GROUP_NAMES;
  await expect(scope).toBeVisible();

  for (const name of groupNames) {
    await expect(
      getFilterGroupTrigger(scope, name),
      `Expected the ${name} filter-group heading`,
    ).toBeAttached();
  }

  await expect(scope.getByLabel("Minimum price", { exact: true })).toBeAttached();
  await expect(scope.getByLabel("Maximum price", { exact: true })).toBeAttached();
  await expect(
    scope
      .getByRole("combobox", { name: "Sort by", exact: true })
      .filter({ visible: true }),
  ).toHaveCount(0);

  if (options.mode === "mobile") {
    await expect(
      scope.getByRole("button", { name: "Apply filters", exact: true }),
    ).toBeVisible();
    await expect(
      scope.getByRole("button", { name: "Clear all", exact: true }),
    ).toBeVisible();
  }
}

export async function expectNoDocumentHorizontalOverflow(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          scale: window.visualViewport?.scale ?? 1,
        })),
      { message: "Expected 100% zoom and no document-level horizontal overflow" },
    )
    .toEqual({
      overflow: 0,
      scale: 1,
    });
}

export async function expectLocatorWithinViewport(locator: Locator, label: string) {
  await expect(locator, `Expected ${label} to be visible`).toBeVisible();
  await expect
    .poll(
      () =>
        locator.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const viewport = window.visualViewport;
          const left = viewport?.offsetLeft ?? 0;
          const top = viewport?.offsetTop ?? 0;
          const right = left + (viewport?.width ?? window.innerWidth);
          const bottom = top + (viewport?.height ?? window.innerHeight);
          const normalizeOverflow = (value: number) =>
            value <= 1 ? 0 : Math.round(value * 100) / 100;

          return {
            bottomOverflow: normalizeOverflow(rect.bottom - bottom),
            leftOverflow: normalizeOverflow(left - rect.left),
            rightOverflow: normalizeOverflow(rect.right - right),
            topOverflow: normalizeOverflow(top - rect.top),
          };
        }),
      { message: `Expected ${label} to remain inside the visual viewport` },
    )
    .toEqual({
      bottomOverflow: 0,
      leftOverflow: 0,
      rightOverflow: 0,
      topOverflow: 0,
    });
}

export async function expectNoInternalHorizontalOverflow(locator: Locator, label: string) {
  await expect(locator, `Expected ${label} to be visible`).toBeVisible();
  await expect
    .poll(
      () =>
        locator.evaluate((element) => {
          const scrollDelta = Math.max(0, element.scrollWidth - element.clientWidth);
          return {
            contained: scrollDelta <= 1,
            scrollDelta: scrollDelta <= 1 ? 0 : scrollDelta,
          };
        }),
      { message: `Expected ${label} not to overflow horizontally` },
    )
    .toEqual({ contained: true, scrollDelta: 0 });
}

export async function expectFilterContentContained(scope: Locator) {
  await expectLocatorWithinViewport(scope, "the product filter surface");
  await expectNoInternalHorizontalOverflow(scope, "the product filter surface");

  for (const name of FILTER_GROUP_NAMES) {
    const trigger = getFilterGroupTrigger(scope, name);

    if ((await trigger.count()) && (await trigger.isVisible())) {
      await expectNoInternalHorizontalOverflow(
        trigger,
        `the ${name} filter-group heading`,
      );
      const panel = await getFilterGroupPanel(scope, name);

      if (await panel.isVisible()) {
        await expectNoInternalHorizontalOverflow(panel, `the ${name} filter group`);
        const semanticGroups = panel.getByRole("group").filter({ visible: true });

        for (let index = 0; index < (await semanticGroups.count()); index += 1) {
          await expectNoInternalHorizontalOverflow(
            semanticGroups.nth(index),
            `fieldset ${index + 1} in the ${name} filter group`,
          );
        }
      }
    }
  }
}

export async function expectMobileFilterActionsUsable(dialog: Locator) {
  for (const name of ["Clear all", "Apply filters"]) {
    const button = dialog.getByRole("button", { name, exact: true });
    await expect(button).toBeVisible();
    await expect
      .poll(async () => (await button.boundingBox())?.height ?? 0)
      .toBeGreaterThanOrEqual(48);
    await expectLocatorWithinViewport(button, `${name} action`);
  }
}

export async function expectFocusInside(scope: Locator) {
  await expect
    .poll(
      () =>
        scope.evaluate((element) => {
          const activeElement = document.activeElement;
          return activeElement instanceof HTMLElement && element.contains(activeElement);
        }),
      { message: "Expected keyboard focus to remain inside the filter dialog" },
    )
    .toBe(true);
}

export function getProductCards(page: Page) {
  return page.locator("#product-results article");
}

export async function getProductHrefs(page: Page) {
  return page
    .locator('#product-results article a[aria-label^="View "]')
    .evaluateAll((links) =>
      Array.from(
        new Set(
          links
            .map((link) => link.getAttribute("href"))
            .filter((href): href is string => Boolean(href)),
        ),
      ).sort(),
    );
}

export async function displayedProductPrices(page: Page) {
  return getProductCards(page).evaluateAll((cards) =>
    cards.map((card) => {
      const value = (card as HTMLElement).dataset.startingPrice;
      const price = Number(value);

      if (!value || !Number.isFinite(price)) {
        throw new Error("A product card is missing its displayed starting-price value.");
      }

      return price;
    }),
  );
}

export async function expectDisplayedPricesSorted(
  page: Page,
  direction: "ascending" | "descending",
) {
  await expect(page.locator("#product-results-grid")).not.toHaveAttribute(
    "aria-busy",
    "true",
  );
  await settleResponsiveLayout(page);
  await expect(getProductCards(page).first()).toBeVisible();
  const prices = await displayedProductPrices(page);
  const sorted = [...prices].sort((first, second) =>
    direction === "ascending" ? first - second : second - first,
  );

  expect(prices).toEqual(sorted);
}

export async function settleResponsiveLayout(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
  });
}
