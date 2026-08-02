import {
  expect,
  test,
  type Locator,
  type Page,
  type Request,
} from "@playwright/test";
import { expectPathAndParams, waitForPageSettled } from "./helpers/navigation";

const AUTH_ROUTES = [
  {
    heading: "Sign in to your account",
    route: "/login",
  },
  {
    heading: "Create your account",
    route: "/login?mode=register",
  },
  {
    heading: "Reset your password",
    route: "/login?mode=forgot",
  },
  {
    heading: /new password/i,
    route: "/reset-password",
  },
] as const;

const RESPONSIVE_VIEWPORTS = [
  { height: 568, width: 320 },
  { height: 640, width: 360 },
  { height: 667, width: 375 },
  { height: 844, width: 390 },
  { height: 915, width: 412 },
  { height: 932, width: 430 },
  { height: 720, width: 540 },
  { height: 900, width: 768 },
  { height: 768, width: 1024 },
  { height: 720, width: 1280 },
  { height: 900, width: 1440 },
  { height: 864, width: 1536 },
] as const;

function authShell(page: Page) {
  return page.locator("[data-auth-page-shell]");
}

function activeField(page: Page, label: string) {
  return page.getByLabel(label, { exact: true }).filter({ visible: true });
}

async function activateMode(page: Page, name: "Create account" | "Sign in") {
  const modeButton = page
    .getByRole("tab", { name, exact: true })
    .or(page.getByRole("button", { name, exact: true }))
    .filter({ visible: true })
    .first();

  await expect(modeButton).toBeVisible();
  await modeButton.click();
}

async function expectMinimumTargetSize(locator: Locator, minimum = 44) {
  const box = await locator.boundingBox();

  expect(box, "Expected the interactive control to have a layout box").not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(minimum);
  expect(box!.width).toBeGreaterThanOrEqual(minimum);
}

function repeatedlyDecode(value: string) {
  let decoded = value;

  for (let pass = 0; pass < 3; pass += 1) {
    try {
      const next = decodeURIComponent(decoded);

      if (next === decoded) {
        break;
      }

      decoded = next;
    } catch {
      break;
    }
  }

  return decoded.toLowerCase();
}

function unrelatedStorefrontRequest(request: Request) {
  const decodedUrl = repeatedlyDecode(request.url());

  if (
    decodedUrl.includes("/product-images/") ||
    decodedUrl.includes("google.com/maps") ||
    decodedUrl.includes("maps.googleapis.com")
  ) {
    return true;
  }

  if (!["fetch", "xhr"].includes(request.resourceType())) {
    return false;
  }

  const pathname = new URL(request.url()).pathname.toLowerCase();

  return /^\/(?:products|category|categories|offers|featured|best-sellers|search)(?:\/|$)/.test(
    pathname,
  );
}

