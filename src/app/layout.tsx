import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { APP_NAME, BRAND_FAVICON_SRC, BRAND_ICON_SRC } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
  variable: "--font-jakarta",
});

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
    <html className={`${inter.variable} ${plusJakarta.variable}`} data-scroll-behavior="smooth" lang="en">
      <body>
        <div className="flex min-h-screen flex-col">
          <SiteShell>{children}</SiteShell>
        </div>
      </body>
    </html>
  );
}
