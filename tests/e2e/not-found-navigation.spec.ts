import { expect, test } from "@playwright/test";
import {
  expectDocumentAtTop,
  expectMainContentFocused,
  expectPathAndParams,
  waitForPageSettled,
} from "./helpers/navigation";

test("not-found actions open a valid destination at the top", async ({ page }) => {
  await page.goto("/this-route-does-not-exist-e2e");
  await waitForPageSettled(page);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "We couldn't find that page.",
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Shop groceries" }).click();
  await expectPathAndParams(page, "/products");
  await expectDocumentAtTop(page);
  await expectMainContentFocused(page);
});
