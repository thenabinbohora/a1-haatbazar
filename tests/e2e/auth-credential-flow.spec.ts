import { expect, test } from "@playwright/test";
import { loadLocalEnv } from "../../scripts/load-local-env";
import {
  expectPathAndParams,
  waitForPageSettled,
} from "./helpers/navigation";

loadLocalEnv();

const customerEmail = process.env.TEST_CUSTOMER_EMAIL?.trim().toLowerCase();
const customerPassword = process.env.TEST_CUSTOMER_PASSWORD;
const shouldRunCredentialFlow =
  process.env.RUN_AUTH_CREDENTIAL_TESTS === "true"
  && Boolean(customerEmail && customerPassword);

test.describe("configured customer authentication", () => {
  test("signs in, honours safe return paths, redirects authenticated visits, and signs out", async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName !== "chromium",
      "The configured account flow runs once to avoid creating duplicate server sessions.",
    );
    test.skip(
      !shouldRunCredentialFlow,
      "Set RUN_AUTH_CREDENTIAL_TESTS=true with the configured test customer to run this flow.",
    );

    await page.goto("/login?next=%2Faccount");
    await waitForPageSettled(page);

    const card = page.locator("[data-auth-form-card]");
    await card.getByLabel("Email", { exact: true }).fill(customerEmail!);
    await card.getByLabel("Password", { exact: true }).fill(customerPassword!);
    await card
      .getByRole("button", { name: "Sign in", exact: true })
      .click();

    await expectPathAndParams(page, "/account");
    await expect(
      page.getByRole("heading", { level: 1, name: /welcome back/i }),
    ).toBeVisible();

    const authenticatedDestination = "/account/orders";
    await page.goto(
      `/login?next=${encodeURIComponent(authenticatedDestination)}`,
    );
    await expectPathAndParams(page, authenticatedDestination);
    await expect(
      page.getByRole("heading", { level: 1, name: "Your orders" }),
    ).toBeVisible();

    await page.goto("/account");
    await page
      .getByText("Account menu", { exact: true })
      .click();
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expectPathAndParams(page, "/login", { success: "logout" });
    await expect(
      page.getByRole("status").filter({ hasText: "You have signed out." }),
    ).toBeVisible();
  });
});
