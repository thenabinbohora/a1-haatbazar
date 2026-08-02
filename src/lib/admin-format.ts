export const ADMIN_LOCALE = "en-AU";
export const STORE_TIME_ZONE =
  process.env.STORE_TIME_ZONE?.trim() || "Australia/Adelaide";

export function formatAdminCurrency(value: number, currency = "AUD") {
  return new Intl.NumberFormat(ADMIN_LOCALE, {
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value);
}

export function formatAdminNumber(value: number) {
  return new Intl.NumberFormat(ADMIN_LOCALE).format(value);
}

export function formatAdminDate(value: Date | string) {
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    day: "numeric",
    month: "short",
    timeZone: STORE_TIME_ZONE,
    year: "numeric",
  }).format(new Date(value));
}

export function formatAdminDateTime(value: Date | string) {
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    timeZone: STORE_TIME_ZONE,
    year: "numeric",
  }).format(new Date(value));
}

export function formatAdminShortDate(value: Date | string) {
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    day: "numeric",
    month: "short",
    timeZone: STORE_TIME_ZONE,
  }).format(new Date(value));
}

export function formatAdminTime(value: Date | string) {
  return new Intl.DateTimeFormat(ADMIN_LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: STORE_TIME_ZONE,
  }).format(new Date(value));
}
