"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FloatingFeedbackToast } from "@/components/ui/floating-feedback-toast";

type WishlistContextValue = {
  isAuthenticated: boolean;
  isReady: boolean;
  isSaved: (productId: string) => boolean;
  setSaved: (productId: string, saved: boolean) => void;
  showSignInPrompt: () => void;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children, isAuthenticated }: { children: ReactNode; isAuthenticated: boolean }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [hasLoadedSavedIds, setHasLoadedSavedIds] = useState(false);
  const [showAuthNotice, setShowAuthNotice] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

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
          setHasLoadedSavedIds(true);
        }
      }
    }

    loadSavedIds();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const isSaved = useCallback((productId: string) => isAuthenticated && savedIds.has(productId), [isAuthenticated, savedIds]);

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

  const showSignInPrompt = useCallback(() => setShowAuthNotice(true), []);
  const isReady = !isAuthenticated || hasLoadedSavedIds;
  const value = useMemo<WishlistContextValue>(
    () => ({ isAuthenticated, isReady, isSaved, setSaved, showSignInPrompt }),
    [isAuthenticated, isReady, isSaved, setSaved, showSignInPrompt],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
      {showAuthNotice ? (
        <FloatingFeedbackToast
          actionHref={`/login?next=${encodeURIComponent(typeof window === "undefined" ? "/" : `${window.location.pathname}${window.location.search}`)}`}
          actionLabel="Sign in"
          duration={5000}
          message="Sign in to save items to your wishlist."
          onClose={() => setShowAuthNotice(false)}
          placement="top"
          tone="info"
        />
      ) : null}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const wishlist = useContext(WishlistContext);

  if (!wishlist) {
    throw new Error("useWishlist must be used inside WishlistProvider.");
  }

  return wishlist;
}
