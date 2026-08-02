import { createHash, randomBytes, randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { loadLocalEnv } from "../../scripts/load-local-env";
import { hashPassword, verifyPassword } from "../../src/lib/password";
import { expectPathAndParams } from "./helpers/navigation";

loadLocalEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const canRunSecurityFlows = Boolean(supabaseUrl && serviceRoleKey);
const initialPassword = "A1Security!initial2026";
const execFileAsync = promisify(execFile);

function adminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase test configuration is unavailable.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

async function createDisposableCustomer(
  page: Page,
  context: BrowserContext,
  options: { authMethod?: "EMAIL_OTP" | "OAUTH" | "PASSWORD"; withData?: boolean } = {},
) {
  const { prisma } = await import("../../src/lib/prisma");
  const admin = adminClient();
  const email = `account-security-${randomUUID()}@example.com`;
  const authMethod = options.authMethod ?? "PASSWORD";
  const { data: authData, error: authError } =
    await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      ...(authMethod === "PASSWORD" ? { password: initialPassword } : {}),
    });

  if (authError || !authData.user) {
    throw authError ?? new Error("Disposable Auth user was not created.");
  }

  const appUser = await prisma.user.create({
    data: {
      authMethod,
      email,
      name: "Disposable Security Customer",
      passwordHash:
        authMethod === "PASSWORD" ? await hashPassword(initialPassword) : null,
      role: "CUSTOMER",
      status: "ACTIVE",
      supabaseAuthUserId: authData.user.id,
    },
  });
  let orderId: string | null = null;
  let requestId: string | null = null;
  let storagePath: string | null = null;

  if (options.withData) {
    const product = await prisma.product.findFirst({
      include: { variants: { take: 1 } },
      where: { status: "ACTIVE" },
    });

    if (!product?.variants[0]) {
      throw new Error("A catalog product is required for deletion tests.");
    }

    const address = await prisma.address.create({
      data: {
        country: "Australia",
        fullName: "Disposable Customer",
        isDefault: true,
        label: "Home",
        line1: "1 Test Street",
        phone: "0400000000",
        postalCode: "5108",
        state: "SA",
        suburb: "Salisbury",
        userId: appUser.id,
      },
    });
    await prisma.wishlist.create({
      data: { productId: product.id, userId: appUser.id },
    });
    await prisma.cart.create({
      data: {
        status: "ACTIVE",
        userId: appUser.id,
        items: {
          create: {
            quantity: 1,
            variantId: product.variants[0].id,
          },
        },
      },
    });
    const order = await prisma.order.create({
      data: {
        addressId: address.id,
        currency: "AUD",
        customerEmail: email,
        customerPhone: "0400000000",
        discountTotal: 0,
        fulfillmentType: "DELIVERY",
        notes: "Remove this personal note during deletion.",
        orderNumber: `SEC-${Date.now()}-${randomUUID().slice(0, 6)}`,
        paymentStatus: "PAID",
        shippingTotal: 0,
        status: "DELIVERED",
        subtotal: 10,
        taxTotal: 0,
        total: 10,
        userId: appUser.id,
      },
    });
    orderId = order.id;
    storagePath = `${authData.user.id}/account-security-test.txt`;
    const { error: uploadError } = await admin.storage
      .from("product-images")
      .upload(storagePath, Buffer.from("disposable account security test"), {
        contentType: "text/plain",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }
  }

  const rawToken = randomBytes(32).toString("base64url");
  const sessionToken = createHash("sha256").update(rawToken).digest("hex");
  await prisma.session.create({
    data: {
      expires: new Date(Date.now() + 60 * 60 * 1000),
      sessionToken,
      userId: appUser.id,
    },
  });
  await page.goto("/login");
  await context.addCookies([
    {
      httpOnly: true,
      name: "gsp_session",
      sameSite: "Lax",
      url: new URL(page.url()).origin,
      value: rawToken,
    },
  ]);

  return {
    appUser,
    authUserId: authData.user.id,
    email,
    orderId,
    setRequestId(value: string) {
      requestId = value;
    },
    storagePath,
    async cleanup() {
      if (orderId) {
        await prisma.order.deleteMany({ where: { id: orderId } });
      }
      if (requestId) {
        const request = await prisma.accountDeletionRequest.findUnique({
          where: { id: requestId },
        });
        if (request) {
          await prisma.securityAuditEvent.deleteMany({
            where: { eventId: request.eventId },
          });
        }
        await prisma.accountDeletionRequest.deleteMany({ where: { id: requestId } });
      }
      await prisma.user.deleteMany({ where: { id: appUser.id } });
      if (storagePath) {
        await admin.storage.from("product-images").remove([storagePath]);
      }
      await admin.auth.admin.deleteUser(authData.user.id);
    },
  };
}

