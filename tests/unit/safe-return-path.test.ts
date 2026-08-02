import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_AUTH_RETURN_PATH,
  safeInternalReturnPath,
} from "../../src/lib/safe-return-path";

describe("safeInternalReturnPath", () => {
  it("defaults missing and non-string destinations to the account page", () => {
    for (const value of [undefined, null, "", 0, false, {}]) {
      assert.equal(safeInternalReturnPath(value), DEFAULT_AUTH_RETURN_PATH);
    }
  });

  it("preserves safe root-relative paths, queries, and fragments", () => {
    const destinations = [
      "/",
      "/account",
      "/account/orders?status=processing#order-123",
      "/checkout?step=delivery&coupon=A1%20SAVE#address",
      "/products?q=rice%20flour",
      "/products?q=50%25-off",
      "/administrator",
      "/shop/admin",
    ];

    for (const destination of destinations) {
      assert.equal(safeInternalReturnPath(destination), destination);
    }
  });

  it("rejects absolute and scheme-based URLs", () => {
    const destinations = [
      "https://evil.example/account",
      "http://evil.example",
      "javascript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "mailto:customer@example.com",
      "tel:+61123456789",
      "blob:https://evil.example/id",
    ];

    for (const destination of destinations) {
      assert.equal(safeInternalReturnPath(destination), DEFAULT_AUTH_RETURN_PATH);
    }
  });

  it("rejects protocol-relative and browser-normalized backslash URLs", () => {
    const destinations = [
      "//evil.example/account",
      "///evil.example/account",
      String.raw`\evil.example\account`,
      String.raw`\\evil.example\account`,
      String.raw`/\evil.example/account`,
      String.raw`/account\orders`,
      "/%5cevil.example/account",
      "/%5C%5Cevil.example/account",
      "/%255cevil.example/account",
      "/%25255cevil.example/account",
      "/%2f%2fevil.example/account",
      "/%252f%252fevil.example/account",
    ];

    for (const destination of destinations) {
      assert.equal(safeInternalReturnPath(destination), DEFAULT_AUTH_RETURN_PATH);
    }
  });

  it("rejects malformed encoding and encoded control characters", () => {
    const destinations = [
      "/account?coupon=%",
      "/account?coupon=%2",
      "/account?coupon=%zz",
      "/%00evil",
      "/%0d%0aLocation%3Ahttps%3A%2F%2Fevil.example",
      "/%250d%250aLocation%253Ahttps%253A%252F%252Fevil.example",
      "/account\u0000",
      "/account\nnext",
      "/account\torders",
    ];

    for (const destination of destinations) {
      assert.equal(safeInternalReturnPath(destination), DEFAULT_AUTH_RETURN_PATH);
    }
  });

  it("rejects excessively nested encoding after a bounded number of passes", () => {
    let destination = "//evil.example/account";

    for (let pass = 0; pass < 40; pass += 1) {
      destination = encodeURIComponent(destination);
    }

    assert.equal(
      safeInternalReturnPath(`/${destination}`),
      DEFAULT_AUTH_RETURN_PATH,
    );
  });

  it("rejects the admin area after case, encoding, and dot-segment normalization", () => {
    const destinations = [
      "/admin",
      "/admin/",
      "/admin/orders?status=new",
      "/ADMIN",
      "/AdMiN/users",
      "/%61dmin",
      "/admin%2Fusers",
      "/shop/../admin",
      "/shop/%2e%2e/admin/orders",
      "/shop/%252e%252e/admin/orders",
    ];

    for (const destination of destinations) {
      assert.equal(safeInternalReturnPath(destination), DEFAULT_AUTH_RETURN_PATH);
    }
  });

  it("uses a safe caller fallback and ignores an unsafe fallback", () => {
    assert.equal(safeInternalReturnPath("https://evil.example", "/products"), "/products");
    assert.equal(
      safeInternalReturnPath("https://evil.example", "//evil.example"),
      DEFAULT_AUTH_RETURN_PATH,
    );
    assert.equal(
      safeInternalReturnPath("https://evil.example", "/admin"),
      DEFAULT_AUTH_RETURN_PATH,
    );
  });
});
