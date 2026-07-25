import type { MetadataRoute } from "next";
import { LEGAL_CONFIG } from "@/config/legal";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

type StaticRoute = {
  path: string;
  priority: number;
  changeFrequency: "daily" | "weekly" | "yearly";
  lastModified?: Date;
};

const legalRoutes: StaticRoute[] = Object.values(LEGAL_CONFIG.documents).map((document) => ({
  path: document.path,
  priority: 0.4,
  changeFrequency: "yearly",
  lastModified: new Date(`${document.lastUpdatedIso}T00:00:00+09:30`),
}));

const staticRoutes: StaticRoute[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/products", priority: 0.9, changeFrequency: "daily" },
  { path: "/categories", priority: 0.8, changeFrequency: "weekly" },
  ...legalRoutes,
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: route.lastModified ?? now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE" },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    for (const category of categories) {
      entries.push({
        url: absoluteUrl(`/category/${category.slug}`),
        lastModified: category.updatedAt,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }

    for (const product of products) {
      entries.push({
        url: absoluteUrl(`/products/${product.slug}`),
        lastModified: product.updatedAt,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  } catch {
    // If the catalog is unavailable, still serve the static routes.
  }

  return entries;
}
