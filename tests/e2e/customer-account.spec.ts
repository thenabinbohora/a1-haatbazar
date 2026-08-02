import { createHash, randomBytes } from "node:crypto";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { loadLocalEnv } from "../../scripts/load-local-env";
import {
  expectPathAndParams,
  waitForPageSettled,
} from "./helpers/navigation";

loadLocalEnv();

const customerEmail = process.env.TEST_CUSTOMER_EMAIL?.trim().toLowerCase();
const customerPassword = process.env.TEST_CUSTOMER_PASSWORD;
const shouldRunCredentialFlow =
  process.env.RUN_AUTH_CREDENTIAL_TESTS === "true" &&
  Boolean(customerEmail && customerPassword);

const protectedRoutes = [
  "/account",
  "/account/orders",
  "/account/addresses",
  "/account/profile",
  "/account/security",
  "/wishlist",
] as const;

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/login?next=%2Faccount");
  const card = page.locator("[data-auth-form-card]");
  await card.getByLabel("Email", { exact: true }).fill(customerEmail!);
  await card.getByLabel("Password", { exact: true }).fill(customerPassword!);
  await card
    .getByRole("button", { name: "Sign in", exact: true })
    .click();
  await expectPathAndParams(page, "/account");
}

async function createCustomerSession(page: Page, context: BrowserContext) {
  test.skip(!customerEmail, "A configured customer email is required.");
  await page.goto("/login");
  const rawToken = randomBytes(32).toString("base64url");
  const sessionToken = createHash("sha256").update(rawToken).digest("hex");
  const { prisma } = await import("../../src/lib/prisma");
  const customer = await prisma.user.findFirst({
    select: { id: true },
    where: { email: customerEmail!, role: "CUSTOMER", status: "ACTIVE" },
  });

  test.skip(!customer, "The configured customer record does not exist.");

  await prisma.session.create({
    data: {
      expires: new Date(Date.now() + 60 * 60 * 1000),
      sessionToken,
      userId: customer!.id,
    },
  });
  await context.addCookies([
    {
      httpOnly: true,
      name: "gsp_session",
      sameSite: "Lax",
      url: new URL(page.url()).origin,
      value: rawToken,
    },
  ]);

  return async () => {
    await prisma.session.deleteMany({ where: { sessionToken } });
  };
}

test.describe("customer account access", () => {
  test("every customer account route redirects an anonymous visitor safely", async ({
    page,
  }) => {
    for (const route of protectedRoutes) {
      await test.step(route, async () => {
        await page.context().clearCookies();
        await page.goto(route);
        await expectPathAndParams(page, "/login", { next: route });
        await expect(
          page.getByRole("heading", {
            level: 1,
            name: "Sign in to your account",
          }),
        ).toBeVisible();
      });
    }
  });

  test("the authenticated shell separates customer identity and remains responsive", async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName !== "chromium",
      "The configured account flow runs once to avoid duplicate sessions.",
    );
    test.skip(
      !shouldRunCredentialFlow,
      "Set RUN_AUTH_CREDENTIAL_TESTS=true with the configured test customer.",
    );

    await signIn(page);
    await waitForPageSettled(page);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(
      page.getByRole("navigation", {
        name: "Customer account",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByText("Demo Admin", { exact: true })).toHaveCount(0);
    await expect(page.getByText("admin@example.com", { exact: true })).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("link", { name: "Overview", exact: true }),
    ).toHaveAttribute("aria-current", "page");

    for (const viewport of [
      { height: 568, width: 320 },
      { height: 844, width: 390 },
      { height: 900, width: 768 },
      { height: 768, width: 1024 },
      { height: 900, width: 1440 },
    ]) {
      await test.step(`${viewport.width}x${viewport.height}`, async () => {
        await page.setViewportSize(viewport);
        await expect
          .poll(() =>
            page.evaluate(
              () =>
                document.documentElement.scrollWidth -
                document.documentElement.clientWidth,
            ),
          )
          .toBeLessThanOrEqual(1);

        if (viewport.width < 1024) {
          await expect(
            page.getByRole("navigation", { name: "Account quick actions" }),
          ).toBeVisible();
          await expect(
            page.getByRole("navigation", { name: "Bottom navigation" }),
          ).toBeVisible();
        } else {
          await expect(
            page.getByRole("navigation", {
              name: "Customer account",
              exact: true,
            }),
          ).toBeVisible();
        }
      });
    }

    await page.setViewportSize({ height: 844, width: 390 });
    await page
      .getByRole("navigation", { name: "Account quick actions" })
      .getByRole("link", { name: "Orders", exact: true })
      .click();
    await expectPathAndParams(page, "/account/orders");
    await expect(
      page.getByRole("heading", { level: 1, name: "Your orders" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to account", exact: true }),
    ).toBeVisible();

    await page.goto("/account/orders/this-order-does-not-exist");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "We couldn't find that page.",
      }),
    ).toBeVisible();
  });

  test("the account menu dismisses predictably across pointer, keyboard, navigation, and mobile use", async ({
    browserName,
    context,
    page,
  }) => {
    test.skip(
      browserName !== "chromium",
      "The configured account flow runs once to avoid duplicate sessions.",
    );
    const cleanup = await createCustomerSession(page, context);

    try {
      await page.goto("/account");
      const trigger = page.getByRole("button", { name: "Account menu" });

      await trigger.click();
      const menu = page.getByRole("dialog", { name: "Account menu" });
      await expect(menu).toBeVisible();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(
        menu.getByRole("link", { name: "Edit profile" }),
      ).toBeFocused();

      await menu.dispatchEvent("pointerdown", { button: 0, pointerType: "mouse" });
      await expect(menu).toBeVisible();

      await page.getByRole("heading", { level: 1 }).click();
      await expect(menu).toBeHidden();
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(
        await page.evaluate(() => ({
          overflow: document.body.style.overflow,
          position: document.body.style.position,
        })),
      ).toEqual({ overflow: "", position: "" });

      await trigger.click();
      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();

      await trigger.click();
      await page.getByRole("search").getByRole("combobox").click();
      await expect(menu).toBeHidden();
      await expect(page.getByText("Quick searches", { exact: true })).toBeVisible();
      await page.keyboard.press("Escape");

      await page.setViewportSize({ height: 844, width: 390 });
      await trigger.click();
      await expect(menu).toBeVisible();
      const mobileGeometry = await Promise.all([
        menu.boundingBox(),
        page.getByRole("navigation", { name: "Bottom navigation" }).boundingBox(),
      ]);
      expect(mobileGeometry[0]).not.toBeNull();
      expect(mobileGeometry[1]).not.toBeNull();
      expect(mobileGeometry[0]!.y + mobileGeometry[0]!.height).toBeLessThanOrEqual(
        mobileGeometry[1]!.y,
      );

      await page.getByRole("link", { name: "Continue shopping" }).click();
      await expectPathAndParams(page, "/products");
      await expect(menu).toBeHidden();

      await page.goto("/account");
      await trigger.click();
      await menu.getByRole("link", { name: "Edit profile" }).click();
      await expectPathAndParams(page, "/account/profile");
      await expect(menu).toBeHidden();

      await page.goto("/account");
      await trigger.click();
      await menu.getByRole("link", { name: "Security" }).click();
      await expectPathAndParams(page, "/account/security");
      await expect(menu).toBeHidden();

      await page.goto("/account");
      await trigger.click();
      await menu.getByRole("button", { name: "Sign out" }).click();
      await expectPathAndParams(page, "/login", { success: "logout" });
      await expect(menu).toBeHidden();
    } finally {
      await cleanup();
    }
  });
});
