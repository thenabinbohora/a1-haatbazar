import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_ADMIN_RETURN_PATH,
  safeAdminReturnPath,
} from "../../src/lib/admin-return-path";

describe("safeAdminReturnPath", () => {
  it("preserves only admin destinations", () => {
    const destinations = [
      "/admin",
      "/admin/",
      "/admin/orders",
      "/ADMIN/orders?status=new#queue",
    ];

    for (const destination of destinations) {
      assert.equal(safeAdminReturnPath(destination), destination);
    }
  });

  it("rejects external, customer, malformed, and normalised escape paths", () => {
    const destinations = [
      undefined,
      "",
      "/",
      "/account",
      "/products",
      "https://evil.example/admin",
      "//evil.example/admin",
      "javascript:alert(1)",
      String.raw`\evil.example\admin`,
      "/admin\\orders",
      "/%2f%2fevil.example/admin",
      "/shop/../admin",
      "/admin/../../account",
      "/admin?next=%",
      "/admin\u0000",
    ];

    for (const destination of destinations) {
      assert.equal(
        safeAdminReturnPath(destination),
        DEFAULT_ADMIN_RETURN_PATH,
      );
    }
  });

  it("ignores an unsafe caller fallback", () => {
    assert.equal(
      safeAdminReturnPath("/account", "https://evil.example"),
      DEFAULT_ADMIN_RETURN_PATH,
    );
  });
});
