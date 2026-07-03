"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

type CartDrawerContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null);

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartDrawerContextValue>(() => ({ isOpen, open, close }), [close, isOpen, open]);

  return <CartDrawerContext.Provider value={value}>{children}</CartDrawerContext.Provider>;
}

export function useCartDrawer() {
  const drawer = useContext(CartDrawerContext);

  if (!drawer) {
    throw new Error("useCartDrawer must be used inside CartDrawerProvider.");
  }

  return drawer;
}
