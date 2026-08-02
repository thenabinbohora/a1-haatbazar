import { expect, test, type Page, type Route } from "@playwright/test";

const CART_STORAGE_KEY = "grocery-store-pro.cart.v1";

const PRODUCTS = {
  "variant-rice": {
    productId: "product-rice",
    name: "A1 Premium Basmati Rice",
    slug: "a1-premium-basmati-rice",
    categoryName: "Rice and Grains",
    variantName: "5kg bag",
    sku: "A1-RICE-5KG",
    stock: 6,
    price: 22.99,
    originalPrice: 24.99,
  },
  "variant-oil": {
    productId: "product-oil",
    name: "A1 Mustard Cooking Oil",
    slug: "a1-mustard-cooking-oil",
    categoryName: "Oil and Ghee",
    variantName: "2L bottle",
    sku: "A1-OIL-2L",
    stock: 2,
    price: 13.49,
    originalPrice: 14.99,
  },
  "variant-lentils": {
    productId: "product-lentils",
    name: "A1 Red Split Lentils",
    slug: "a1-red-split-lentils",
    categoryName: "Lentils and Beans",
    variantName: "1kg bag",
    sku: "A1-LENTILS-1KG",
    stock: 7,
    price: 8.95,
    originalPrice: 8.95,
  },
  "variant-masala": {
    productId: "product-masala",
    name: "A1 Heritage Stone-Ground Garam Masala Family Value Pack",
    slug: "a1-heritage-garam-masala-family-pack",
    categoryName: "Spices and Masalas",
    variantName: "500g family pack",
    sku: "A1-MASALA-500G",
    stock: 5,
    price: 6.49,
    originalPrice: 7.49,
  },
  "variant-noodles": {
    productId: "product-noodles",
    name: "A1 Instant Masala Noodles",
    slug: "a1-instant-masala-noodles",
    categoryName: "Noodles",
    variantName: "5 pack",
    sku: "A1-NOODLES-5PK",
    stock: 10,
    price: 3.99,
    originalPrice: 3.99,
  },
  "variant-paratha": {
    productId: "product-paratha",
    name: "A1 Homestyle Frozen Plain Paratha",
    slug: "a1-homestyle-frozen-paratha",
    categoryName: "Frozen",
    variantName: "20 pack",
    sku: "A1-PARATHA-20PK",
    stock: 4,
    price: 12.5,
    originalPrice: 13.5,
  },
} as const;

type ProductKey = keyof typeof PRODUCTS;
type MockCartOptions = {
  blockedItem?: "missing-variant" | "out-of-stock";
  checkoutPriceChange?: boolean;
  checkoutQuoteDelayMs?: number;
  couponQuoteDelayMs?: number;
  failQuantityUpdate?: boolean;
};

function storedItem(variantId: ProductKey, quantity: number) {
  return {
    productId: PRODUCTS[variantId].productId,
    variantId,
    quantity,
  };
}

async function seedCart(page: Page, items: Array<ReturnType<typeof storedItem>>) {
  await page.addInitScript(
    ({ key, value }) => window.localStorage.setItem(key, JSON.stringify(value)),
    { key: CART_STORAGE_KEY, value: items },
  );
}

