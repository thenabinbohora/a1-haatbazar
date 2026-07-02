export function customerImageUrl(url?: string | null) {
  if (!url || url.includes("/demo-products/")) {
    return null;
  }

  return url;
}
