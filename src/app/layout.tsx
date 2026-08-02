import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { APP_NAME, BRAND_FAVICON_SRC, BRAND_ICON_SRC, BRAND_LOGO_SRC } from "@/lib/constants";
import { getCurrentUser } from "@/lib/auth";
import { getSiteUrl } from "@/lib/site";
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

const SITE_DESCRIPTION =
  "Shop authentic Nepali groceries, Indian pantry essentials, Asian products, fresh vegetables, rice, spices, snacks, frozen items, and weekly offers from A1 Haat Bazar in Salisbury, Adelaide.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${APP_NAME} | Authentic Nepali & Asian Groceries in Salisbury Adelaide`,
    template: `%s | ${APP_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: APP_NAME,
  keywords: [
    "Nepali grocery store Salisbury",
    "Asian grocery Adelaide",
    "Indian grocery Salisbury",
    "fresh vegetables Salisbury",
    "Nepali groceries Australia",
    "A1 Haat Bazar",
  ],
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} | Authentic Nepali & Asian Groceries in Salisbury Adelaide`,
    description: SITE_DESCRIPTION,
    locale: "en_AU",
    url: "/",
    images: [{ url: BRAND_LOGO_SRC, alt: `${APP_NAME} logo` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | Authentic Nepali & Asian Groceries in Salisbury Adelaide`,
    description: SITE_DESCRIPTION,
    images: [BRAND_LOGO_SRC],
  },
  icons: {
    icon: [
      { url: BRAND_FAVICON_SRC, sizes: "any" },
      { url: BRAND_ICON_SRC, type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: BRAND_ICON_SRC, type: "image/png", sizes: "512x512" }],
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: "#123C2E",
  viewportFit: "cover",
  width: "device-width",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <html className={`${inter.variable} ${plusJakarta.variable}`} data-scroll-behavior="smooth" lang="en">
      <body>
        <SiteShell
          isAuthenticated={user?.role === "CUSTOMER"}
          sessionKey={user?.id ?? "guest"}
        >
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
