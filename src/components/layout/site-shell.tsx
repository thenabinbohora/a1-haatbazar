"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
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
};

function RouteScrollHandler({ isAdminRoute }: { isAdminRoute: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  useEffect(() => {
    if (isAdminRoute || !pathname || window.location.hash) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    });
  }, [isAdminRoute, pathname, searchKey]);

  return null;
}

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const hasTabBar = shouldShowMobileTabBar(pathname ?? null);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <WishlistProvider>
        <CartDrawerProvider>
          <Suspense fallback={null}>
            <RouteScrollHandler isAdminRoute={Boolean(isAdminRoute)} />
          </Suspense>
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          <main className={`flex-1 ${hasTabBar ? "pb-[calc(var(--a1-bottom-nav-height)+env(safe-area-inset-bottom)+1rem)] xl:pb-0" : ""}`} id="main-content" tabIndex={-1}>
            {children}
          </main>
          <div className={hasTabBar ? "pb-[calc(var(--a1-bottom-nav-height)+env(safe-area-inset-bottom)+4rem)] xl:pb-0" : ""}>
            <Footer />
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
