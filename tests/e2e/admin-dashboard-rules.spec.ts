import { expect, test } from "@playwright/test";
import {
  calculateSalesSummary,
  getVariantStockState,
  isEligibleSalesOrder,
} from "../../src/lib/admin/dashboard-rules";

test.describe("admin dashboard metric rules", () => {
  test("revenue and AOV include only paid valid orders", () => {
    const summary = calculateSalesSummary([
      {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        total: 24.7,
      },
      {
        paymentStatus: "UNPAID",
        status: "PENDING",
        total: 80,
      },
      {
        paymentStatus: "PAID",
        status: "CANCELLED",
        total: 35,
      },
      {
        paymentStatus: "REFUNDED",
        status: "REFUNDED",
        total: 19,
      },
      {
        excludedAsTest: true,
        paymentStatus: "PAID",
        status: "DELIVERED",
        total: 40,
      },
      {
        currency: "USD",
        paymentStatus: "PAID",
        status: "DELIVERED",
        total: 100,
      },
      {
        paymentStatus: "PAID",
        status: "DELIVERED",
        total: 15.3,
      },
    ]);

    expect(summary).toEqual({
      averageOrderValue: 20,
      orderCount: 2,
      revenue: 40,
    });
  });

  test("keeps the documented eligible order statuses aligned", () => {
    expect(
      isEligibleSalesOrder({
        paymentStatus: "PAID",
        status: "OUT_FOR_DELIVERY",
      }),
    ).toBe(true);
    expect(
      isEligibleSalesOrder({
        paymentStatus: "PAID",
        status: "REFUNDED",
      }),
    ).toBe(false);
    expect(
      isEligibleSalesOrder({
        paymentStatus: "AUTHORIZED",
        status: "CONFIRMED",
      }),
    ).toBe(false);
  });

  test("uses each active variant's configured stock threshold", () => {
    expect(
      getVariantStockState({
        active: true,
        lowStockThreshold: 12,
        stock: 10,
      }),
    ).toBe("low");
    expect(
      getVariantStockState({
        active: true,
        lowStockThreshold: 2,
        stock: 3,
      }),
    ).toBe("healthy");
    expect(
      getVariantStockState({
        active: true,
        lowStockThreshold: 5,
        stock: 0,
      }),
    ).toBe("out");
    expect(
      getVariantStockState({
        active: false,
        lowStockThreshold: 5,
        stock: 0,
      }),
    ).toBe("inactive");
  });

  test("returns stable zero values for an empty period", () => {
    expect(calculateSalesSummary([])).toEqual({
      averageOrderValue: 0,
      orderCount: 0,
      revenue: 0,
    });
  });
});
