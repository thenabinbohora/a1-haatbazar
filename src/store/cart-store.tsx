"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

const CART_STORAGE_KEY = "grocery-store-pro.cart.v1";

export type CartStorageItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

type AddCartItemInput = CartStorageItem & {
  maxStock?: number;
};

type CartContextValue = {
  items: CartStorageItem[];
  isReady: boolean;
  itemCount: number;
  addItem: (item: AddCartItemInput) => { quantity: number; wasAdjusted: boolean };
  updateQuantity: (variantId: string, quantity: number, maxStock?: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const subscribeToHydration = () => () => {};
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function cleanQuantity(quantity: number, maxStock?: number) {
  const safeQuantity = Number.isFinite(quantity) ? Math.trunc(quantity) : 1;
  const positiveQuantity = Math.max(1, safeQuantity);

  if (maxStock !== undefined) {
    return Math.min(positiveQuantity, Math.max(0, maxStock));
  }

  return Math.min(positiveQuantity, 99);
}

function parseStoredItems(value: string | null): CartStorageItem[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => ({
        productId: typeof item.productId === "string" ? item.productId : "",
        variantId: typeof item.variantId === "string" ? item.variantId : "",
        quantity: cleanQuantity(Number(item.quantity)),
      }))
      .filter((item) => item.productId && item.variantId && item.quantity > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartStorageItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setItems(parseStoredItems(window.localStorage.getItem(CART_STORAGE_KEY)));
      setIsReady(true);
    });
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [isReady, items]);

  const addItem = useCallback((item: AddCartItemInput) => {
    const requestedQuantity = cleanQuantity(item.quantity);
    const existing = items.find((currentItem) => currentItem.variantId === item.variantId);
    const nextQuantity = cleanQuantity((existing?.quantity ?? 0) + requestedQuantity, item.maxStock);
    const result = {
      quantity: nextQuantity,
      wasAdjusted: nextQuantity < (existing?.quantity ?? 0) + requestedQuantity,
    };

    setItems((currentItems) => {
      const currentExisting = currentItems.find((currentItem) => currentItem.variantId === item.variantId);
      const currentNextQuantity = cleanQuantity((currentExisting?.quantity ?? 0) + requestedQuantity, item.maxStock);

      if (currentNextQuantity <= 0) {
        return currentItems.filter((currentItem) => currentItem.variantId !== item.variantId);
      }

      if (currentExisting) {
        return currentItems.map((currentItem) =>
          currentItem.variantId === item.variantId
            ? { ...currentItem, productId: item.productId, quantity: currentNextQuantity }
            : currentItem,
        );
      }

      return [
        ...currentItems,
        {
          productId: item.productId,
          variantId: item.variantId,
          quantity: currentNextQuantity,
        },
      ];
    });

    return result;
  }, [items]);

  const updateQuantity = useCallback((variantId: string, quantity: number, maxStock?: number) => {
    setItems((currentItems) => {
      const nextQuantity = cleanQuantity(quantity, maxStock);

      if (nextQuantity <= 0) {
        return currentItems.filter((item) => item.variantId !== variantId);
      }

      return currentItems.map((item) => (item.variantId === variantId ? { ...item, quantity: nextQuantity } : item));
    });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isReady,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [addItem, clearCart, isReady, items, removeItem, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  if (!cart) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  if (!isHydrated) {
    return {
      ...cart,
      isReady: false,
      itemCount: 0,
      items: [],
    };
  }

  return cart;
}
