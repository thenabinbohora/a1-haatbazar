"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart-store";

export function OrderSuccessClient() {
  const { clearCart } = useCart();

  useEffect(() => {
    queueMicrotask(() => {
      clearCart();
    });
  }, [clearCart]);

  return null;
}
