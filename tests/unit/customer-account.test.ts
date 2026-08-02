import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  accountOrderProgress,
  addressLocalitySummary,
  customerFirstName,
  customerGreeting,
  fulfillmentLabel,
  isActiveOrder,
  orderStatusLabel,
} from "../../src/lib/customer-account";

describe("customer account display rules", () => {
  it("uses a safe greeting when no customer name is available", () => {
    assert.equal(customerFirstName(null), null);
    assert.equal(customerFirstName("   "), null);
    assert.equal(customerGreeting(null), "Welcome back");
    assert.equal(customerGreeting("   "), "Welcome back");
  });

  it("uses only the first part of a real profile name in the greeting", () => {
    assert.equal(customerFirstName("  Priya   Sharma  "), "Priya");
    assert.equal(customerGreeting("Priya Sharma"), "Welcome back, Priya");
  });

  it("maps stored order states to customer-friendly labels", () => {
    assert.equal(orderStatusLabel("PENDING", "PICKUP"), "Order received");
    assert.equal(orderStatusLabel("PROCESSING", "DELIVERY"), "Preparing");
    assert.equal(
      orderStatusLabel("READY_FOR_PICKUP", "PICKUP"),
      "Ready for pickup",
    );
    assert.equal(orderStatusLabel("DELIVERED", "PICKUP"), "Completed");
    assert.equal(orderStatusLabel("DELIVERED", "DELIVERY"), "Delivered");
    assert.equal(orderStatusLabel("CANCELLED", "DELIVERY"), "Cancelled");
  });

  it("builds progress from supported fulfilment states only", () => {
    const pickupProgress = accountOrderProgress("PROCESSING", "PICKUP");
    assert.deepEqual(
      pickupProgress.map((step) => step.label),
      ["Order received", "Confirmed", "Preparing", "Ready for pickup"],
    );
    assert.deepEqual(
      pickupProgress.map((step) => step.state),
      ["complete", "complete", "current", "upcoming"],
    );

    assert.deepEqual(accountOrderProgress("CANCELLED", "DELIVERY"), []);
    assert.deepEqual(accountOrderProgress("REFUNDED", "PICKUP"), []);
  });

  it("identifies active orders and formats non-sensitive address summaries", () => {
    assert.equal(isActiveOrder("PENDING"), true);
    assert.equal(isActiveOrder("OUT_FOR_DELIVERY"), true);
    assert.equal(isActiveOrder("DELIVERED"), false);
    assert.equal(isActiveOrder("CANCELLED"), false);
    assert.equal(fulfillmentLabel("PICKUP"), "Store pickup");
    assert.equal(
      addressLocalitySummary({
        postalCode: "5108",
        state: "SA",
        suburb: "Salisbury",
      }),
      "Salisbury SA 5108",
    );
  });
});
