"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { CartProvider } from "@/store/cart-store";

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

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <Suspense fallback={null}>
        <RouteScrollHandler isAdminRoute={Boolean(isAdminRoute)} />
      </Suspense>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main className="flex-1" id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </CartProvider>
  );
}