test.describe("customer account security", () => {
  test.skip(!canRunSecurityFlows, "Supabase server test configuration is required.");
  test.setTimeout(120_000);

  test("changes a password only after current-password verification and revokes other sessions", async ({
    browserName,
    context,
    page,
  }) => {
    test.skip(browserName !== "chromium", "Security mutations run once in Chromium.");
    const customer = await createDisposableCustomer(page, context);
    const { prisma } = await import("../../src/lib/prisma");
    const extraAppSession = await prisma.session.create({
      data: {
        expires: new Date(Date.now() + 60 * 60 * 1000),
        sessionToken: createHash("sha256").update(randomBytes(32)).digest("hex"),
        userId: customer.appUser.id,
      },
    });
    const otherDevice = adminClient();
    const { data: otherDeviceData, error: otherDeviceError } =
      await otherDevice.auth.signInWithPassword({
        email: customer.email,
        password: initialPassword,
      });

    expect(otherDeviceError).toBeNull();
    const otherRefreshToken = otherDeviceData.session!.refresh_token;

    try {
      await page.goto("/account/security");
      const changeButton = page.getByRole("button", { name: "Change password" });
      await expect(page.getByText("Forgot your password?", { exact: true })).toBeVisible();

      await changeButton.click();
      let dialog = page.getByRole("dialog", { name: "Change password" });
      await expect(dialog.getByLabel("Current password", { exact: true })).toBeFocused();
      await expect(dialog.getByLabel("Current password", { exact: true })).toHaveAttribute(
        "autocomplete",
        "current-password",
      );
      await expect(dialog.getByLabel("New password", { exact: true })).toHaveAttribute(
        "autocomplete",
        "new-password",
      );
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(changeButton).toBeFocused();

      await changeButton.click();
      dialog = page.getByRole("dialog", { name: "Change password" });
      await dialog.getByRole("button", { name: "Update password" }).click();
      await expect(dialog.getByText("Enter your current password.")).toBeVisible();
      await expect(dialog.getByText("Enter a new password.")).toBeVisible();

      await dialog.getByLabel("Current password", { exact: true }).fill(initialPassword);
      await dialog.getByLabel("New password", { exact: true }).fill("short");
      await dialog.getByLabel("Confirm new password", { exact: true }).fill("short");
      await dialog.getByRole("button", { name: "Update password" }).click();
      await expect(dialog.getByText("Use at least 6 characters.")).toBeVisible();
      await expect(dialog.getByLabel("Current password", { exact: true })).toHaveValue("");

      await dialog.getByLabel("Current password", { exact: true }).fill(initialPassword);
      await dialog.getByLabel("New password", { exact: true }).fill(initialPassword);
      await dialog.getByLabel("Confirm new password", { exact: true }).fill(initialPassword);
      await dialog.getByRole("button", { name: "Update password" }).click();
      await expect(
        dialog.getByText("Choose a password that is different from your current password."),
      ).toBeVisible();

      await dialog.getByLabel("Current password", { exact: true }).fill(initialPassword);
      await dialog.getByLabel("New password", { exact: true }).fill("A1Mismatch!new2026");
      await dialog.getByLabel("Confirm new password", { exact: true }).fill("A1Mismatch!other2026");
      await dialog.getByRole("button", { name: "Update password" }).click();
      await expect(dialog.getByText("The new passwords do not match.")).toBeVisible();
      await expect(dialog.getByLabel("Current password", { exact: true })).toHaveValue("");
      await expect(dialog.getByLabel("New password", { exact: true })).toHaveValue("");

      await dialog.getByLabel("Current password", { exact: true }).fill("incorrect-password");
      await dialog.getByLabel("New password", { exact: true }).fill("A1Security!new2026");
      await dialog.getByLabel("Confirm new password", { exact: true }).fill("A1Security!new2026");
      await dialog.getByRole("button", { name: "Update password" }).click();
      await expect(dialog.getByText("The current password was not recognised.")).toBeVisible();
      await expect(dialog.getByLabel("Current password", { exact: true })).toHaveValue("");

      await dialog.getByLabel("Current password", { exact: true }).fill(initialPassword);
      await dialog.getByLabel("New password", { exact: true }).fill("A1Security!new2026");
      await dialog.getByLabel("Confirm new password", { exact: true }).fill("A1Security!new2026");
      const actionRequests: string[] = [];
      const trackAction = (request: import("@playwright/test").Request) => {
        if (request.method() === "POST") {
          actionRequests.push(request.url());
        }
      };
      page.on("request", trackAction);
      await dialog.locator("form").evaluate((form) => {
        form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
        form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true }));
      });

      await expect(dialog).toBeHidden({ timeout: 30_000 });
      page.off("request", trackAction);
      expect(actionRequests).toHaveLength(1);
      await expect(page.getByText("Your password has been updated.", { exact: true })).toBeVisible();
      await expectPathAndParams(page, "/account/security");
      expect(await prisma.session.count({ where: { id: extraAppSession.id } })).toBe(0);

      const updatedAppUser = await prisma.user.findUniqueOrThrow({
        select: { passwordHash: true },
        where: { id: customer.appUser.id },
      });
      expect(
        await verifyPassword("A1Security!new2026", updatedAppUser.passwordHash),
      ).toBe(true);
      const verifier = adminClient();
      const newCredential = await verifier.auth.signInWithPassword({
        email: customer.email,
        password: "A1Security!new2026",
      });
      expect(newCredential.error).toBeNull();
      const oldCredential = await adminClient().auth.signInWithPassword({
        email: customer.email,
        password: initialPassword,
      });
      expect(oldCredential.error).not.toBeNull();
      const revokedSession = await adminClient().auth.refreshSession({
        refresh_token: otherRefreshToken,
      });
      expect(revokedSession.error).not.toBeNull();
    } finally {
      await customer.cleanup();
    }
  });

  test("uses a two-stage mobile-safe deletion flow and enforces the documented cleanup policy", async ({
    browserName,
    context,
    page,
  }) => {
    test.skip(browserName !== "chromium", "Destructive verification runs once in Chromium.");
    const customer = await createDisposableCustomer(page, context, { withData: true });
    const control = await createDisposableCustomer(page, context);
    const { prisma } = await import("../../src/lib/prisma");
    const staleClient = createClient(supabaseUrl!, publishableKey ?? serviceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
    const staleSession = await staleClient.auth.signInWithPassword({
      email: customer.email,
      password: initialPassword,
    });
    expect(staleSession.error).toBeNull();

    try {
      // Restore the deleting customer's cookie after the control fixture was created.
      await context.clearCookies();
      const rawToken = randomBytes(32).toString("base64url");
      const sessionToken = createHash("sha256").update(rawToken).digest("hex");
      await prisma.session.create({
        data: {
          expires: new Date(Date.now() + 60 * 60 * 1000),
          sessionToken,
          userId: customer.appUser.id,
        },
      });
      await page.goto("/login");
      await context.addCookies([
        {
          httpOnly: true,
          name: "gsp_session",
          sameSite: "Lax",
          url: new URL(page.url()).origin,
          value: rawToken,
        },
      ]);
      await page.setViewportSize({ height: 844, width: 390 });
      await page.goto("/account/security");
      await page.getByRole("button", { name: "Delete my account" }).click();

      let dialog = page.getByRole("dialog", { name: "Delete your account?" });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText("Saved delivery addresses", { exact: true })).toBeVisible();
      await expect(dialog.getByText(/legally required transaction records/)).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
        )
        .toBeLessThanOrEqual(1);
      await dialog.getByRole("button", { name: "Continue" }).click();

      dialog = page.getByRole("dialog", { name: "Confirm account deletion" });
      const deleteButton = dialog.getByRole("button", {
        name: "Permanently delete account",
      });
      await expect(deleteButton).toBeDisabled();
      await dialog.getByLabel("Current password", { exact: true }).fill(initialPassword);
      await dialog.getByLabel("Type DELETE to confirm").fill("delete");
      await dialog.getByLabel("I understand that this action cannot be undone.").check();
      await expect(deleteButton).toBeDisabled();
      await dialog.getByLabel("Type DELETE to confirm").fill("DELETE");
      await expect(deleteButton).toBeEnabled();

      await dialog.getByLabel("Current password", { exact: true }).fill("wrong-password");
      await deleteButton.click();
      await expect(dialog.getByText("The password was not recognised.")).toBeVisible();
      await expect(dialog.getByLabel("Current password", { exact: true })).toHaveValue("");
      await expect(dialog.getByLabel("Type DELETE to confirm")).toHaveValue("DELETE");
      await expect(dialog.getByLabel("I understand that this action cannot be undone.")).toBeChecked();
      await dialog.getByLabel("Current password", { exact: true }).fill(initialPassword);
      await expect(deleteButton).toBeEnabled();

      // A browser-supplied target is ignored; deletion is always derived from the session.
      await dialog.locator("form").evaluate((form, victimId) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "userId";
        input.value = String(victimId);
        form.append(input);
      }, control.appUser.id);
      const deletionStartedAt = new Date();
      await deleteButton.click();
      await expectPathAndParams(page, "/account-deleted");
      await expect(
        page.getByRole("heading", { name: "Your account has been deleted" }),
      ).toBeVisible();
      await expect(page.getByText(customer.email, { exact: true })).toHaveCount(0);

      expect(await prisma.user.findUnique({ where: { id: customer.appUser.id } })).toBeNull();
      expect(await prisma.user.findUnique({ where: { id: control.appUser.id } })).not.toBeNull();
      expect(await prisma.address.count({ where: { userId: customer.appUser.id } })).toBe(0);
      expect(await prisma.wishlist.count({ where: { userId: customer.appUser.id } })).toBe(0);
      expect(await prisma.cart.count({ where: { userId: customer.appUser.id } })).toBe(0);
      expect(await prisma.session.count({ where: { userId: customer.appUser.id } })).toBe(0);
      const retainedOrder = await prisma.order.findUniqueOrThrow({
        where: { id: customer.orderId! },
      });
      expect(retainedOrder).toMatchObject({
        addressId: null,
        customerEmail: "retained-order@invalid.a1-haat-bazar.local",
        customerPhone: null,
        notes: null,
        userId: null,
      });
      const deletionRequest = await prisma.accountDeletionRequest.findFirstOrThrow({
        where: { createdAt: { gte: deletionStartedAt }, status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
      });
      customer.setRequestId(deletionRequest.id);
      expect(deletionRequest).toMatchObject({
        appUserId: null,
        subjectHash: null,
        supabaseAuthUserId: null,
      });
      const deletedAuthUser = await adminClient().auth.admin.getUserById(
        customer.authUserId,
      );
      expect(deletedAuthUser.error).not.toBeNull();
      const storageObjects = await adminClient().storage
        .from("product-images")
        .list(customer.authUserId);
      expect(storageObjects.data ?? []).toHaveLength(0);
      const staleWishlistRead = await staleClient
        .from("Wishlist")
        .select("id")
        .eq("userId", customer.appUser.id);
      expect(staleWishlistRead.data ?? []).toHaveLength(0);

      await page.goBack();
      await expectPathAndParams(page, "/login");
    } finally {
      await customer.cleanup();
      await control.cleanup();
    }
  });

  test("adapts passwordless accounts to verified-email deletion and keeps dialogs usable across breakpoints", async ({
    browserName,
    context,
    page,
  }) => {
    test.skip(browserName !== "chromium", "Responsive security coverage runs once in Chromium.");
    for (const authMethod of ["EMAIL_OTP", "OAUTH"] as const) {
      const customer = await createDisposableCustomer(page, context, { authMethod });

      try {
        for (const width of [320, 360, 375, 390, 412, 430, 768, 1024, 1280, 1440, 1536]) {
          await page.setViewportSize({ height: width < 768 ? 844 : 900, width });
          await page.goto("/account/security");
          await expect(page.getByRole("button", { name: "Change password" })).toHaveCount(0);
          await page.getByRole("button", { name: "Delete my account" }).click();
          await page.getByRole("dialog", { name: "Delete your account?" })
            .getByRole("button", { name: "Continue" })
            .click();
          const dialog = page.getByRole("dialog", { name: "Confirm account deletion" });
          await expect(dialog.getByRole("button", { name: "Send verification code" })).toBeVisible();
          await expect(dialog.getByLabel("Verification code")).toBeVisible();
          await expect(dialog.getByLabel("Current password", { exact: true })).toHaveCount(0);
          const geometry = await dialog.boundingBox();
          expect(geometry).not.toBeNull();
          expect(geometry!.x).toBeGreaterThanOrEqual(0);
          expect(geometry!.x + geometry!.width).toBeLessThanOrEqual(width + 1);
          await page.keyboard.press("Escape");
          await expect(dialog).toBeHidden();
        }
      } finally {
        await customer.cleanup();
      }
    }
  });

  test("an authorised retry completes a deletion that stopped after cleanup and is idempotent", async ({
    browserName,
    context,
    page,
  }) => {
    test.skip(browserName !== "chromium", "Recovery integration runs once in Chromium.");
    const customer = await createDisposableCustomer(page, context, { withData: true });
    const { prisma } = await import("../../src/lib/prisma");
    const eventId = randomUUID();
    const request = await prisma.accountDeletionRequest.create({
      data: {
        appUserId: customer.appUser.id,
        attemptCount: 1,
        eventId,
        failureStage: "auth-user-deletion",
        status: "FAILED",
        subjectHash: createHash("sha256").update(randomUUID()).digest("hex"),
        supabaseAuthUserId: customer.authUserId,
      },
    });
    customer.setRequestId(request.id);
    await prisma.user.update({
      data: { status: "DELETION_PENDING" },
      where: { id: customer.appUser.id },
    });

    try {
      const first = await execFileAsync(
        process.execPath,
        ["node_modules/tsx/dist/cli.mjs", "scripts/resume-account-deletion.ts", eventId],
        { cwd: process.cwd(), timeout: 60_000 },
      );
      expect(first.stdout).toContain("completed successfully");
      expect(await prisma.user.findUnique({ where: { id: customer.appUser.id } })).toBeNull();
      expect((await adminClient().auth.admin.getUserById(customer.authUserId)).error).not.toBeNull();
      expect(
        await prisma.accountDeletionRequest.findUnique({ where: { id: request.id } }),
      ).toMatchObject({
        appUserId: null,
        status: "COMPLETED",
        subjectHash: null,
        supabaseAuthUserId: null,
      });

      const second = await execFileAsync(
        process.execPath,
        ["node_modules/tsx/dist/cli.mjs", "scripts/resume-account-deletion.ts", eventId],
        { cwd: process.cwd(), timeout: 60_000 },
      );
      expect(second.stdout).toContain("already complete");
    } finally {
      await customer.cleanup();
    }
  });

  test("a protected administrator cannot enter the customer deletion surface", async ({
    browserName,
    context,
    page,
  }) => {
    test.skip(browserName !== "chromium", "Role-boundary verification runs once in Chromium.");
    const { prisma } = await import("../../src/lib/prisma");
    const admin = await prisma.user.findFirst({
      select: { id: true },
      where: { role: "ADMIN", status: "ACTIVE" },
    });
    test.skip(!admin, "An active administrator is required.");
    const rawToken = randomBytes(32).toString("base64url");
    const sessionToken = createHash("sha256").update(rawToken).digest("hex");
    await prisma.session.create({
      data: {
        expires: new Date(Date.now() + 60 * 60 * 1000),
        sessionToken,
        userId: admin!.id,
      },
    });

    try {
      await page.goto("/admin/login");
      await context.addCookies([
        {
          httpOnly: true,
          name: "gsp_session",
          sameSite: "Lax",
          url: new URL(page.url()).origin,
          value: rawToken,
        },
      ]);
      await page.goto("/account/security");
      await expectPathAndParams(page, "/admin");
      await expect(page.getByRole("button", { name: "Delete my account" })).toHaveCount(0);
    } finally {
      await prisma.session.deleteMany({ where: { sessionToken } });
    }
  });
});