async function mockCartQuotes(page: Page, options: MockCartOptions = {}) {
  let requestCount = 0;
  let checkoutRequestCount = 0;

  await page.route("**/api/cart/quote", async (route: Route) => {
    requestCount += 1;
    const request = route.request();
    const isCheckoutRevalidation = request.headers()["x-cart-intent"] === "checkout";

    if (isCheckoutRevalidation) {
      checkoutRequestCount += 1;
    }

    if (options.checkoutQuoteDelayMs && isCheckoutRevalidation) {
      await new Promise((resolve) => setTimeout(resolve, options.checkoutQuoteDelayMs));
    }

    const body = request.postDataJSON() as {
      couponCode?: string;
      items: Array<{ productId: string; variantId: ProductKey; quantity: number }>;
    };

    if (options.couponQuoteDelayMs && body.couponCode && !isCheckoutRevalidation) {
      await new Promise((resolve) => setTimeout(resolve, options.couponQuoteDelayMs));
    }

    if (options.failQuantityUpdate && body.items.some((item) => item.variantId === "variant-rice" && item.quantity > 1)) {
      await route.fulfill({
        contentType: "application/json",
        status: 503,
        body: JSON.stringify({ error: "Temporarily unavailable" }),
      });
      return;
    }

    const quoteItems = body.items.map((item) => {
      const product = PRODUCTS[item.variantId];

      if (options.blockedItem === "missing-variant" && item.variantId === "variant-rice") {
        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: 0,
          requestedQuantity: item.quantity,
          stock: 0,
          unitPrice: 0,
          originalPrice: 0,
          currency: "AUD",
          lineTotal: 0,
          isAvailable: false,
          wasAdjusted: true,
          reason: "The selected pack is no longer available. Remove this item before continuing to checkout.",
          product: {
            name: "Unavailable item",
            slug: "",
            categoryName: "Unavailable",
            imageUrl: null,
            imageAlt: "Unavailable cart item",
          },
          variant: {
            name: "Unavailable",
            sku: "Unavailable",
          },
        };
      }

      const stock = options.blockedItem === "out-of-stock" && item.variantId === "variant-rice" ? 0 : product.stock;
      const quantity = Math.min(item.quantity, stock);
      const unitPrice = options.checkoutPriceChange && isCheckoutRevalidation && item.variantId === "variant-rice"
        ? product.price + 1
        : product.price;
      const isAvailable = stock > 0;

      return {
        productId: product.productId,
        variantId: item.variantId,
        quantity,
        requestedQuantity: item.quantity,
        stock,
        unitPrice,
        originalPrice: product.originalPrice,
        currency: "AUD",
        lineTotal: isAvailable ? quantity * unitPrice : 0,
        isAvailable,
        wasAdjusted: quantity !== item.quantity,
        reason: stock <= 0
          ? "This item is currently out of stock. Remove it before continuing to checkout."
          : quantity !== item.quantity
            ? `Only ${stock} are currently available. Quantity adjusted to ${stock}.`
            : null,
        product: {
          name: product.name,
          slug: product.slug,
          categoryName: product.categoryName,
          imageUrl: null,
          imageAlt: `${product.name} pack`,
        },
        variant: {
          name: product.variantName,
          sku: product.sku,
        },
      };
    });
    const subtotal = quoteItems.reduce((sum, item) => sum + item.lineTotal, 0);
    const code = body.couponCode?.trim().toUpperCase() ?? "";
    const coupon = code === "WELCOME10"
      ? {
          isApplied: true,
          code,
          name: "Welcome offer",
          discount: Math.round(subtotal * 10) / 100,
          message: "Coupon applied.",
        }
      : code
        ? {
            isApplied: false,
            code,
            discount: 0,
            message: code === "EXPIRED" ? "This coupon has expired." : "This coupon code is invalid.",
          }
        : null;
    const discount = coupon?.isApplied ? coupon.discount : 0;

    await route.fulfill({
      contentType: "application/json",
      status: 200,
      body: JSON.stringify({
        items: quoteItems,
        coupon,
        summary: {
          subtotal,
          discount,
          deliveryFee: null,
          estimatedTotal: subtotal - discount,
          currency: "AUD",
        },
      }),
    });
  });

  return {
    getCheckoutRequestCount: () => checkoutRequestCount,
    getQuoteRequestCount: () => requestCount,
  };
}

