import "server-only";

import { headers } from "next/headers";
import { isSameOriginRequest } from "@/lib/request-origin";

export async function verifyServerActionOrigin() {
  const headerStore = await headers();

  return isSameOriginRequest({
    forwardedHost: headerStore.get("x-forwarded-host"),
    forwardedProto: headerStore.get("x-forwarded-proto"),
    host: headerStore.get("host"),
    origin: headerStore.get("origin"),
  });
}
