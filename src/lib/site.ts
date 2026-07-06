const FALLBACK_SITE_URL = "http://localhost:3000";

function normalizeUrl(value: string) {
  const withProtocol = value.startsWith("http://") || value.startsWith("https://") ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

export function getSiteUrl(): string {
  const configured =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  return configured ? normalizeUrl(configured) : FALLBACK_SITE_URL;
}

export function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