test.describe("cart page", () => {
  test("shows a focused empty-cart path without summary controls", async ({ page }) => {
    await page.goto("/cart");

    await expect(page.getByRole("heading", { level: 1, name: "Your cart" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Your cart is empty" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start shopping" })).toHaveAttribute("href", "/products");
    await expect(page.getByRole("link", { name: "View weekly offers" })).toHaveAttribute("href", "/offers");
    await expect(page.getByTestId("order-summary")).toHaveCount(0);
    await expect(page.getByTestId("mobile-checkout-bar")).toHaveCount(0);
  });

  test("supports stock-aware quantity, remove undo, and safe clear-cart interactions", async ({ page }) => {
    await seedCart(page, [storedItem("variant-rice", 1), storedItem("variant-oil", 2)]);
    await mockCartQuotes(page);
    await page.goto("/cart");

    await expect(page.getByText("2 items", { exact: true })).toBeVisible();
    await expect(page.getByText("Rice and Grains", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Oil and Ghee", { exact: true })).toHaveCount(0);
    await expect(page.getByText("A1-RICE-5KG", { exact: true })).toHaveCount(0);
    await expect(page.getByText("A1-OIL-2L", { exact: true })).toHaveCount(0);
    const riceQuantity = page.getByLabel("A1 Premium Basmati Rice quantity", { exact: true });
    await expect(riceQuantity).toHaveText("1");
    await expect(page.getByRole("button", { name: "Decrease A1 Premium Basmati Rice quantity" })).toBeDisabled();
    await expect(page.getByRole("link", { name: "A1 Premium Basmati Rice", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Increase A1 Premium Basmati Rice quantity" }).click();
    await expect(riceQuantity).toHaveText("2");
    await expect(page.getByRole("button", { name: "Increase A1 Mustard Cooking Oil quantity" })).toBeDisabled();

    await page.getByRole("button", { name: "Remove A1 Premium Basmati Rice from cart" }).click();
    await expect(page.getByText("A1 Premium Basmati Rice removed", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await expect(page.getByText("2 items", { exact: true })).toBeVisible();

    const clearCartTrigger = page.getByRole("button", { name: "Clear cart", exact: true });
    await expect(page.getByTestId("mobile-checkout-bar")).toHaveCount(1);
    await clearCartTrigger.click();
    const dialog = page.getByRole("dialog", { name: "Clear your cart?" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("This will remove all items from your cart.", { exact: true })).toBeVisible();
    await expect(page.getByTestId("mobile-checkout-bar")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(clearCartTrigger).toBeFocused();
    await expect(page.getByTestId("mobile-checkout-bar")).toHaveCount(1);

    await clearCartTrigger.click();
    await expect(page.getByTestId("mobile-checkout-bar")).toHaveCount(0);
    await page.mouse.click(2, 2);
    await expect(dialog).toBeHidden();
    await expect(clearCartTrigger).toBeFocused();
    await expect(page.getByText("2 items", { exact: true })).toBeVisible();
    await expect(page.getByTestId("mobile-checkout-bar")).toHaveCount(1);

    await clearCartTrigger.click();
    await dialog.getByRole("button", { name: "Clear cart", exact: true }).click();
    await expect(page.getByRole("heading", { level: 2, name: "Your cart is empty" })).toBeVisible();
    await expect(page.getByTestId("mobile-checkout-bar")).toHaveCount(0);
  });

  test("keeps coupon success, removal, and errors compact and recoverable", async ({ page }) => {
    await seedCart(page, [storedItem("variant-rice", 1)]);
    const quoteRequests = await mockCartQuotes(page, { couponQuoteDelayMs: 250 });
    await page.goto("/cart");

    const summaryToggle = page.getByRole("button", { name: /Order summary/ });
    if (await page.evaluate(() => window.matchMedia("(max-width: 1279px)").matches)) {
      await summaryToggle.click();
    }
    await page.getByRole("button", { name: "Have a coupon? Add code" }).click();
    const couponInput = page.getByPlaceholder("Enter coupon code", { exact: true });
    await couponInput.fill(" welcome10 ");
    const quoteCountBeforeCoupon = quoteRequests.getQuoteRequestCount();
    await couponInput.press("Enter");
    await expect(page.getByRole("button", { name: "Applying…", exact: true })).toBeDisabled();
    await couponInput.press("Enter");
    await expect(page.getByText("WELCOME10 applied", { exact: true })).toBeVisible();
    await expect(page.getByText("You saved $2.30", { exact: true })).toBeVisible();
    await expect(page.getByText("Coupon savings", { exact: true })).toBeVisible();
    expect(quoteRequests.getQuoteRequestCount() - quoteCountBeforeCoupon).toBe(1);

    await page.getByRole("button", { name: "Remove", exact: true }).click();
    await expect(page.getByText("Coupon removed. Your total has been updated.", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Have a coupon? Add code" }).click();
    await page.getByPlaceholder("Enter coupon code", { exact: true }).fill("EXPIRED");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(page.getByText("This coupon has expired.", { exact: true })).toBeVisible();
    await page.getByPlaceholder("Enter coupon code", { exact: true }).fill("ANOTHER");
    await expect(page.getByText("This coupon has expired.", { exact: true })).toHaveCount(0);
  });

  test("rolls back an optimistic quantity when authoritative validation fails", async ({ page }) => {
    await seedCart(page, [storedItem("variant-rice", 1)]);
    await mockCartQuotes(page, { failQuantityUpdate: true });
    await page.goto("/cart");

    const riceQuantity = page.getByLabel("A1 Premium Basmati Rice quantity", { exact: true });
    await expect(riceQuantity).toHaveText("1");
    await page.getByRole("button", { name: "Increase A1 Premium Basmati Rice quantity" }).click();
    await expect(riceQuantity).toHaveText("1");
    await expect(page.getByText("Quantity update failed", { exact: true })).toBeVisible();
    await expect(page.getByText("Quantity could not be updated. Try again.", { exact: true })).toBeVisible();
  });

  test("revalidates price before checkout and requires review when it changes", async ({ page }) => {
    await seedCart(page, [storedItem("variant-rice", 1)]);
    await mockCartQuotes(page, { checkoutPriceChange: true });
    await page.goto("/cart");

    await page.getByRole("button", { name: /^(Continue to checkout|Checkout)$/ }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByText("Price updated", { exact: true })).toBeVisible();
    await expect(page.getByText("Your cart was updated before checkout. Review the highlighted changes to continue.", { exact: true })).toBeVisible();
  });

  test("blocks duplicate checkout while the authoritative quote is prepared", async ({ page }) => {
    await seedCart(page, [storedItem("variant-rice", 1)]);
    const { getCheckoutRequestCount } = await mockCartQuotes(page, { checkoutQuoteDelayMs: 400 });
    await page.route("**/checkout", async (route) => {
      await route.fulfill({ contentType: "text/html", body: "<h1>Checkout test destination</h1>" });
    });
    await page.goto("/cart");

    const checkoutButton = page.getByRole("button", { name: /^(Continue to checkout|Checkout)$/ });
    await expect(checkoutButton).toBeEnabled();
    await checkoutButton.click();
    await expect(page.getByRole("button", { name: /^(Checking your cart…|Continuing…)$/ })).toBeDisabled();
    await expect(page).toHaveURL(/\/checkout$/);
    expect(getCheckoutRequestCount()).toBe(1);
  });
});

test.describe("mobile cart", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("shows one compact sticky total above navigation with a collapsed detail summary", async ({ page }) => {
    await seedCart(page, [storedItem("variant-rice", 2), storedItem("variant-oil", 1)]);
    await mockCartQuotes(page);
    await page.goto("/cart");

    const stickyBar = page.getByTestId("mobile-checkout-bar");
    await expect(stickyBar).toBeVisible();
    await expect(stickyBar.getByText("$59.47", { exact: true })).toBeVisible();
    await expect(stickyBar.getByRole("button", { name: "Checkout", exact: true })).toHaveCount(1);
    await expect(stickyBar.getByText("Subtotal", { exact: true })).toHaveCount(0);
    await expect(stickyBar.getByText("Coupon", { exact: true })).toHaveCount(0);

    const summaryToggle = page.getByRole("button", { name: /Order summary/ });
    const summary = page.getByTestId("order-summary");
    const continueShopping = page.getByTestId("mobile-continue-shopping");
    await expect(summaryToggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByText("Subtotal", { exact: true })).toBeHidden();
    await expect(page.getByRole("button", { name: "Continue to checkout" })).toHaveCount(0);
    await expect(summary.getByRole("link", { name: "Continue shopping" })).toHaveCount(0);
    await expect(continueShopping).toBeVisible();
    await expect(continueShopping).toHaveAttribute("href", "/products");

    const continueShoppingGeometry = await page.evaluate(() => {
      const summaryBounds = document.querySelector<HTMLElement>("[data-testid='order-summary']")?.getBoundingClientRect();
      const linkBounds = document.querySelector<HTMLElement>("[data-testid='mobile-continue-shopping']")?.getBoundingClientRect();
      return {
        gap: summaryBounds && linkBounds ? linkBounds.top - summaryBounds.bottom : -1,
        linkHeight: linkBounds?.height ?? 0,
      };
    });
    expect(continueShoppingGeometry.gap).toBeGreaterThanOrEqual(11);
    expect(continueShoppingGeometry.gap).toBeLessThanOrEqual(17);
    expect(continueShoppingGeometry.linkHeight).toBeGreaterThanOrEqual(44);

    const layout = await page.evaluate(() => {
      const bar = document.querySelector<HTMLElement>("[data-testid='mobile-checkout-bar']");
      const nav = document.querySelector<HTMLElement>("nav[aria-label='Bottom navigation']");
      return {
        barBottom: bar?.getBoundingClientRect().bottom ?? 0,
        navTop: nav?.getBoundingClientRect().top ?? 0,
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });
    expect(layout.barBottom).toBeLessThanOrEqual(layout.navTop + 1);
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);

    await summaryToggle.focus();
    await page.keyboard.press("Enter");
    await expect(summaryToggle).toHaveAttribute("aria-expanded", "true");
    await expect(summaryToggle.locator("svg")).toHaveClass(/rotate-180/);
    await expect(page.getByText("Subtotal", { exact: true })).toBeVisible();
    await expect(stickyBar).toBeVisible();
    await expect(page.getByRole("button", { name: "Checkout", exact: true })).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Continue to checkout", exact: true })).toHaveCount(0);
    await expect(page.getByPlaceholder("Enter coupon code", { exact: true })).toHaveCount(0);

    await page.getByRole("button", { name: "Increase A1 Premium Basmati Rice quantity" }).click();
    await expect(stickyBar.getByText("$82.46", { exact: true })).toBeVisible();
    await expect(summaryToggle.getByText("$82.46", { exact: true })).toBeVisible();
    await expect(page.getByText("Estimated total $82.46", { exact: true })).toBeAttached();
  });

  for (const blockedCase of [
    {
      kind: "out-of-stock" as const,
      reason: "This item is currently out of stock. Remove it before continuing to checkout.",
    },
    {
      kind: "missing-variant" as const,
      reason: "The selected pack is no longer available. Remove this item before continuing to checkout.",
    },
  ]) {
    test(`hides checkout and explains a ${blockedCase.kind} item inline`, async ({ page }) => {
      await seedCart(page, [storedItem("variant-rice", 1)]);
      await mockCartQuotes(page, { blockedItem: blockedCase.kind });
      await page.goto("/cart");

      const affectedItem = page.locator("article").filter({ hasText: blockedCase.reason });
      await expect(affectedItem).toBeVisible();
      await expect(affectedItem.getByText(blockedCase.reason, { exact: true })).toBeVisible();
      await expect(page.getByTestId("mobile-checkout-bar")).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Checkout", exact: true })).toHaveCount(0);
    });
  }
});

test.describe("responsive cart refinement", () => {
  test("keeps the complete one-item desktop summary visible without an internal scrollbar", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 760 });
    await seedCart(page, [storedItem("variant-oil", 2)]);
    await mockCartQuotes(page);
    await page.goto("/cart");

    const summary = page.getByTestId("order-summary");
    await expect(summary).toBeVisible();
    await expect(summary.getByRole("button", { name: "Continue to checkout" })).toBeVisible();
    await expect(summary.getByRole("link", { name: "Continue shopping" })).toBeVisible();

    const geometry = await summary.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return {
        bottom: bounds.bottom,
        clientHeight: element.clientHeight,
        overflowY: style.overflowY,
        scrollHeight: element.scrollHeight,
        viewportHeight: window.innerHeight,
      };
    });

    expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight + 1);
    expect(geometry.overflowY).not.toMatch(/auto|scroll/);
    expect(geometry.scrollHeight).toBeLessThanOrEqual(geometry.clientHeight + 1);
  });

  test("returns the desktop summary to normal flow on a short laptop viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 640 });
    await seedCart(page, [storedItem("variant-oil", 2)]);
    await mockCartQuotes(page);
    await page.goto("/cart");

    const summary = page.getByTestId("order-summary");
    const summaryColumn = page.locator(".a1-cart-summary-column");
    await expect(summary).toBeVisible();

    const layout = await page.evaluate(() => {
      const cartItems = document.querySelector<HTMLElement>("[aria-labelledby='cart-items-heading']")?.getBoundingClientRect();
      const summary = document.querySelector<HTMLElement>("[data-testid='order-summary']");
      const summaryBounds = summary?.getBoundingClientRect();
      const summaryColumn = document.querySelector<HTMLElement>(".a1-cart-summary-column");
      const footerBounds = document.querySelector<HTMLElement>("footer")?.getBoundingClientRect();
      return {
        cartItemsRight: cartItems?.right ?? Infinity,
        footerDocumentTop: (footerBounds?.top ?? 0) + window.scrollY,
        summaryDocumentBottom: (summaryBounds?.bottom ?? Infinity) + window.scrollY,
        summaryLeft: summaryBounds?.left ?? -Infinity,
        summaryOverflowY: summary ? getComputedStyle(summary).overflowY : "",
        summaryPosition: summaryColumn ? getComputedStyle(summaryColumn).position : "",
      };
    });

    expect(layout.summaryPosition).toBe("static");
    expect(layout.summaryOverflowY).not.toMatch(/auto|scroll/);
    expect(layout.summaryLeft).toBeGreaterThan(layout.cartItemsRight);
    expect(layout.summaryDocumentBottom).toBeLessThanOrEqual(layout.footerDocumentTop + 1);

    await summary.getByRole("link", { name: "Continue shopping" }).scrollIntoViewIfNeeded();
    await expect(summary.getByRole("link", { name: "Continue shopping" })).toBeVisible();
    await expect(summaryColumn).toBeAttached();
  });

  test("keeps the compact mobile item and expanded coupon controls contained at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await seedCart(page, [storedItem("variant-oil", 1)]);
    await mockCartQuotes(page);
    await page.goto("/cart");

    const cartItem = page.locator("article").filter({ hasText: "A1 Mustard Cooking Oil" }).first();
    await expect(cartItem).toBeVisible();
    const itemBounds = await cartItem.boundingBox();
    expect(itemBounds?.y ?? Infinity).toBeLessThan(520);
    expect(itemBounds?.height ?? Infinity).toBeLessThan(280);

    const productRow = await cartItem.evaluate((item) => {
      const image = item.querySelector<HTMLElement>("a[aria-label^='View ']")?.getBoundingClientRect();
      const name = Array.from(item.querySelectorAll<HTMLElement>("a")).find((link) => link.textContent?.includes("A1 Mustard Cooking Oil"))?.getBoundingClientRect();
      const lineLabel = Array.from(item.querySelectorAll<HTMLElement>("p")).find((element) => element.textContent?.trim() === "Line total");
      const lineValue = lineLabel?.nextElementSibling?.getBoundingClientRect();
      const remove = item.querySelector<HTMLButtonElement>("button[aria-label='Remove A1 Mustard Cooking Oil from cart']")?.getBoundingClientRect();
      return {
        imageHeight: image?.height ?? 0,
        imageWidth: image?.width ?? 0,
        removeHeight: remove?.height ?? 0,
        rowGap: image && name ? name.left - image.right : -1,
        valueBottomDelta: lineValue && remove ? Math.abs(lineValue.bottom - remove.bottom) : Infinity,
      };
    });
    expect(productRow.imageWidth).toBeGreaterThanOrEqual(75);
    expect(productRow.imageWidth).toBeLessThanOrEqual(77);
    expect(productRow.imageHeight).toBe(productRow.imageWidth);
    expect(productRow.rowGap).toBeGreaterThanOrEqual(11);
    expect(productRow.rowGap).toBeLessThanOrEqual(13);
    expect(productRow.removeHeight).toBeGreaterThanOrEqual(44);
    expect(productRow.valueBottomDelta).toBeLessThanOrEqual(5);

    const summaryToggle = page.getByRole("button", { name: /Order summary/ });
    await summaryToggle.click();
    await page.getByRole("button", { name: "Have a coupon? Add code" }).click();

    const couponInput = page.getByPlaceholder("Enter coupon code", { exact: true });
    const applyButton = page.getByRole("button", { name: "Apply", exact: true });
    await expect(couponInput).toBeVisible();
    await expect(applyButton).toBeVisible();

    await page.setViewportSize({ width: 320, height: 500 });
    await couponInput.focus();
    await couponInput.scrollIntoViewIfNeeded();

    const layout = await page.evaluate(() => {
      const input = document.querySelector<HTMLInputElement>("#coupon-code")?.getBoundingClientRect();
      const apply = document.querySelector<HTMLButtonElement>("#cart-coupon-form button[type='submit']")?.getBoundingClientRect();
      const bar = document.querySelector<HTMLElement>("[data-testid='mobile-checkout-bar']")?.getBoundingClientRect();
      const nav = document.querySelector<HTMLElement>("nav[aria-label='Bottom navigation']")?.getBoundingClientRect();
      return {
        applyRight: apply?.right ?? Infinity,
        barBottom: bar?.bottom ?? Infinity,
        clientWidth: document.documentElement.clientWidth,
        inputLeft: input?.left ?? -Infinity,
        navTop: nav?.top ?? -Infinity,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });

    expect(layout.inputLeft).toBeGreaterThanOrEqual(0);
    expect(layout.applyRight).toBeLessThanOrEqual(layout.clientWidth + 1);
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
    expect(Math.abs(layout.barBottom - layout.navTop)).toBeLessThanOrEqual(1);
    await expect(page.getByRole("button", { name: "Checkout", exact: true })).toHaveCount(1);

    await page.setViewportSize({ width: 320, height: 700 });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const footerClearance = await page.evaluate(() => {
      const bar = document.querySelector<HTMLElement>("[data-testid='mobile-checkout-bar']")?.getBoundingClientRect();
      const footer = document.querySelector<HTMLElement>("footer")?.getBoundingClientRect();
      const nav = document.querySelector<HTMLElement>("nav[aria-label='Bottom navigation']")?.getBoundingClientRect();
      const shell = document.querySelector<HTMLElement>(".a1-site-shell-content");
      return {
        fixedLayersHeight: (bar?.height ?? 0) + (nav?.height ?? 0),
        footerGap: bar && footer ? bar.top - footer.bottom : -Infinity,
        shellPaddingBottom: shell ? Number.parseFloat(getComputedStyle(shell).paddingBottom) : 0,
      };
    });
    expect(footerClearance.footerGap).toBeGreaterThanOrEqual(14);
    expect(footerClearance.shellPaddingBottom).toBeGreaterThanOrEqual(footerClearance.fixedLayersHeight + 14);
  });

  test("keeps many items and a long product name scrollable above fixed mobile controls", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 700 });
    await seedCart(page, [
      storedItem("variant-rice", 1),
      storedItem("variant-oil", 1),
      storedItem("variant-lentils", 1),
      storedItem("variant-masala", 1),
      storedItem("variant-noodles", 1),
      storedItem("variant-paratha", 1),
    ]);
    await mockCartQuotes(page);
    await page.goto("/cart");

    await expect(page.getByText("6 items", { exact: true })).toBeVisible();
    const longName = page.getByRole("link", { name: "A1 Heritage Stone-Ground Garam Masala Family Value Pack", exact: true });
    await expect(longName).toBeVisible();
    expect(await longName.evaluate((element) => getComputedStyle(element).webkitLineClamp)).toBe("2");

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const layout = await page.evaluate(() => {
      const bar = document.querySelector<HTMLElement>("[data-testid='mobile-checkout-bar']")?.getBoundingClientRect();
      const footer = document.querySelector<HTMLElement>("footer")?.getBoundingClientRect();
      return {
        footerGap: bar && footer ? bar.top - footer.bottom : -Infinity,
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(layout.horizontalOverflow).toBeLessThanOrEqual(0);
    expect(layout.footerGap).toBeGreaterThanOrEqual(14);
  });

  test("stays contained across the complete responsive cart matrix", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "One browser is sufficient for the CSS viewport matrix.");

    await seedCart(page, [storedItem("variant-oil", 1)]);
    await mockCartQuotes(page);
    await page.goto("/cart");

    for (const width of [320, 360, 375, 390, 412, 430, 540, 768, 1024, 1280, 1440, 1536]) {
      const desktop = width >= 1280;
      await page.setViewportSize({ width, height: desktop ? 760 : 844 });
      await page.evaluate(() => window.scrollTo(0, 0));

      const geometry = await page.evaluate(() => {
        const bar = document.querySelector<HTMLElement>("[data-testid='mobile-checkout-bar']")?.getBoundingClientRect();
        const nav = document.querySelector<HTMLElement>("nav[aria-label='Bottom navigation']")?.getBoundingClientRect();
        return {
          barBottom: bar?.bottom ?? 0,
          clientWidth: document.documentElement.clientWidth,
          navTop: nav?.top ?? 0,
          scrollWidth: document.documentElement.scrollWidth,
        };
      });

      expect(geometry.scrollWidth, `${width}px should not overflow horizontally`).toBeLessThanOrEqual(geometry.clientWidth);

      if (desktop) {
        await expect(page.getByTestId("mobile-checkout-bar")).toBeHidden();
        await expect(page.getByRole("button", { name: "Continue to checkout" })).toBeVisible();
        await expect(page.getByRole("link", { name: "Continue shopping" })).toBeVisible();
      } else {
        await expect(page.getByTestId("mobile-checkout-bar")).toBeVisible();
        await expect(page.getByRole("button", { name: /Order summary/ })).toHaveAttribute("aria-expanded", "false");
        expect(geometry.barBottom, `${width}px checkout bar should clear navigation`).toBeLessThanOrEqual(geometry.navTop + 1);
      }
    }
  });
});
