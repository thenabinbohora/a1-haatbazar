import { createHash, randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import { loadLocalEnv } from "../../scripts/load-local-env";
import { waitForPageSettled } from "./helpers/navigation";

loadLocalEnv();

const adminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.INITIAL_ADMIN_PASSWORD;
const customerEmail = process.env.TEST_CUSTOMER_EMAIL?.trim().toLowerCase();
const customerPassword = process.env.TEST_CUSTOMER_PASSWORD;
const runCredentialTests =
  process.env.RUN_AUTH_CREDENTIAL_TESTS === "true"
  && Boolean(adminEmail && adminPassword);

function adminCard(page: import("@playwright/test").Page) {
  return page.locator("[data-admin-login-card]");
}

test.describe("administrator authentication experience", () => {
  test("keeps the admin console server protected", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Admin sign in" }),
    ).toBeVisible();
  });

  test("uses a dedicated lightweight shell with empty autofill-compatible fields", async ({
    page,
  }) => {
    const unrelatedRequests: string[] = [];

    page.on("request", (request) => {
      if (
        /\/(?:api\/)?(?:products|categories|wishlist|cart)(?:[/?]|$)/i.test(
          request.url(),
        )
        || /product-images|googleapis\.com\/maps/i.test(request.url())
      ) {
        unrelatedRequests.push(request.url());
      }
    });

    await page.goto("/admin/login");
    await waitForPageSettled(page);

    await expect(
      page.getByRole("heading", { level: 1, name: "Admin sign in" }),
    ).toBeVisible();
    await expect(
      page.getByText("Use your authorised administrator account to access store operations."),
    ).toBeVisible();
    await expect(page.getByText(/safe seed command/i)).toHaveCount(0);
    await expect(page.getByText("admin@example.com")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /storefront/i }).first()).toBeVisible();

    const email = adminCard(page).getByLabel("Email", { exact: true });
    const password = adminCard(page).getByLabel("Password", { exact: true });
    await expect(email).toHaveValue("");
    await expect(email).toHaveAttribute("autocomplete", "username");
    await expect(email).toHaveAttribute("inputmode", "email");
    await expect(password).toHaveAttribute("autocomplete", "current-password");
    await expect(password).toHaveAttribute("type", "password");

    const passwordHandle = await password.elementHandle();
    await adminCard(page).getByRole("button", { name: "Show password" }).click();
    await expect(password).toHaveAttribute("type", "text");
    expect(
      await password.evaluate(
        (node, originalNode) => node === originalNode,
        passwordHandle,
      ),
    ).toBe(true);
    await adminCard(page).getByRole("button", { name: "Hide password" }).click();
    await expect(password).toHaveAttribute("type", "password");
    expect(unrelatedRequests).toEqual([]);
  });

  test("validates an empty form without adding an error query", async ({ page }) => {
    await page.goto("/admin/login");
    await adminCard(page)
      .getByRole("button", { name: "Sign in securely" })
      .click();

    await expect(adminCard(page).getByRole("alert")).toContainText(
      "Check the highlighted fields and try again.",
    );
    await expect(adminCard(page).getByLabel("Email", { exact: true })).toBeFocused();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("keeps invalid credential errors generic and clears the alert while correcting", async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName !== "chromium",
      "One password-hash attempt is enough; the other projects cover static form behaviour.",
    );

    await page.goto("/admin/login");
    const card = adminCard(page);
    await card.getByLabel("Email", { exact: true }).fill("unknown-admin@example.invalid");
    await card.getByLabel("Password", { exact: true }).fill("Not-The-Password-2026!");
    await card.getByRole("button", { name: "Sign in securely" }).click();

    await expect(card.getByRole("button", { name: "Signing in\u2026" })).toBeDisabled();
    await expect(card.getByRole("alert")).toContainText(
      "The email or password was not recognised.",
    );
    await expect(page).toHaveURL(/\/admin\/login$/);

    await card.getByLabel("Email", { exact: true }).press("End");
    await card.getByLabel("Email", { exact: true }).type("x");
    await expect(card.getByRole("alert")).toHaveCount(0);
  });

  test("normalises unsafe next destinations and preserves safe admin destinations", async ({
    page,
  }) => {
    await page.goto("/admin/login?next=https%3A%2F%2Fevil.example%2Fcollect");
    await expect(adminCard(page).locator('input[name="next"]')).toHaveValue("/admin");

    await page.goto("/admin/login?next=%2Fadmin%2Forders%3Fstatus%3DPENDING");
    await expect(adminCard(page).locator('input[name="next"]')).toHaveValue(
      "/admin/orders?status=PENDING",
    );
  });

  test("presents the dedicated session-expired state", async ({ page }) => {
    await page.goto("/admin/login?status=session-expired");
    await expect(page.getByRole("status")).toContainText(
      "Your admin session has expired. Sign in again to continue securely.",
    );
  });

  test("redirects an expired admin session to the dedicated state", async ({
    context,
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "The database-backed expiry flow runs once.",
    );
    test.skip(!adminEmail, "A configured administrator email is required.");

    await page.goto("/admin/login");
    const origin = new URL(page.url()).origin;
    const rawToken = randomBytes(32).toString("base64url");
    const sessionToken = createHash("sha256").update(rawToken).digest("hex");
    const { prisma } = await import("../../src/lib/prisma");
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail! },
      select: { id: true },
    });

    test.skip(!admin, "The configured administrator record does not exist.");

    await prisma.session.create({
      data: {
        expires: new Date(Date.now() - 60_000),
        sessionToken,
        userId: admin!.id,
      },
    });

    try {
      await context.addCookies([
        {
          httpOnly: true,
          name: "gsp_session",
          sameSite: "Lax",
          url: origin,
          value: rawToken,
        },
      ]);
      await page.goto("/admin");
      await expect(page).toHaveURL(
        /\/admin\/login\?status=session-expired$/,
      );
      await expect(page.getByRole("status")).toContainText(
        "Your admin session has expired. Sign in again to continue securely.",
      );
    } finally {
      await prisma.session.deleteMany({ where: { sessionToken } });
    }
  });

  test("keeps the form and footer in normal flow on narrow and short screens", async ({
    page,
  }) => {
    const viewports = [
      { width: 320, height: 568 },
      { width: 360, height: 640 },
      { width: 375, height: 667 },
      { width: 390, height: 844 },
      { width: 412, height: 915 },
      { width: 430, height: 932 },
      { width: 540, height: 720 },
      { width: 768, height: 700 },
      { width: 1024, height: 650 },
      { width: 1280, height: 720 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
    ];

    for (const viewport of viewports) {
      await test.step(`${viewport.width}x${viewport.height}`, async () => {
        await page.setViewportSize(viewport);
        await page.goto("/admin/login");
        await waitForPageSettled(page);

        await expect(adminCard(page)).toBeVisible();
        await expect(
          adminCard(page).getByRole("button", { name: "Sign in securely" }),
        ).toBeVisible();

        const layout = await page.locator("[data-admin-auth-shell]").evaluate((shell) => {
          const footer = shell.querySelector("[data-admin-auth-footer]");
          const promo = shell.querySelector("[data-admin-auth-promo]");

          return {
            clientWidth: document.documentElement.clientWidth,
            footerPosition: footer ? getComputedStyle(footer).position : null,
            minHeight: getComputedStyle(shell).minHeight,
            promoDisplay: promo ? getComputedStyle(promo).display : null,
            scrollWidth: document.documentElement.scrollWidth,
            shellHeight: shell.getBoundingClientRect().height,
            viewportHeight: window.innerHeight,
          };
        });

        expect(layout.scrollWidth - layout.clientWidth).toBeLessThanOrEqual(1);
        expect(layout.shellHeight).toBeGreaterThanOrEqual(layout.viewportHeight - 1);
        expect(layout.minHeight).toMatch(/(?:dvh|px)/);
        expect(["static", "relative"]).toContain(layout.footerPosition);
        expect(layout.promoDisplay === "none").toBe(viewport.width < 1024);
      });
    }
  });

  test("signs in an administrator and redirects authenticated login visits", async ({
    browserName,
    page,
  }) => {
    test.skip(browserName !== "chromium", "The credential flow runs once.");
    test.skip(
      !runCredentialTests,
      "Set RUN_AUTH_CREDENTIAL_TESTS=true to run configured administrator credentials.",
    );

    await page.goto("/admin/login?next=%2Fadmin%2Forders");
    const card = adminCard(page);
    await card.getByLabel("Email", { exact: true }).fill(adminEmail!);
    await card.getByLabel("Password", { exact: true }).fill(adminPassword!);
    await card.getByRole("button", { name: "Sign in securely" }).click();
    await expect(page).toHaveURL(/\/admin\/orders$/);

    await page.goto("/admin/login?next=%2Fadmin%2Fproducts");
    await expect(page).toHaveURL(/\/admin\/products$/);
  });

  test("does not admit a configured customer through the admin form", async ({
    browserName,
    page,
  }) => {
    test.skip(browserName !== "chromium", "The credential flow runs once.");
    test.skip(
      !runCredentialTests || !customerEmail || !customerPassword,
      "Configured administrator and customer credentials are required.",
    );

    await page.goto("/admin/login");
    const card = adminCard(page);
    await card.getByLabel("Email", { exact: true }).fill(customerEmail!);
    await card.getByLabel("Password", { exact: true }).fill(customerPassword!);
    await card.getByRole("button", { name: "Sign in securely" }).click();
    await expect(card.getByRole("alert")).toContainText(
      "The email or password was not recognised.",
    );
    await expect(page).toHaveURL(/\/admin\/login$/);

    await page.goto("/login?next=%2Faccount");
    const customerCard = page.locator("[data-auth-form-card]");
    await customerCard.getByLabel("Email", { exact: true }).fill(customerEmail!);
    await customerCard.getByLabel("Password", { exact: true }).fill(customerPassword!);
    await customerCard
      .getByRole("button", { name: "Sign in", exact: true })
      .click();
    await expect(page).toHaveURL(/\/account$/);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/access-denied$/);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "You do not have permission to access this admin area.",
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(async () => {
        const response = await fetch("/api/admin/health");
        return response.status;
      }),
    ).toBe(403);
  });
});
