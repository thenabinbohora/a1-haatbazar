import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { APP_NAME, BRAND_FAVICON_SRC, BRAND_ICON_SRC } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Authentic Nepali groceries, Indian and Asian pantry staples, fresh vegetables, frozen items, spices, rice, lentils, snacks, beverages, and weekly grocery offers.",
  icons: {
    icon: [
      { url: BRAND_FAVICON_SRC, sizes: "any" },
      { url: BRAND_ICON_SRC, type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: BRAND_ICON_SRC, type: "image/png", sizes: "512x512" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteShell>{children}</SiteShell>
        </div>
      </body>
    </html>
  );
}
