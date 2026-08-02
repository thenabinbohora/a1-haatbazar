import { createHash, randomBytes } from "node:crypto";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { loadLocalEnv } from "../../scripts/load-local-env";
import { waitForPageSettled } from "./helpers/navigation";

loadLocalEnv();

const adminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
const adminViewports = [
  { height: 568, width: 320 },
  { height: 640, width: 360 },
  { height: 667, width: 375 },
  { height: 844, width: 390 },
  { height: 915, width: 412 },
  { height: 932, width: 430 },
  { height: 720, width: 540 },
  { height: 1024, width: 768 },
  { height: 768, width: 1024 },
  { height: 650, width: 1280 },
  { height: 900, width: 1440 },
  { height: 864, width: 1536 },
  { height: 1080, width: 1920 },
];

async function createAdminSession(page: Page, context: BrowserContext) {
  test.skip(!adminEmail, "A configured administrator email is required.");
  await page.goto("/admin/login");
  const rawToken = randomBytes(32).toString("base64url");
  const sessionToken = createHash("sha256").update(rawToken).digest("hex");
  const { prisma } = await import("../../src/lib/prisma");
  const admin = await prisma.user.findUnique({
    select: { id: true },
    where: { email: adminEmail! },
  });

  test.skip(!admin, "The configured administrator record does not exist.");

  await prisma.session.create({
    data: {
      expires: new Date(Date.now() + 60 * 60 * 1000),
      sessionToken,
      userId: admin!.id,
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

test.describe("admin operations dashboard", () => {
  test("protects the dashboard and admin search from anonymous requests", async ({
    page,
    request,
  }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login$/);

    const response = await request.get("/api/admin/search?q=rice");
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      error: "Admin authentication required.",
    });
  });

  test("renders real operational structure, range controls, and protected search", async ({
    context,
    page,
  }) => {
    const cleanup = await createAdminSession(page, context);

    try {
      await page.goto("/admin/dashboard");
      await waitForPageSettled(page);

      await expect(
        page.getByRole("heading", { level: 1, name: "Dashboard" }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Dashboard", exact: true }),
      ).toHaveAttribute("aria-current", "page");
      await expect(page.getByText("Revenue · Last 30 days")).toBeVisible();
      await expect(page.getByText("Average order value")).toBeVisible();
      await expect(page.getByText("Pending fulfilment")).toBeVisible();
      await expect(page.getByText("Low stock", { exact: true })).toBeVisible();
      await expect(page.getByText("Out of stock", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: /export/i })).toHaveCount(0);

      await page.getByRole("link", { name: "Previous month" }).click();
      await expect(page).toHaveURL(/range=previous-month/);
      await expect(page.getByText("Revenue · Previous month")).toBeVisible();
      await expect(
        page
          .getByRole("img", { name: /chart for Previous month/i })
          .or(page.getByText("Not enough sales history yet")),
      ).toBeVisible();

      await page.keyboard.press("Control+K");
      const dialog = page.getByRole("dialog", { name: "Admin search" });
      await expect(dialog).toBeVisible();
      await dialog
        .getByLabel("Search products, orders, categories, or coupons")
        .fill("A1HB");
      await expect(dialog.getByText("Order", { exact: true })).toBeVisible();

      const searchPayload = await page.evaluate(async () => {
        const response = await fetch("/api/admin/search?q=A1HB");
        return {
          body: (await response.json()) as {
            results: Array<Record<string, unknown>>;
          },
          status: response.status,
        };
      });
      expect(searchPayload.status).toBe(200);
      expect(
        searchPayload.body.results.every(
          (result) =>
            !("customerEmail" in result) &&
            !("customerPhone" in result) &&
            !("address" in result),
        ),
      ).toBe(true);
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);

      await page.getByText("Create", { exact: true }).click();
      await expect(
        page.locator("header").getByRole("link", { name: "Add product" }),
      ).toBeVisible();
    } finally {
      await cleanup();
    }
  });

  test("uses accessible mobile navigation and responsive order cards without overflow", async ({
    context,
    page,
  }) => {
    const cleanup = await createAdminSession(page, context);

    try {
      await page.setViewportSize({ height: 844, width: 390 });
      await page.goto("/admin/dashboard?range=previous-month");
      await waitForPageSettled(page);

      await page.getByRole("button", { name: "Open admin navigation" }).click();
      const drawer = page.getByRole("dialog", { name: "Admin navigation" });
      await expect(drawer).toBeVisible();
      await expect(
        drawer.getByRole("link", { name: "Dashboard", exact: true }),
      ).toHaveAttribute("aria-current", "page");
      await page.keyboard.press("Escape");
      await expect(drawer).toHaveCount(0);

      await expect(
        page.getByRole("link", { name: /View order/i }).first(),
      ).toBeVisible();
      const layout = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      }));
      expect(layout.scrollWidth - layout.clientWidth).toBeLessThanOrEqual(1);
    } finally {
      await cleanup();
    }
  });

  test("keeps the admin shell and KPI grid contained across the required viewport matrix", async ({
    browserName,
    context,
    page,
  }) => {
    test.skip(browserName !== "chromium", "The full resize matrix runs once.");
    const cleanup = await createAdminSession(page, context);

    try {
      await page.goto("/admin/dashboard");
      await waitForPageSettled(page);

      for (const viewport of adminViewports) {
        await test.step(`${viewport.width}x${viewport.height}`, async () => {
          await page.setViewportSize(viewport);

          const state = await page.evaluate(() => {
            const metricCards = Array.from(
              document.querySelectorAll<HTMLElement>(
                '[aria-label="Dashboard metrics"] > a',
              ),
            );

            return {
              cards: metricCards.map((card) => {
                const bounds = card.getBoundingClientRect();
                return {
                  left: bounds.left,
                  right: bounds.right,
                  scrollWidth: card.scrollWidth,
                  width: bounds.width,
                };
              }),
              clientWidth: document.documentElement.clientWidth,
              scrollWidth: document.documentElement.scrollWidth,
            };
          });

          expect(state.scrollWidth - state.clientWidth).toBeLessThanOrEqual(1);
          expect(state.cards).toHaveLength(6);

          for (const card of state.cards) {
            expect(card.left).toBeGreaterThanOrEqual(0);
            expect(card.right).toBeLessThanOrEqual(state.clientWidth + 1);
            expect(card.scrollWidth - card.width).toBeLessThanOrEqual(1);
          }

          if (viewport.width < 1024) {
            await expect(
              page.getByRole("button", { name: "Open admin navigation" }),
            ).toBeVisible();
          } else {
            await expect(
              page.getByRole("button", { name: /sidebar/i }),
            ).toBeVisible();
          }
        });
      }
    } finally {
      await cleanup();
    }
  });

  test("supports sidebar collapse, quick links, and server-side sign out", async ({
    browserName,
    context,
    page,
  }) => {
    test.skip(browserName !== "chromium", "The destructive sign-out path runs once.");
    const cleanup = await createAdminSession(page, context);

    try {
      await page.goto("/admin/dashboard");
      const topAccountMenu = page
        .getByLabel("Open administrator account menu")
        .last();
      await topAccountMenu.click();
      const accountPopover = page.getByRole("dialog", {
        name: "Open administrator account menu",
      });
      await expect(accountPopover).toBeVisible();
      await page.locator("#main-content").click({ position: { x: 12, y: 12 } });
      await expect(accountPopover).toBeHidden();

      await topAccountMenu.click();
      await page.keyboard.press("Escape");
      await expect(accountPopover).toBeHidden();
      await expect(topAccountMenu).toBeFocused();

      await topAccountMenu.click();
      await page.getByRole("button", { name: "Create menu" }).click();
      await expect(accountPopover).toBeHidden();
      await expect(page.getByRole("dialog", { name: "Create menu" })).toBeVisible();
      await page.keyboard.press("Escape");

      const collapse = page.getByRole("button", { name: "Collapse sidebar" });
      await collapse.click();
      await expect(
        page.getByRole("button", { name: "Expand sidebar" }),
      ).toBeVisible();
      expect(
        await page.evaluate(() =>
          window.localStorage.getItem("a1-admin-sidebar-collapsed"),
        ),
      ).toBe("true");

      const accountMenu = page.getByLabel("Open administrator account menu").last();
      await accountMenu.click();
      await page.getByRole("button", { name: "Sign out" }).last().click();
      await expect(page).toHaveURL(/\/admin\/login$/);
    } finally {
      await cleanup();
    }
  });
});
