export function customerProductName(name: string) {
  return name.replace(/^demo\s*[-:]\s*/i, "").replace(/^demo\s+/i, "").trim();
}

export function customerImageAlt(value: string | null | undefined, fallbackName: string) {
  const fallback = `${customerProductName(fallbackName)} product image`;

  if (!value) {
    return fallback;
  }

  return value.replace(/grocery store pro demo image/gi, "A1 Haat Bazar product image").replace(/^demo\s*[-:]\s*/i, "").trim() || fallback;
}
