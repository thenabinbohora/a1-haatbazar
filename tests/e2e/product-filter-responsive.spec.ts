import { expect, test } from "@playwright/test";
import { expectBodyUnlocked, waitForPageSettled } from "./helpers/navigation";
import {
  DESKTOP_FILTER_BREAKPOINT,
  PRODUCT_LISTING_WIDTHS,
  engageDesktopStickySidebar,
  expandFilterGroups,
  expectFilterContentContained,
  expectFilterContract,
  expectFilterGroupsCollapsed,
  expectLocatorWithinViewport,
  expectMobileFilterActionsUsable,
  expectNoDocumentHorizontalOverflow,
  expectSingleVisibleSort,
  getDesktopFilterSidebar,
  getMobileFilterTrigger,
  getVisibleSortSelect,
  openMobileFilterDialog,
  settleResponsiveLayout,
} from "./helpers/product-listing";

test("product filters remain contained across the complete responsive listing matrix", async ({
  browserName,
  page,
}) => {
  test.skip(
    browserName !== "chromium",
    "The full resize matrix runs once; WebKit covers mobile and desktop filter behavior.",
  );

  await page.goto("/products");
  await waitForPageSettled(page);

  for (const width of PRODUCT_LISTING_WIDTHS) {
    await test.step(`${width}px at 100% zoom`, async () => {
      await page.setViewportSize({
        height: width === 320 ? 568 : width <= 430 ? 720 : 900,
        width,
      });
      await settleResponsiveLayout(page);

      await expectNoDocumentHorizontalOverflow(page);
      await expectSingleVisibleSort(page);
      await expectLocatorWithinViewport(
        getVisibleSortSelect(page),
        "the visible product sort control",
      );

      if (width < DESKTOP_FILTER_BREAKPOINT) {
        const filterTrigger = getMobileFilterTrigger(page);
        await expect(filterTrigger).toHaveCount(1);
        await expect(getDesktopFilterSidebar(page)).toHaveCount(0);
        await expectLocatorWithinViewport(filterTrigger, "the mobile Filters button");

        const toolbarGeometry = await Promise.all([
          filterTrigger.boundingBox(),
          getVisibleSortSelect(page).boundingBox(),
        ]);
        expect(toolbarGeometry[0]?.height ?? 0).toBeGreaterThanOrEqual(44);
        expect(toolbarGeometry[1]?.height ?? 0).toBeGreaterThanOrEqual(44);
        expect(toolbarGeometry[0]?.x ?? 0).toBeGreaterThanOrEqual(0);
        expect(
          (toolbarGeometry[0]?.x ?? 0) + (toolbarGeometry[0]?.width ?? 0),
        ).toBeLessThanOrEqual((toolbarGeometry[1]?.x ?? 0) + 1);

        const { dialog } = await openMobileFilterDialog(page);
        await expectFilterGroupsCollapsed(dialog);
        await expandFilterGroups(dialog);
        await expectFilterContract(dialog, { mode: "mobile" });
        await expectFilterContentContained(dialog);
        await expectMobileFilterActionsUsable(dialog);

        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expectBodyUnlocked(page);
      } else {
        await expect(getMobileFilterTrigger(page)).toHaveCount(0);
        const sidebar = getDesktopFilterSidebar(page);
        await expect(sidebar).toHaveCount(1);

        if (width === DESKTOP_FILTER_BREAKPOINT) {
          await expectFilterGroupsCollapsed(sidebar);
        }

        const toolbar = page.locator("[data-product-results-toolbar]");
        const resultCount = toolbar.locator('[aria-live="polite"]').filter({ visible: true });
        const sort = getVisibleSortSelect(page);
        await expect(toolbar).toHaveCount(1);
        await expect(toolbar).toBeVisible();
        await expect(resultCount).toHaveCount(1);

        const [toolbarBox, resultCountBox, sortBox] = await Promise.all([
          toolbar.boundingBox(),
          resultCount.boundingBox(),
          sort.boundingBox(),
        ]);

        if (!toolbarBox || !resultCountBox || !sortBox) {
          throw new Error("Expected measurable desktop product-toolbar geometry");
        }

        expect(toolbarBox.height).toBeLessThanOrEqual(60);
        expect(sortBox.width).toBeLessThanOrEqual(256);
        expect(sortBox.height).toBe(44);
        expect(
          Math.abs(
            resultCountBox.y +
              resultCountBox.height / 2 -
              (sortBox.y + sortBox.height / 2),
          ),
        ).toBeLessThanOrEqual(1);

        await engageDesktopStickySidebar(page, sidebar);
        await expandFilterGroups(sidebar);
        await expectFilterContract(sidebar, { mode: "desktop" });
        await expectFilterContentContained(sidebar);
      }

      await expectNoDocumentHorizontalOverflow(page);
    });
  }
});
