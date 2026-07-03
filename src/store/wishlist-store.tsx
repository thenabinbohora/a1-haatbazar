"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type WishlistContextValue = {
  isReady: boolean;
  isSaved: (productId: string) => boolean;
  setSaved: (productId: string, saved: boolean) => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSavedIds() {
      try {
        const response = await fetch("/api/wishlist/ids");

        if (!cancelled && response.ok) {
          const data = (await response.json()) as { productIds?: string[] };
          setSavedIds(new Set(Array.isArray(data.productIds) ? data.productIds : []));
        }
      } catch {
        // Guest or offline: hearts simply start unsaved.
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    loadSavedIds();

    return () => {
      cancelled = true;
    };
  }, []);

  const isSaved = useCallback((productId: string) => savedIds.has(productId), [savedIds]);

  const setSaved = useCallback((productId: string, saved: boolean) => {
    setSavedIds((current) => {
      const next = new Set(current);

      if (saved) {
        next.add(productId);
      } else {
        next.delete(productId);
      }

      return next;
    });
  }, []);

  const value = useMemo<WishlistContextValue>(() => ({ isReady, isSaved, setSaved }), [isReady, isSaved, setSaved]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const wishlist = useContext(WishlistContext);

  if (!wishlist) {
    throw new Error("useWishlist must be used inside WishlistProvider.");
  }

  return wishlist;
}
