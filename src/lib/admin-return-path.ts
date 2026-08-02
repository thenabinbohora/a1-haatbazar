export const DEFAULT_ADMIN_RETURN_PATH = "/admin";

const INTERNAL_ORIGIN = "https://a1-haat-bazar.invalid";
const ENCODED_BYTE = /%[0-9a-f]{2}/i;
const INVALID_PERCENT_ENCODING = /%(?![0-9a-f]{2})/i;
const MAX_DECODE_PASSES = 5;
const UNSAFE_CHARACTER = /[\u0000-\u001f\u007f\\]/;

function isAdminPath(pathname: string) {
  const normalizedPathname = pathname.toLowerCase();
  return normalizedPathname === "/admin" || normalizedPathname.startsWith("/admin/");
}

function isSafeRepresentation(value: string) {
  if (!value.startsWith("/") || value.startsWith("//") || UNSAFE_CHARACTER.test(value)) {
    return false;
  }

  try {
    const parsed = new URL(value, INTERNAL_ORIGIN);
    const rawPathname = value.split(/[?#]/, 1)[0];
    return (
      parsed.origin === INTERNAL_ORIGIN
      && parsed.pathname === rawPathname
      && isAdminPath(parsed.pathname)
    );
  } catch {
    return false;
  }
}

function isSafeAdminReturnPath(value: unknown): value is string {
  if (
    typeof value !== "string"
    || value.length === 0
    || INVALID_PERCENT_ENCODING.test(value)
  ) {
    return false;
  }

  let representation = value;
  const seenRepresentations = new Set<string>();

  for (let pass = 0; pass <= MAX_DECODE_PASSES; pass += 1) {
    if (!isSafeRepresentation(representation)) {
      return false;
    }

    if (!ENCODED_BYTE.test(representation)) {
      return true;
    }

    if (pass === MAX_DECODE_PASSES) {
      return false;
    }

    let decoded: string;

    try {
      decoded = decodeURIComponent(representation);
    } catch {
      return false;
    }

    if (decoded === representation) {
      return true;
    }

    if (seenRepresentations.has(decoded)) {
      return false;
    }

    seenRepresentations.add(representation);
    representation = decoded;
  }

  return false;
}

/**
 * Allows only root-relative destinations inside the administrator area.
 * Every decoded representation is validated to prevent encoded redirect bypasses.
 */
export function safeAdminReturnPath(
  value: unknown,
  fallback = DEFAULT_ADMIN_RETURN_PATH,
) {
  const safeFallback = isSafeAdminReturnPath(fallback)
    ? fallback
    : DEFAULT_ADMIN_RETURN_PATH;

  return isSafeAdminReturnPath(value) ? value : safeFallback;
}
