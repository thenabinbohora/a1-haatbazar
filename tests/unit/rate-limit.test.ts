import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkRateLimit,
  clearRateLimit,
} from "../../src/lib/rate-limit";

describe("checkRateLimit", () => {
  it("temporarily limits repeated attempts and can be cleared after success", () => {
    const scope = `unit-admin-login-${Date.now()}`;
    const identifier = "account";
    const options = {
      maxAttempts: 2,
      windowMs: 60_000,
    };

    assert.equal(checkRateLimit(scope, identifier, options).limited, false);
    assert.equal(checkRateLimit(scope, identifier, options).limited, false);

    const limited = checkRateLimit(scope, identifier, options);
    assert.equal(limited.limited, true);
    assert.ok(limited.retryAfterSeconds >= 1);

    clearRateLimit(scope, identifier);
    assert.equal(checkRateLimit(scope, identifier, options).limited, false);
  });
});
