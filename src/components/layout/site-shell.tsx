"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MiniCartDrawer } from "@/components/cart/mini-cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileTabBar, shouldShowMobileTabBar } from "@/components/layout/mobile-tab-bar";
import { RouteTransitionManager } from "@/components/navigation/route-focus-manager";
import { OverlayProvider } from "@/components/ui/overlay-provider";
import { CartProvider } from "@/store/cart-store";
import { CartDrawerProvider } from "@/store/cart-drawer-store";
import { WishlistProvider } from "@/store/wishlist-store";

type SiteShellProps = {
  children: ReactNode;
  isAuthenticated: boolean;
  sessionKey: string;
};

export function SiteShell({ children, isAuthenticated, sessionKey }: SiteShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute =
    pathname === "/login"
    || pathname === "/register"
    || pathname === "/forgot-password"
    || pathname === "/reset-password"
    || pathname === "/account-deleted";
  const hasTabBar = shouldShowMobileTabBar(pathname ?? null);

  if (isAdminRoute) {
    return (
      <OverlayProvider sessionKey={sessionKey}>
        <RouteTransitionManager />
        {children}
      </OverlayProvider>
    );
  }

  if (isAuthRoute) {
    return (
      <OverlayProvider sessionKey={sessionKey}>
        <RouteTransitionManager />
        {children}
      </OverlayProvider>
    );
  }

  return (
    <OverlayProvider sessionKey={sessionKey}>
      <div className="flex min-h-dvh flex-col">
        <RouteTransitionManager />
        <CartProvider>
          <WishlistProvider isAuthenticated={isAuthenticated}>
            <CartDrawerProvider>
              <a className="skip-link" href="#main-content">
                Skip to content
              </a>
              <Header />
              <div className={hasTabBar ? "a1-site-shell-content flex flex-1 flex-col pb-[calc(var(--mobile-bottom-nav-height)+env(safe-area-inset-bottom)+16px)] xl:pb-0" : "a1-site-shell-content flex flex-1 flex-col"}>
                <main className="flex-1" id="main-content" tabIndex={-1}>
                  {children}
                </main>
                <Footer hasMobileTabBar={hasTabBar} />
              </div>
              <MiniCartDrawer />
              <MobileTabBar />
            </CartDrawerProvider>
          </WishlistProvider>
        </CartProvider>
      </div>
    </OverlayProvider>
  );
}
