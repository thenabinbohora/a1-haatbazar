export function isSameOriginRequest(input: {
  forwardedHost?: string | null;
  forwardedProto?: string | null;
  host?: string | null;
  origin?: string | null;
}) {
  if (!input.origin) {
    return false;
  }

  try {
    const origin = new URL(input.origin);
    const expectedHost = (input.forwardedHost ?? input.host ?? "")
      .split(",")[0]
      ?.trim()
      .toLowerCase();
    const expectedProto = input.forwardedProto
      ?.split(",")[0]
      ?.trim()
      .toLowerCase();

    if (!expectedHost || origin.host.toLowerCase() !== expectedHost) {
      return false;
    }

    return !expectedProto || origin.protocol === `${expectedProto}:`;
  } catch {
    return false;
  }
}