test.describe("shared authentication experience", () => {
  test("every authentication state uses the same semantic shell and compact footer", async ({
    page,
  }) => {
    for (const state of AUTH_ROUTES) {
      await test.step(state.route, async () => {
        await page.goto(state.route);
        await waitForPageSettled(page);

        const shell = authShell(page);
        await expect(shell).toHaveCount(1);
        await expect(shell.locator("[data-auth-header]")).toHaveCount(1);
        await expect(shell.locator("[data-auth-main]")).toHaveCount(1);
        await expect(shell.locator("[data-auth-footer]")).toHaveCount(1);
        await expect(shell.locator("h1")).toHaveCount(1);
        await expect(shell.locator("h1, h2").first()).toHaveJSProperty(
          "tagName",
          "H1",
        );
        await expect(
          shell.getByRole("heading", {
            level: 1,
            name: state.heading,
          }),
        ).toBeVisible();

        await expect(shell.locator("main main")).toHaveCount(0);
        await expect(
          page.locator('nav[aria-label="Bottom navigation"]'),
        ).toHaveCount(0);
        await expect(
          page.locator('nav[aria-label="Footer shop links"]'),
        ).toHaveCount(0);

        const footer = shell.locator("[data-auth-footer]");
        await expect(footer).toContainText("© 2026 A1 Haat Bazar");
        await expect(
          footer.getByRole("link", { name: "Privacy Policy", exact: true }),
        ).toHaveAttribute("href", "/privacy");
        await expect(
          footer.getByRole("link", {
            name: "Terms and Conditions",
            exact: true,
          }),
        ).toHaveAttribute("href", "/terms");
        await expect(
          footer.getByRole("link", { name: "Back to shop", exact: true }),
        ).toHaveAttribute("href", "/products");

        const shellSemantics = await shell.evaluate((element) => {
          const header = element.querySelector("[data-auth-header]");
          const main = element.querySelector("[data-auth-main]");
          const footer = element.querySelector("[data-auth-footer]");

          return {
            display: getComputedStyle(element).display,
            flexDirection: getComputedStyle(element).flexDirection,
            footerTag: footer?.tagName.toLowerCase(),
            headerTag: header?.tagName.toLowerCase(),
            mainFlexGrow: main ? Number.parseFloat(getComputedStyle(main).flexGrow) : 0,
            mainTag: main?.tagName.toLowerCase(),
          };
        });

        expect(shellSemantics).toMatchObject({
          display: "flex",
          flexDirection: "column",
          footerTag: "footer",
          headerTag: "header",
          mainTag: "main",
        });
        expect(shellSemantics.mainFlexGrow).toBeGreaterThan(0);
      });
    }
  });

  test("header actions return customers to the storefront", async ({ page }) => {
    await page.goto("/login");
    await waitForPageSettled(page);

    const header = authShell(page).locator("[data-auth-header]");
    const homeLink = header.getByRole("link", {
      name: "A1 Haat Bazar home",
      exact: true,
    });
    const shopLink = header.getByRole("link", {
      name: "Back to shop",
      exact: true,
    });

    await expect(homeLink).toHaveAttribute("href", "/");
    await expect(shopLink).toHaveAttribute("href", "/products");
    await expectMinimumTargetSize(homeLink);
    await expectMinimumTargetSize(shopLink);

    await shopLink.click();
    await expectPathAndParams(page, "/products");

    await page.goto("/login");
    await authShell(page)
      .locator("[data-auth-header]")
      .getByRole("link", {
        name: "A1 Haat Bazar home",
        exact: true,
      })
      .click();
    await expectPathAndParams(page, "/");
  });

  test("authentication failures remain generic, accessible, and recoverable", async ({
    page,
  }) => {
    await page.goto("/login?error=invalid");
    await waitForPageSettled(page);

    const authenticationFailure = authShell(page)
      .locator("[data-auth-form-card]")
      .getByRole("alert");
    await expect(authenticationFailure).toBeVisible();
    await expect(authenticationFailure).toContainText(
      /email or password|invalid email or password/i,
    );
    await expect(authenticationFailure).not.toContainText(
      /account (?:does not|doesn't) exist/i,
    );

    await page.goto("/reset-password");
    await waitForPageSettled(page);
    await expect(
      page.getByText(/reset link is invalid or expired/i).first(),
    ).toBeVisible();
    await expect(
      page.locator('a[href="/login?mode=forgot"]').filter({ visible: true }),
    ).toHaveAttribute("href", "/login?mode=forgot");
  });

  test("invalid credentials preserve the email, clear the password, and restore focus", async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName !== "chromium",
      "One invalid attempt is sufficient and avoids duplicating rate-limit state across projects.",
    );

    await page.goto("/login");
    await waitForPageSettled(page);

    const card = page.locator("[data-auth-form-card]");
    const email = card.getByLabel("Email", { exact: true });
    const password = card.getByLabel("Password", { exact: true });
    const submit = card.getByRole("button", {
      name: "Sign in",
      exact: true,
    });

    await email.fill("invalid-customer@example.invalid");
    await password.fill("not-the-right-password");
    await submit.click();

    const error = card.getByRole("alert");
    await expect(error).toContainText(/email or password/i);
    await expect(error).not.toContainText(/account (?:does not|doesn't) exist/i);
    await expect(email).toHaveValue("invalid-customer@example.invalid");
    await expect(email).toBeFocused();
    await expect(password).toHaveValue("");
    await expect(submit).toBeEnabled();
  });

  test("form modes preserve a safe return path and expose autofill-friendly controls", async ({
    page,
  }) => {
    const intendedDestination = "/checkout?stage=delivery#address";

    await page.setViewportSize({ height: 700, width: 320 });
    await page.goto(
      `/login?next=${encodeURIComponent(intendedDestination)}`,
    );
    await waitForPageSettled(page);

    const loginEmail = activeField(page, "Email");
    const loginPassword = activeField(page, "Password");
    const loginForm = loginEmail.locator("xpath=ancestor::form");

    await expect(loginForm.locator('input[name="next"]')).toHaveValue(
      intendedDestination,
    );
    await expect(loginEmail).toHaveAttribute("type", "email");
    await expect(loginEmail).toHaveAttribute("name", "email");
    await expect(loginEmail).toHaveAttribute("autocomplete", "email");
    await expect(loginEmail).toHaveAttribute("inputmode", "email");
    await expect(loginPassword).toHaveAttribute("type", "password");
    await expect(loginPassword).toHaveAttribute("name", "password");
    await expect(loginPassword).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    await expect(loginForm.getByLabel("Remember me")).toHaveCount(0);
    expect(
      await loginEmail.evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).fontSize),
      ),
    ).toBeGreaterThanOrEqual(16);

    const submit = loginForm.getByRole("button", {
      name: "Sign in",
      exact: true,
    });
    await submit.click();
    await expect(loginEmail).toBeFocused();
    await expect
      .poll(() =>
        loginEmail.evaluate(
          (element) => (element as HTMLInputElement).validity.valid,
        ),
      )
      .toBe(false);

    const passwordToggle = page.getByRole("button", {
      name: "Show password",
      exact: true,
    });
    const toggleBoxBefore = await passwordToggle.boundingBox();
    await expectMinimumTargetSize(passwordToggle);
    await expect(passwordToggle).toHaveAttribute("type", "button");
    await loginPassword.evaluate((element) => {
      element.setAttribute("data-e2e-stable-input", "true");
    });
    await passwordToggle.click();
    await expect(loginPassword).toHaveAttribute("type", "text");
    await expect(loginPassword).toHaveAttribute(
      "data-e2e-stable-input",
      "true",
    );
    const hidePassword = page.getByRole("button", {
      name: "Hide password",
      exact: true,
    });
    const toggleBoxAfter = await hidePassword.boundingBox();
    expect(Math.abs(toggleBoxAfter!.width - toggleBoxBefore!.width)).toBeLessThanOrEqual(
      1,
    );
    await hidePassword.click();
    await expect(loginPassword).toHaveAttribute("type", "password");

    const signInMode = page.getByRole("tab", {
      name: "Sign in",
      exact: true,
    });
    const registerMode = page.getByRole("tab", {
      name: "Create account",
      exact: true,
    });
    await expectMinimumTargetSize(signInMode);
    await expectMinimumTargetSize(registerMode);
    await expect(signInMode).toHaveAttribute("aria-selected", "true");
    await expect(registerMode).toHaveAttribute("aria-selected", "false");
    await signInMode.focus();
    await signInMode.press("ArrowRight");
    await expect(registerMode).toBeFocused();
    await expect(registerMode).toHaveAttribute("aria-selected", "true");
    await registerMode.press("ArrowLeft");
    await expect(signInMode).toBeFocused();
    await expect(signInMode).toHaveAttribute("aria-selected", "true");

    await activateMode(page, "Create account");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Create your account",
      }),
    ).toBeVisible();
    const registerForm = activeField(page, "Email").locator(
      "xpath=ancestor::form",
    );
    await expect(registerForm.locator('input[name="next"]')).toHaveValue(
      intendedDestination,
    );
    await expect(activeField(page, "Email")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    await expect(activeField(page, "Email")).toHaveAttribute(
      "inputmode",
      "email",
    );
    await expect(activeField(page, "Password")).toHaveAttribute(
      "autocomplete",
      "new-password",
    );

    await activateMode(page, "Sign in");
    await expect(
      page.locator('form input[name="next"]'),
    ).toHaveValue(intendedDestination);

    await page
      .getByRole("button", { name: "Forgot password?", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Reset your password",
      }),
    ).toBeVisible();
    const forgotEmail = activeField(page, "Email");
    await expect(forgotEmail).toBeFocused();
    await expect(forgotEmail).toHaveAttribute("type", "email");
    await expect(forgotEmail).toHaveAttribute("name", "email");
    await expect(forgotEmail).toHaveAttribute("autocomplete", "email");
    await expect(forgotEmail).toHaveAttribute("inputmode", "email");

    await page
      .getByRole("button", { name: /sign in/i })
      .filter({ visible: true })
      .last()
      .click();
    await expect(
      page.getByRole("tab", { name: "Sign in", exact: true }),
    ).toBeFocused();
    await expect(page.locator('form input[name="next"]')).toHaveValue(
      intendedDestination,
    );

    const ids = await authShell(page).locator("[id]").evaluateAll((elements) =>
      elements.map((element) => element.id),
    );
    expect(new Set(ids).size, "Authentication controls must not duplicate IDs").toBe(
      ids.length,
    );
    await expect(authShell(page).locator("form form")).toHaveCount(0);
  });

  test("external and privileged return destinations are rejected before form submission", async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName !== "chromium",
      "The unsafe-input matrix runs once; both browser projects cover the normalized form flow.",
    );

    const unsafeDestinations = [
      "https://evil.example/collect",
      "//evil.example/collect",
      "javascript:alert(1)",
      "/admin",
      String.raw`\\evil.example\collect`,
      "/%252f%252fevil.example/collect",
    ];

    for (const unsafeDestination of unsafeDestinations) {
      await test.step(unsafeDestination, async () => {
        const query = new URLSearchParams({ next: unsafeDestination });
        await page.goto(`/login?${query.toString()}`);
        await waitForPageSettled(page);

        await expect(page.locator('form input[name="next"]')).toHaveValue(
          "/account",
        );
        await activateMode(page, "Create account");
        await expect(page.locator('form input[name="next"]')).toHaveValue(
          "/account",
        );

        const unsafeLink = await authShell(page)
          .locator("a[href]")
          .evaluateAll((links) =>
            links.find((link) => {
              const href = link.getAttribute("href") ?? "";

              return (
                href.startsWith("//") ||
                /^https?:/i.test(href) ||
                /^javascript:/i.test(href) ||
                href.toLowerCase().startsWith("/admin")
              );
            })?.getAttribute("href") ?? null,
          );
        expect(unsafeLink).toBeNull();
      });
    }
  });

  test("the shell has no overflow or artificial footer gap across the viewport matrix", async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName !== "chromium",
      "The complete resize matrix runs once; WebKit covers representative shell states.",
    );
    test.setTimeout(120_000);

    await page.goto("/login");
    await waitForPageSettled(page);

    for (const viewport of RESPONSIVE_VIEWPORTS) {
      await test.step(
        `${viewport.width}×${viewport.height}`,
        async () => {
          await page.setViewportSize(viewport);
          await page.evaluate(
            () =>
              new Promise<void>((resolve) => {
                requestAnimationFrame(() =>
                  requestAnimationFrame(() => resolve()),
                );
              }),
          );

          const shell = authShell(page);
          const layout = await shell.evaluate((element) => {
            const header = element.querySelector<HTMLElement>(
              "[data-auth-header]",
            );
            const main = element.querySelector<HTMLElement>("[data-auth-main]");
            const footer = element.querySelector<HTMLElement>(
              "[data-auth-footer]",
            );
            const formCard = element.querySelector<HTMLElement>(
              "[data-auth-form-card]",
            );
            const mainChildren = Array.from(main?.children ?? []).filter(
              (child): child is HTMLElement => child instanceof HTMLElement,
            );
            const visibleMainChildren = mainChildren.filter((child) => {
              const style = getComputedStyle(child);
              const rect = child.getBoundingClientRect();

              return (
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                rect.height > 0
              );
            });
            const shellRect = element.getBoundingClientRect();
            const mainRect = main?.getBoundingClientRect();
            const footerRect = footer?.getBoundingClientRect();
            const formCardRect = formCard?.getBoundingClientRect();
            const visibleFormControls = Array.from(
              formCard?.querySelectorAll<HTMLElement>(
                "button, input, form, [role='tablist']",
              ) ?? [],
            ).filter((control) => {
              const style = getComputedStyle(control);
              const rect = control.getBoundingClientRect();

              return (
                style.display !== "none"
                && style.visibility !== "hidden"
                && rect.height > 0
                && rect.width > 0
              );
            });
            const formControlOverflow =
              formCardRect === undefined
                ? Number.POSITIVE_INFINITY
                : Math.max(
                    0,
                    ...visibleFormControls.flatMap((control) => {
                      const rect = control.getBoundingClientRect();
                      return [
                        formCardRect.left - rect.left,
                        rect.right - formCardRect.right,
                      ];
                    }),
                  );
            const contentBottom =
              visibleMainChildren.length > 0
                ? Math.max(
                    ...visibleMainChildren.map(
                      (child) => child.getBoundingClientRect().bottom,
                    ),
                  )
                : mainRect?.top ?? 0;

            return {
              clientWidth: document.documentElement.clientWidth,
              contentToMainBottom:
                mainRect === undefined ? Number.POSITIVE_INFINITY : mainRect.bottom - contentBottom,
              documentHeight: document.documentElement.scrollHeight,
              footerDocumentBottom:
                footerRect === undefined
                  ? 0
                  : footerRect.bottom + window.scrollY,
              footerPosition:
                footer === null ? null : getComputedStyle(footer).position,
              formControlOverflow,
              headerToMain:
                header === null || mainRect === undefined
                  ? Number.POSITIVE_INFINITY
                  : mainRect.top - header.getBoundingClientRect().bottom,
              mainToFooter:
                mainRect === undefined || footerRect === undefined
                  ? Number.POSITIVE_INFINITY
                  : footerRect.top - mainRect.bottom,
              minHeight: getComputedStyle(element).minHeight,
              scrollWidth: document.documentElement.scrollWidth,
              shellHeight: shellRect.height,
              viewportHeight: window.innerHeight,
            };
          });

          expect(layout.scrollWidth - layout.clientWidth).toBeLessThanOrEqual(1);
          expect(layout.formControlOverflow).toBeLessThanOrEqual(1);
          expect(layout.shellHeight).toBeGreaterThanOrEqual(
            layout.viewportHeight - 1,
          );
          expect(layout.minHeight).toMatch(/(?:dvh|px)/);
          expect(Math.abs(layout.headerToMain)).toBeLessThanOrEqual(1);
          expect(Math.abs(layout.mainToFooter)).toBeLessThanOrEqual(1);
          expect(
            Math.abs(layout.documentHeight - layout.footerDocumentBottom),
          ).toBeLessThanOrEqual(2);
          expect(["static", "relative"]).toContain(layout.footerPosition);
          expect(layout.contentToMainBottom).toBeLessThanOrEqual(
            viewport.width < 1024 ? 64 : 96,
          );

          const promo = shell.locator("[data-auth-promo]");

          if (viewport.width >= 1024) {
            await expect(promo).toBeVisible();
          } else {
            await expect(promo).toBeHidden();
          }

          const backToShop = shell
            .locator("[data-auth-header]")
            .getByRole("link", { name: "Back to shop", exact: true });
          await expectMinimumTargetSize(backToShop);

          if (viewport.width <= 768) {
            const footerLinks = shell
              .locator("[data-auth-footer]")
              .getByRole("link");
            const footerLinkCount = await footerLinks.count();

            for (let index = 0; index < footerLinkCount; index += 1) {
              await expectMinimumTargetSize(footerLinks.nth(index));
            }
          }
        },
      );
    }
  });

  test("auth routes do not preload catalogue data, product imagery, or maps", async ({
    page,
  }) => {
    const unrelatedRequests: string[] = [];

    page.on("request", (request) => {
      if (unrelatedStorefrontRequest(request)) {
        unrelatedRequests.push(request.url());
      }
    });

    await page.goto("/login");
    await waitForPageSettled(page);

    expect(
      unrelatedRequests,
      "The authentication shell must not initialise or prefetch catalogue-only resources",
    ).toEqual([]);
    await expect(
      authShell(page).locator('img[src*="/product-images/"]'),
    ).toHaveCount(0);
    await expect(authShell(page).locator("iframe")).toHaveCount(0);
  });
});
