export const CHECKOUT_COMPLETION_COOKIE_NAME = "gsp_checkout_completion";

export function checkoutCompletionCookieValue(orderNumber: string, marker: string) {
  return `${orderNumber}:${marker}`;
}
