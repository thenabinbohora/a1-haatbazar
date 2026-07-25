"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart-store";

const CLEARED_ORDERS_STORAGE_KEY = "grocery-store-pro.checkout-cleared.v1";

function clearedOrderNumbers() {
  try {
    const value = JSON.parse(window.localStorage.getItem(CLEARED_ORDERS_STORAGE_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

type OrderSuccessClientProps = {
  orderNumber: string;
  shouldClear: boolean;
};

export function OrderSuccessClient({ orderNumber, shouldClear }: OrderSuccessClientProps) {
  const { clearCart, isReady } = useCart();

  useEffect(() => {
    if (!isReady || !shouldClear || !orderNumber) {
      return;
    }

    const clearedOrders = clearedOrderNumbers();

    if (clearedOrders.includes(orderNumber)) {
      return;
    }

    window.localStorage.setItem(
      CLEARED_ORDERS_STORAGE_KEY,
      JSON.stringify([...clearedOrders, orderNumber].slice(-25)),
    );
    clearCart();
  }, [clearCart, isReady, orderNumber, shouldClear]);

  return null;
}
