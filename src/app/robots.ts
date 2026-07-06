import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api",
          "/account",
          "/cart",
          "/checkout",
          "/wishlist",
          "/login",
          "/reset-password",
          "/auth",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
