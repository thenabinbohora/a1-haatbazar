"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";
import type { ReactNode } from "react";
import { MiniCartDrawer } from "@/components/cart/mini-cart-drawer";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileTabBar, shouldShowMobileTabBar } from "@/components/layout/mobile-tab-bar";
import { CartProvider } from "@/store/cart-store";
import { CartDrawerProvider } from "@/store/cart-drawer-store";
import { WishlistProvider } from "@/store/wishlist-store";

type SiteShellProps = {
  children: ReactNode;
  isAuthenticated: boolean;
};

export function SiteShell({ children, isAuthenticated }: SiteShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const hasTabBar = shouldShowMobileTabBar(pathname ?? null);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <WishlistProvider isAuthenticated={isAuthenticated}>
        <CartDrawerProvider>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <div className={hasTabBar ? "flex flex-1 flex-col pb-[calc(var(--mobile-bottom-nav-height)+env(safe-area-inset-bottom)+16px)] xl:pb-0" : "flex flex-1 flex-col"}>
            <main className="flex-1" id="main-content" tabIndex={-1}>
              {children}
            </main>
            <Footer hasMobileTabBar={hasTabBar} />
          </div>
          <MiniCartDrawer />
          <Suspense fallback={null}>
            <MobileTabBar />
          </Suspense>
        </CartDrawerProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
