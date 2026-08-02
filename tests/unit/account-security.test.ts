import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACCOUNT_PASSWORD_POLICY,
  changePasswordInputSchema,
  deleteAccountInputSchema,
  passwordStrengthChecks,
  validatePasswordChangeFields,
} from "../../src/lib/account-security";
import { isSameOriginRequest } from "../../src/lib/request-origin";

describe("account security validation", () => {
  it("rejects empty, mismatched, same, weak, whitespace-padded, and oversized password input", () => {
    const empty = validatePasswordChangeFields({
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
    });
    assert.deepEqual(Object.keys(empty).sort(), [
      "confirmPassword",
      "currentPassword",
      "newPassword",
    ]);

    assert.equal(
      validatePasswordChangeFields({
        confirmPassword: "different",
        currentPassword: "Current!2026",
        newPassword: "Replacement!2026",
      }).confirmPassword,
      "The new passwords do not match.",
    );
    assert.equal(
      validatePasswordChangeFields({
        confirmPassword: "Current!2026",
        currentPassword: "Current!2026",
        newPassword: "Current!2026",
      }).newPassword,
      "Choose a password that is different from your current password.",
    );
    assert.match(
      validatePasswordChangeFields({
        confirmPassword: "short",
        currentPassword: "Current!2026",
        newPassword: "short",
      }).newPassword ?? "",
      /at least/,
    );
    assert.match(
      validatePasswordChangeFields({
        confirmPassword: " Replacement!2026 ",
        currentPassword: " Current!2026 ",
        newPassword: " Replacement!2026 ",
      }).currentPassword ?? "",
      /accidental spaces/,
    );

    const oversized = "x".repeat(ACCOUNT_PASSWORD_POLICY.maxLength + 1);
    assert.equal(
      changePasswordInputSchema.safeParse({
        confirmPassword: oversized,
        currentPassword: "Current!2026",
        newPassword: oversized,
        revokeOtherSessions: true,
      }).success,
      false,
    );
  });

  it("does not echo password values in validation errors or overstate strength", () => {
    const currentPassword = "SENSITIVE-current-sentinel";
    const newPassword = "SENSITIVE-new-sentinel";
    const errors = validatePasswordChangeFields({
      confirmPassword: "mismatch",
      currentPassword,
      newPassword,
    });
    const serialised = JSON.stringify(errors);

    assert.equal(serialised.includes(currentPassword), false);
    assert.equal(serialised.includes(newPassword), false);
    assert.deepEqual(passwordStrengthChecks("symbol!"), {
      length: false,
      lowercase: true,
      number: false,
      symbol: true,
      uppercase: false,
    });
  });

  it("requires structural deletion fields before provider verification", () => {
    assert.equal(
      deleteAccountInputSchema.safeParse({
        acknowledgement: false,
        confirmationText: "delete",
        currentPassword: "",
        verificationCode: "",
      }).success,
      true,
    );
    assert.equal(
      deleteAccountInputSchema.safeParse({
        acknowledgement: true,
        confirmationText: "x".repeat(17),
        currentPassword: "",
        verificationCode: "",
      }).success,
      false,
    );
  });
});

describe("server-action origin validation", () => {
  it("accepts the configured same origin and rejects missing, malformed, cross-origin, and protocol-downgrade requests", () => {
    assert.equal(
      isSameOriginRequest({
        forwardedHost: "shop.example.com",
        forwardedProto: "https",
        host: "internal:3000",
        origin: "https://shop.example.com",
      }),
      true,
    );
    assert.equal(isSameOriginRequest({ host: "shop.example.com" }), false);
    assert.equal(
      isSameOriginRequest({ host: "shop.example.com", origin: "not-a-url" }),
      false,
    );
    assert.equal(
      isSameOriginRequest({
        host: "shop.example.com",
        origin: "https://attacker.example",
      }),
      false,
    );
    assert.equal(
      isSameOriginRequest({
        forwardedHost: "shop.example.com",
        forwardedProto: "https",
        origin: "http://shop.example.com",
      }),
      false,
    );
  });
});
