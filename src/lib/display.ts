export function customerProductName(name: string) {
  return name
    .replace(/^demo\s*[-:]\s*/i, "")
    .replace(/^demo\s+/i, "")
    .replace(/\s+/g, " ")
    .replace(/([A-Z]+[0-9]+)(?=[A-Z][a-z])/g, "$1 ")
    .replace(/([a-z])([A-Z][a-z])/g, "$1 $2")
    .replace(/([0-9])([A-Z][a-z])/g, "$1 $2")
    .replace(/([A-Z]{2,})([A-Z][a-z])/g, "$1 $2")
    .trim();
}

export function customerImageAlt(value: string | null | undefined, fallbackName: string) {
  const fallback = `${customerProductName(fallbackName)} product image`;

  if (!value) {
    return fallback;
  }

  return value.replace(/grocery store pro demo image/gi, "A1 Haat Bazar product image").replace(/^demo\s*[-:]\s*/i, "").trim() || fallback;
}
